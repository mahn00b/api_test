#!/usr/bin/env node

import { Argv } from 'yargs';
import { RemoteWithRefs, ResetMode } from 'simple-git';
import terminalLink from 'terminal-link';

import type { Command } from '..';
import { DEVELOP, DIRECT_WINES_FRONTEND_ORG, MASTER } from '../../constants';

import { parseDirectWinesDependencies } from '../../utils';
import Logger from '../../utils/logger';
import { isInNodeAppContext, exec, upgradeNodeModule } from '../../utils/node';
import { updateAndRebaseLocalBranch, isGitRepo, doesBranchExist, getCurrentBranchName, resetWorkTreeAndCheckoutBranch, deleteLocalBranch, generateReleaseBranchName, getRemoteList, pushBranch } from '../../utils/git';

const COMMAND_NAME = 'react-release';
const COMMAND_DESCRIPTION = 'Create a release branch and upgrade all direct-wines dependencies to the latest version.';


async function bumpVersion(dryRun: boolean = false) {

    try {
        /** @deprecated usage. Using standard-version like this presents issues around host checking.
         *  Example: Error: Cannot find module '../hosts/bitbucket'
         *
            await standardVersion({
                dryRun,
                infile: `${process.cwd()}/CHANGELOG.md`,
                noVerify: true,
            });

            TODO: Find an alternative to standard-version that doesn't require host checking
         */

        /**
         * we use npx because bundling standard-version is expensive.
         */
        await exec(`npx standard-version ${dryRun ? '--dry-run' : ''}`);

    } catch (err: any) {
        throw new Error(err);
    }
}

function outputPullRequestUrl(pullUrl: string) {
    const masterUrl = `${pullUrl}&targetBranch=${encodeURIComponent(`refs/heads/${MASTER}`)}`;
    const developUrl = `${pullUrl}&targetBranch=${encodeURIComponent(`refs/heads/${DEVELOP}`)}`;

    // TODO: Add a flag to open the PR in the browser
    console.log(`\n\n${terminalLink('Open PR against master', masterUrl)}`);
    console.log(`${terminalLink('Open PR against develop', developUrl)}\n\n`);
}

async function promptForDependencyUpgrade(packages: string[]) {
    const doesRequireUpdates = (await Logger.prompt([{
        type: 'confirm',
        name: 'upgrade',
        message: 'Would you like to upgrade direct-wines dependencies?',
    }])).upgrade;

    if (!doesRequireUpdates) {
        return [];
    }

    const result = await Logger.prompt([{
        type: 'checkbox',
        name: 'upgradeList',
        message: 'Please select the dependencies you would like to upgrade',
        pageSize: 10,
        choices: [...packages, 'None'],
    }])

    console.log('the upgrade', result.upgradeList)

    return result.upgradeList.None ? [] : Object.keys(result.upgradeList).filter((key) => result.upgrade[key]);
}

async function requestNewRemote(remotes: RemoteWithRefs[]): Promise<string> {
    const result = await Logger.prompt([{
        type: 'list',
        name: 'remote',
        message: 'Please select a remote',
        pageSize: 10,
        choices: remotes.map((remote) => ({ name: `${remote.name} ${remote.refs.fetch}`, value: remote.name as string, short: remote.name })),
    }]);

    return result.remote;
}

async function identifyRemote() {
    const remotes = await getRemoteList(DIRECT_WINES_FRONTEND_ORG);

    if (!remotes.length) {
        throw new Error(`
            Could not find a remote configured under the Direct Wines org: ${DIRECT_WINES_FRONTEND_ORG}
            Please add a remote tied to the Direct Wines Github org and try again.
        `);
    }

    const origin = remotes.find((remote) => remote.name === 'origin');

    if (!origin) {

        const result = await Logger.prompt([{
            type: 'confirm',
            name: 'getRemote',
            message: `We couldn't find a remote name origin, would you like to select a different remote?`,
        }]);

        if (result.getRemote) {
            return await requestNewRemote(remotes);
        }

        throw new Error(`
            Could not find a remote named origin.
            Please add a remote named origin and try again.
        `);
    }


   return origin.name;
}

async function verifyRepo(releaseBranchName: string) {
    if (await doesBranchExist(releaseBranchName)) {
        throw new Error(`
            Branch ${releaseBranchName} already exists.
            You might have already bumped this repo. If not, please delete the branch and try again.
        `);
    }
    const currentBranch = await getCurrentBranchName();
    const remote = await identifyRemote();


    return [currentBranch, remote];
}

async function restoreInitState(initBranch: string, releaseBranchName: string) {
   await resetWorkTreeAndCheckoutBranch(initBranch, ResetMode.HARD);

   if (await doesBranchExist(releaseBranchName)) {
    await deleteLocalBranch(releaseBranchName);
   }
}

const handler = async (argv: any) => {
    const logger = new Logger(console);

    // 1. Validate that we're running within the context of a Nodejs app
    if (!isInNodeAppContext()) {
        throw new Error('Must be running in Nodejs app context');
    }

    // 2. Validate that the node project is also a git repo
    // TODO: Validate that this is also a DW repo
    if (!await isGitRepo()) {
        throw new Error('Must be running in a git repo');
    }

    // 3. Generate a release branch for today's date
    // TODO: Accept a date as an argument to format for any date
    const releaseBranchName = generateReleaseBranchName();

    /**
     * 4. Verification & Setup
     *  a) verify repo has a clean work tree
     *  b) verify there is no branch with the same name as the releaseBranch
     *  c) Get the initial branch when the the tool was run (good for reverting dry-runs or error scenarios)
     *  d) Get the upstream remote URL (to push at the end of the process)
     */
    const [initBranch, remote] = await logger.logWithSpinner(() => verifyRepo(releaseBranchName), 'Verifying local branches', 'Branches verified');

    // e) Set up function to reset dry-runs and restore state in the case of errors
    const resetRun = async () => {
        await logger.logWithSpinner(() => restoreInitState(initBranch, releaseBranchName), 'Restoring initial state', 'State restored. Changes are deleted.');
    }

    try {
        /**
         * 5. Staging the release branch
         *     a) Switch to the develop branch
         *     b) Update from remote refs
         */
        await logger.logWithSpinner(() => updateAndRebaseLocalBranch(DEVELOP, remote, argv?.dryRun), 'Getting the latest from develop', 'Develop branch updated');


        // 6. (optional) Search of DW deps and upgrade any as prompted by the user
        if (argv.upgradeDeps) {
            const packages = await logger.logWithSpinner(() => parseDirectWinesDependencies(), 'Checking for direct-wines dependencies', 'Dependencies checked');

            if (packages.length) {
                const packagesToUpgrade = await promptForDependencyUpgrade(packages);

                logger.log('Successfully updated direct wines packages.\n');
                logger.log(packagesToUpgrade.join('\n'));
            } else {
                logger.log('No direct-wines dependencies found');
            }
        }


        // 7. Version Bump - Calculate and print the newest version
        await logger.logWithSpinner(() => bumpVersion(argv.dryRun), 'Bumping version', 'Version bumped');

        if (!argv.dryRun) {
            await logger.logWithSpinner(() => pushBranch(releaseBranchName, argv.remoteName), 'Pushing release branch', 'Release branch pushed')
            // TODO: Update the output to work with Github's push response format
            // outputPullRequestUrl(pullUrl);
            console.log('Update complete!')
        } else {
            logger.info('Dry run complete');
            await resetRun();
        }

    } catch (err) {
        console.error(err)
        logger.error(err as string);
        await resetRun();
    }

}

const setup = (yargs: Argv) => {
    return yargs
        .usage('Usage: $0 react-release')
        .example('$0 react-release', 'Basic usage.')
        .example('$0 react-release --upgrade-deps', COMMAND_DESCRIPTION)
        .help('h')
        .alias('h', 'help')
        .alias('v', 'version')
        .option('remote-name', {
            describe: 'If you are not using origin as your remote name, you can specify it here.',
            default: 'origin',
            alias: 'r',
        })
        .option('upgrade-deps', {
            describe: 'Parses the package.json and upgrades all direct-wines dependencies to the latest version',
            default: true,
            alias: 'u',
        })
        .option('dry-run', {
            describe: 'Runs the necessary commands with no remote changes. Undoing any local changes at the end of the process. Useful for testing.',
            default: true,
            alias: 'dry'
        })
        .option('with-yarn', {
            describe: 'Uses the yarn package-manager to upgrade dependencies.',
            default: true,
            alias: 'yarn',
        })
        .demandCommand(0, 0)
}

export default {
    commandName: COMMAND_NAME,
    commandDescription: COMMAND_DESCRIPTION,
    setup,
    handler,
} as unknown as Command;
