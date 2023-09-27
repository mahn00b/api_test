import Git, { ResetMode } from 'simple-git';


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

export const updateBranch = async (branchName: string, remoteAlias: string = 'origin') => {
    const git = Git();
    await git.checkout(branchName);

    return await git.pull(remoteAlias, branchName, { '--rebase': 'true' });
}

export const getRemoteList = async () => {
    const git = Git();
    return await git.getRemotes(true);
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
