export enum GameResult {
    WIN = 1,
    LOSE = 0,
    DRAW = 3,
}

export const GameResultName: Record<GameResult, string> = {
    [GameResult.WIN]: 'Game Win',
    [GameResult.LOSE]: 'Game Loss',
    [GameResult.DRAW]: 'Game Draw'
};

export function getResultByOrder(order: number): GameResult {
    if (!(order in GameResult)) {
        throw new Error(`Invalid order value for GameResult: ${order}`);
    }
    return order as GameResult;
}

export function getResultName(result: GameResult): string {
    return GameResultName[result];
}
