export const getReleaseBranchName = () => {
    const today = new Date();
    const date = today.getDate();
    const month = today.toLocaleDateString('default', { month: 'short' });
    const year = today.getFullYear().toString().substring(-2);

    return `release/${date}${month}${year}`;
};