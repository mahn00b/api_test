import { Argv } from 'yargs';
import type { Command } from '..';

import { getContentAndNestedRefs, createContent, ContentfulRequestConfig } from '../../utils/contentful';
import Logger from '../../utils/logger';

import { writeFileSync } from 'fs';

const COMMAND_NAME = 'contentful-deep-copy [content-id]';
const COMMAND_DESCRIPTION = 'Creates a deep copy of the selected contentful content and it\'s nested content dependencies.';

const handler = async (argv: any) => {
    const logger = new Logger(console);

    const { space, environment, managementToken, contentId } = argv;

    const config: ContentfulRequestConfig = {
        space,
        environment,
        managementToken,
    };

    const [content] = await getContentAndNestedRefs(contentId, config);

    if (!content) {
        logger.error(`No content found with id ${contentId}`);
        return;
    }

    const creationStack = [];

};

const setup = async (yargs: Argv) => {
    return yargs
        .usage(`Usage: ${COMMAND_NAME} --space=[space] --environment=[alias] --management-token=[token] [--options]`)
        .help('h')
        .alias('h', 'help')
        .alias('v', 'version')
        .option('space', {
            describe: 'The id of the space to copy content from.',
            requiresArg: true,
        })
        .demandOption('space', 'Please provide a space id to copy content from.')
        .option('environment', {
            describe: 'The alias of the environment to copy content from.',
            alias: 'env',
            requiresArg: true,
        })
        .demandOption('environment', 'Please provide an environment alias to copy content from.')
        .option('management-token', {
            describe: 'The management token to use to authenticate with Contentful.',
            alias: 'management',
            requiresArg: true,
        })
        .demandOption('management-token', 'Please provide an management token to use to authenticate with Contentful.')
        .demandCommand(0, 1, "Please provide a content id to copy.")

};

export default {
    commandName: COMMAND_NAME,
    commandDescription: COMMAND_DESCRIPTION,
    setup,
    handler,
} as unknown as Command;