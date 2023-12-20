import Git, { ResetMode, TaskOptions } from 'simple-git';


export const generateReleaseBranchName = (): ReleaseBranchConvention => {
    const today = new Date();
    const date = today.getDate() as Day;
    const month = today.toLocaleDateString('default', { month: 'short' }) as ShortMonth;
    const year = today.getFullYear().toString().substring(-2) as Year;

    return `release/${date}${month}${year}`;
};

export const isGitRepo = async () => {
    const git = Git();
    return await git.checkIsRepo();
}

export const updateAndRebaseLocalBranch = async (branchName: string, remoteAlias: string = 'origin', dryRun: boolean = false) => {
    const git = Git();
    await git.checkout(branchName);

    const opts: TaskOptions = { '--rebase': 'true' };

    if (dryRun) {
        opts['--dry-run'] = null;
    }

    return await git.pull(remoteAlias, branchName, opts);
}

/**
 * @description Get a list of all remotes. Optionally filter by a search string.
 * @param queryString A search string to filter the remote list by
 * @returns
 */
export const getRemoteList = async (queryString?: string) => {
    const git = Git();

    const remotes = await git.getRemotes(true);

    if (queryString) {
        return remotes.filter((remote) => remote.name.includes(queryString) || remote.refs.push.includes(queryString));
    }

    return remotes;
};

export const getCurrentBranchName = async (): Promise<string> => {
   const git = Git();

    const summary = await git.branchLocal();

   return summary.current;
};

export const doesBranchExist = async (branchName: string): Promise<boolean> => {
   const git = Git();

    const summary = await git.branchLocal();

    if (summary.all.includes(branchName)) {
        return true;
    }

    return false;
};

export const resetWorkTreeAndCheckoutBranch = async (branchName: string, resetMode: ResetMode = ResetMode.HARD) => {
    const git = Git();

    await git.reset(resetMode);
    await git.checkout(branchName);
};

export const deleteLocalBranch = async (branchName: string) => {
    const git = Git();

    return await git.deleteLocalBranch(branchName, true);
}

export const checkoutLocalBranch = async (branchName: string) => {
    const git = Git();

    await git.checkoutLocalBranch(branchName);
};

export const createAndCheckoutLocalBranch = async (branchName: string) => {
    const git = Git();

    await git.checkoutLocalBranch(branchName);
};

export const pushBranch = async (releaseBranchName: string, remoteName: string = 'origin'): Promise<string> => {
    const git = Git();

    const { remoteMessages } = await git.push(remoteName, releaseBranchName);
    return remoteMessages.all.join('\n');
}
