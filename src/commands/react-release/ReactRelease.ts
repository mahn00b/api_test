#!/usr/bin/env node

import { Argv } from 'yargs';
import Git, { ResetMode } from 'simple-git';
import terminalLink from 'terminal-link';
import standardVersion from 'standard-version';

import type { Command } from '..';
import { DEVELOP, MASTER } from '../../constants';
import { getReleaseBranchName } from '../../utils';

import Logger, { MessageStyle } from '../../utils/logger';
import { isInNodeAppContext, parseDirectWinesDependencies, exec } from '../../utils/node';


const COMMAND_NAME = 'react-release';
const COMMAND_DESCRIPTION = 'Create a release branch and upgrade all direct-wines dependencies to the latest version.';

async function isGitRepo() {
    const git = Git();
    return await git.checkIsRepo();
}

async function updateDevelop() {
    const git = Git();
    await git.checkout(DEVELOP);

    return await git.pull('origin', DEVELOP, { '--rebase': 'true' });
}

async function upgradeNodeModule(lib: string, withYarn: boolean = false) {
    try {
        await exec(`${withYarn ? 'yarn' : 'npm'} upgrade ${lib}`);
    } catch (err) {
        throw new Error(`Could not upgrade ${lib}`);
    }
}

async function stageReleaseBranch(releaseBranchName: string) {
    const git = Git();

    await git.checkoutLocalBranch(releaseBranchName);
}

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

        await exec(`npx standard-version ${dryRun ? '--dry-run' : ''}`);

    } catch (err: any) {
        throw new Error(err);
    }
}

async function pushReleaseBranch(releaseBranchName: string, remoteName: string = 'origin'): Promise<string> {
    const git = Git();

    const { remoteMessages: { all: [_, pullUrl] } } = await git.push(remoteName, releaseBranchName);
    return pullUrl;
}

function outputPullRequestUrl(pullUrl: string) {
    const masterUrl = `${pullUrl}&targetBranch=${encodeURIComponent(`refs/heads/${MASTER}`)}`;
    const developUrl = `${pullUrl}&targetBranch=${encodeURIComponent(`refs/heads/${DEVELOP}`)}`;

    console.log(`\n\n${terminalLink('Open PR against master', masterUrl)}`);
    console.log(`${terminalLink('Open PR against develop', developUrl)}\n\n`);
}

async function verifyRepo(releaseBranchName: string) {
    const git = Git();

    const summary = await git.branchLocal();

    if (summary.all.includes(releaseBranchName)) {
        throw new Error(`
            Branch ${releaseBranchName} already exists
            Please delete it and try again.
        `);
    }

    return summary.current;
}


async function restoreInitState(initBranch: string, releaseBranchName: string) {
    const git = Git();

    await git.reset(ResetMode.HARD);
    await git.checkout(initBranch);
    return await git.deleteLocalBranch(releaseBranchName, true);
}

const handler = async (argv: any) => {
    const defaultStyle: MessageStyle = { underline: true, color: 'green' };
    const errorStyle: MessageStyle = { color: 'red' };
    const noUnderlineStyle: MessageStyle = { color: 'green' };

    const logger = new Logger(console);

    if (!isInNodeAppContext()) {
        throw new Error('Must be running in Nodejs app context');
    }

    if (!await isGitRepo()) {
        throw new Error('Must be running in a git repo');
    }


    const releaseBranchName = getReleaseBranchName();

    const initBranch = await logger.logWithSpinner('Verifying local branches', verifyRepo(releaseBranchName), defaultStyle);

    try {
        await logger.logWithSpinner('Getting the latest from develop', updateDevelop(), defaultStyle);

        if (argv.upgradeDeps) {
            const packages = await logger.logWithSpinner('Checking for direct-wines dependencies', parseDirectWinesDependencies(), defaultStyle);

            if (packages.length) {
                logger.log(`\n\nFound direct-wines dependencies:` , defaultStyle);
                logger.log(packages.map((pkg) => `   -${pkg}` ).join('\n') + '\n\n', noUnderlineStyle);

                logger.log('Beginning upgrade process:', defaultStyle);

                for (const dep of packages) {
                    await logger.logWithSpinner(`Upgrading ${dep}`, upgradeNodeModule(dep, argv.withYarn), defaultStyle);
                }

                logger.log('Successfully updated direct wines packages.\n', defaultStyle)
            } else {
                logger.log('No direct-wines dependencies found', defaultStyle);
            }
        }

        await logger.logWithSpinner('Staging release branch', stageReleaseBranch(releaseBranchName), defaultStyle);

        logger.log('Bumping version', defaultStyle);
        await bumpVersion(argv.dryRun);

        if (!argv.dryRun) {
            const pullUrl = await logger.logWithSpinner('Pushing release branch', pushReleaseBranch(releaseBranchName, argv.remoteName), defaultStyle);
            outputPullRequestUrl(pullUrl);
        } else {
           await logger.logWithSpinner('Dry run complete. Restoring initial state', restoreInitState(initBranch, releaseBranchName), defaultStyle);
        }

    } catch (err) {
        console.error(err)
        logger.log(err as string, errorStyle);
        await logger.logWithSpinner('Restoring initial state', restoreInitState(initBranch, releaseBranchName), errorStyle);
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
            default: false,
            alias: 'u',
        })
        .option('dry-run', {
            describe: 'Runs the necessary commands with no remote changes. Undoing any local changes at the end of the process. Useful for testing.',
            default: false,
            alias: 'dry'
        })
        .option('with-yarn', {
            describe: 'Uses the yarn package-manager to upgrade dependencies.',
            default: false,
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
