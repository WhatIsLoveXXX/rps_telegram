import { Server, Socket } from 'socket.io';
import { Card } from '../types';
import { GameService } from '../service/gameService';
import { SocketAction } from '../socketEndpoints';

export function registerGameHandlers(io: Server, socket: Socket) {
    socket.on(SocketAction.DISCONNECT, async (reason) => {
        await GameService.disconnect(io, socket, reason);
    });

    socket.on(SocketAction.CONNECT_USER, async ({ roomId, userId }) => {
        await GameService.connectUser(io, socket, roomId, userId);
    });

    socket.on(SocketAction.USER_READY, async ({ roomId, userId }) => {
        await GameService.setUserReady(io, roomId, userId);
    });

    socket.on(SocketAction.MAKE_MOVE, async ({ roomId, userId, selectedCard }: { roomId: string; userId: number; selectedCard: Card }) => {
        await GameService.makeMovement(io, socket, roomId, userId, selectedCard);
    });
}
