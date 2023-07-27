#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { Command, commands } from './commands';

let argv = yargs(hideBin(process.argv));

Object.values(commands as Record<string, Command>).forEach((command: Command) => {
   argv.command(command.commandName, command.commandDescription, command.setup, command.handler).argv;
});

// argv.demandCommand().argv;
// argv.help