export enum SocketAction {
    DISCONNECT = 'disconnect',
    CONNECT_USER = 'connect_user',
    USER_READY = 'user_ready',
    MAKE_MOVE = 'make_move',
    GAME_STATE = 'game_state',
    ROUND_START = 'round_start',
    ROUND_RESULT = 'round_result',
    GAME_OVER = 'game_over',
    ERROR = 'error',
}
