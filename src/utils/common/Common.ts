export const getReleaseBranchName = (): ReleaseBranchConvention => {
    const today = new Date();
    const date = today.getDate() as Day;
    const month = today.toLocaleDateString('default', { month: 'short' }) as ShortMonth;
    const year = today.getFullYear().toString().substring(-2) as Year;

    return `release/${date}${month}${year}`;
};
