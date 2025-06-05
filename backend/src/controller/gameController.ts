import { Server, Socket } from 'socket.io';
import {UserService} from "../service/userService";
import {RoomService} from "../service/roomService";
import db from "../config/db";

export function registerGameHandlers(io: Server, socket: Socket) {
    socket.on('connect_user', async ({ roomId, userId }) => {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const room = await RoomService.getRoomById(roomId, client);
            if (!room) {
                socket.emit('error', 'Room not found');
                await client.query('ROLLBACK');
                return;
            }

            const user = await UserService.getUserById(userId, client);
            if (!user) {
                socket.emit('error', 'User not found');
                await client.query('ROLLBACK');
                return;
            }
            
            const alreadyInRoom = await RoomService.isUserInRoom(roomId, userId, client);

            if (!alreadyInRoom) {
                if (user.balance < room.bet) {
                    socket.emit('error', 'Insufficient balance');
                    await client.query('ROLLBACK');
                    return;
                }
                
                await RoomService.joinRoom(roomId, userId, client)
            }

            await client.query('COMMIT');

            socket.data.roomId = roomId;
            socket.data.userId = userId;

            socket.join(roomId.toString());

            const clientSize = io.of(roomId.toString()).sockets.size;
            if (clientSize === 2) {
                io.in(roomId.toString()).emit('start_game', { roomId });
            }

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(error);
            socket.emit('error', 'Could not join room');
        } finally {
            client.release();
        }
    });

    socket.on('disconnect', async (reason) => {
        const roomId = socket.data.roomId;
        const userId = socket.data.userId;

        if (!roomId || !userId) return;

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            await RoomService.leaveRoom(roomId, userId, client);
            const isRoomEmpty = await RoomService.isRoomEmpty(roomId);
            
            if (isRoomEmpty) {
                await RoomService.deleteRoom(roomId, client);
            }

            await client.query('COMMIT');
            console.log(`User ${userId} removed from room ${roomId} (reason: ${reason})`);
            if (isRoomEmpty) {
                console.log(`Room ${roomId} was removed`);
            }
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error on disconnect:', error);
        } finally {
            client.release();
        }
    });
}
