import type { Argv} from 'yargs';
import Release from './react-release';

export declare interface Command {
    commandName: string;
    commandDescription: string;


    setup?: (yargs: Argv) => Argv;
    handler: (argv: any) => Promise<void> | void;
}

export const commands = {
    Release,
};
