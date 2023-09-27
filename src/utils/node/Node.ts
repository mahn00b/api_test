import * as fs from 'fs';
import * as path from 'path';
import { exec as rawExec } from 'child_process';
import { promisify } from 'util';

import { DIRECT_WINES_FRONTEND_ORG } from '../../constants';

export const exec = promisify(rawExec);

export function isInNodeAppContext() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  return fs.existsSync(packageJsonPath);
}

export async function parsePackageJson()  {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = fs.readFileSync(packageJsonPath);
  return JSON.parse(packageJson.toString());
}

export async function parseDirectWinesDependencies() {
    try {
        const packageJson = await parsePackageJson();
        const { dependencies, devDependencies } = packageJson;

        const allDeps = { ...dependencies, ...devDependencies };

        return Object.keys(allDeps).filter((lib) => allDeps[lib].includes(DIRECT_WINES_FRONTEND_ORG));
    } catch (err) {
        throw new Error('Could not parse package.json');
    }
}

export const upgradeNodeModule = async (lib: string, withYarn: boolean = false) => {
    try {
        await exec(`${withYarn ? 'yarn' : 'npm'} upgrade ${lib}`);
    } catch (err) {
        throw new Error(`Could not upgrade ${lib}`);
    }
}

