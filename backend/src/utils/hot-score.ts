export function calculateHotScore(score: number, createdAt: Date): number {
    const now = new Date();
    const hoursSincePost = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return score / Math.pow(hoursSincePost + 2, 1.5);
}
