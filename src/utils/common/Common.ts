import { DIRECT_WINES_FRONTEND_ORG } from "../../constants";
import { parsePackageJson } from "../node";

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
