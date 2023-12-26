import type { Argv} from 'yargs';
import Release from './react-release';
import ContentfulDeepCopy from './contentful-deep-copy';

export declare interface Command {
    commandName: string;
    commandDescription: string;


    setup?: (yargs: Argv) => Argv;
    handler: (argv: any) => Promise<void> | void;
}

export const commands = {
    Release,
    ContentfulDeepCopy
};
