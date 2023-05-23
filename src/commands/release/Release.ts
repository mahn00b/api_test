#!/usr/bin/env node

import { Argv } from 'yargs';
import { promisify } from 'util';
import Git from 'simple-git';
import chalk from 'chalk';
import terminalLink from 'terminal-link';
import { oraPromise } from 'ora';
import { exec as rawExec } from 'child_process';
const exec = promisify(rawExec);

import type { Command } from '../.';
import { DEVELOP, MASTER } from '../../constants';

const handler = async () => {

    const git = Git();

    await oraPromise(git.checkout(DEVELOP), { text: chalk.underline.blue('Switching to develop...') });

    await oraPromise(git.pull('origin', DEVELOP, { '--rebase': 'true' }), { text: chalk.underline.blue('Pulling latest from develop...') });

    const today = new Date();
    const date = today.getDate();
    const month = today.toLocaleDateString('default', { month: 'short' });
    const year = today.getFullYear().toString().substring(-2);


    const releaseBranchConvention = `release/${date}${month}${year}`;

    const branchList = await oraPromise(git.branchLocal(), { text: chalk.underline.blue('Checking local branches...') });
    if (branchList.all.includes(releaseBranchConvention)) {
        console.log('\n\n' + chalk.underline.red(`Branch ${releaseBranchConvention} already exists`) + '\n\n');

        await oraPromise(git.deleteLocalBranch(releaseBranchConvention, true), { text: chalk.underline.blue(`Deleting ${releaseBranchConvention}...`) });

    }
    await oraPromise(git.checkoutLocalBranch(releaseBranchConvention), { text: chalk.underline.blue(`Creating release branch: ${releaseBranchConvention}...`) });

    await oraPromise(exec('npm upgrade dw-us-ui'), chalk.underline.blue('Updating dw-us-ui...'));

    await oraPromise(exec('npm run semver'), { text: chalk.underline.blue('Performing version bump...') });
    const { remoteMessages: { all: [_, pullUrl] } } = await oraPromise(git.push('origin', releaseBranchConvention), { text: chalk.underline.blue('Pushing release branch...')});

    const masterUrl = `${pullUrl}&targetBranch=${encodeURIComponent(`refs/heads/${MASTER}`)}`;
    const developUrl = `${pullUrl}&targetBranch=${encodeURIComponent(`refs/heads/${DEVELOP}`)}`;

    console.log(`\n\n${terminalLink('Open PR against master', masterUrl)}`);
    console.log(`${terminalLink('Open PR against develop', developUrl)}\n\n`);
}

const setup = (yargs: Argv) => {
    return yargs
        .usage('Usage: $0 release')
        .example('$0 release', 'Create a release branch')
        .help('h')
        .alias('h', 'help')
        .alias('v', 'version')
        .version(false)
        .option('no-update', {
            alias: 'nu',
            describe: 'Do not update dw-us-ui',
        })
        .strict()
        .demandCommand(0, 0)
}

const commandName = 'release';
const commandDescription = 'Create a release branch';

export default {
    commandName,
    commandDescription,
    setup,
    handler,
} as unknown as Command;
