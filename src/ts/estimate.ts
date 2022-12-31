export function estimateSecondsUntil(number: number, goal: number, increasePerSecond: number): number {
    return increasePerSecond === 0 ? 0 : (goal - number) / increasePerSecond;
}