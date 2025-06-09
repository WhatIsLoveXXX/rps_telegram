export enum ErrorCode {
    USER_NOT_FOUND = 1001,
    INVALID_WALLET_LENGTH = 1002,

    GAME_RESULT_INVALID_ORDER = 2001,

    TRANSACTION_TIMEOUT = 3001,
    ERROR_TOP_UP = 3002,

    ERR_NOT_SUPPORTED = 4001,
}

const ErrorMessages: Record<ErrorCode, string> = {
    [ErrorCode.ERR_NOT_SUPPORTED]: 'This feature is not supported.',
    [ErrorCode.USER_NOT_FOUND]: 'User not found.',
    [ErrorCode.INVALID_WALLET_LENGTH]: 'Invalid wallet length.',
    [ErrorCode.GAME_RESULT_INVALID_ORDER]: 'Invalid order for game result.',
    [ErrorCode.TRANSACTION_TIMEOUT]: 'Transaction timed out.',
    [ErrorCode.ERROR_TOP_UP]: 'Error occurred during top up.',
};
