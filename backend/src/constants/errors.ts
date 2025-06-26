export class UserNotFoundError extends Error {
    constructor(message = 'User not found') {
        super(message);
        this.name = 'UserNotFoundError';
    }
}

export class RoomNotFoundError extends Error {
    constructor(message = 'Room not found') {
        super(message);
        this.name = 'RoomNotFoundError';
    }
}

export class RoomJoinError extends Error {
    constructor(message = "Couldn't join to room") {
        super(message);
        this.name = 'RoomJoinError';
    }
}

export class RoomIsFullError extends Error {
    constructor(message = 'Room is full') {
        super(message);
        this.name = 'RoomIsFull';
    }
}

export class CouldntFetchRooms extends Error {
    constructor(message = 'Could not fetch Rooms') {
        super(message);
        this.name = 'CouldntFetchRooms';
    }
}

export class InsufficientBalanceError extends Error {
    constructor(message = 'Insufficient balance') {
        super(message);
        this.name = 'InsufficientBalanceError';
    }
}

export class TransactionNotFoundError extends Error {
    constructor(message = 'Transaction not found') {
        super(message);
        this.name = 'TransactionNotFoundError';
    }
}

export class TransactionBouncedError extends Error {
    constructor(message = 'Transaction was bounced') {
        super(message);
        this.name = 'TransactionBouncedError';
    }
}

export class CustomerNotEnoughFunds extends Error {
    constructor(message = 'There was an error with the withdraw, please contact the administrator') {
        super(message);
        this.name = 'CustomerNotEnoughFunds';
    }
}

export class GameBrokenError extends Error {
    constructor(message = 'Game was broken, please contact the administrator') {
        super(message);
        this.name = 'GameBrokenError';
    }
}

export class LeaderBoardError extends Error {
    constructor(message = "Leader board couldn't be displayed now") {
        super(message);
        this.name = 'LeaderBoardError';
    }
}

export class InternalServiceError extends Error {
    constructor(message = 'Internal service error') {
        super(message);
        this.name = 'InternalServiceError';
    }
}

export class UserStatsError extends Error {
    constructor(message = 'User stats error') {
        super(message);
        this.name = 'UserStatsError';
    }
}

export class GameHistoryError extends Error {
    constructor(message = 'Game history error') {
        super(message);
        this.name = 'GameHistoryError';
    }
}

export class BalanceOperationError extends Error {
    constructor(message = 'Balance operation error') {
        super(message);
        this.name = 'BalanceOperationError';
    }
}
