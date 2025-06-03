import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { BattleService } from '../service/BattleService';
import db from "../config/db";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('createRoom', async ({ userId, betAmount }) => {
        const client = await db.connect();
        try {
            const room = await BattleService.createRoomWithUser(userId, BigInt(betAmount));
            socket.join(`room-${room.id}`);
            socket.emit('roomCreated', { roomId: room.id });
        } catch (err) {
            console.error(err);
            socket.emit('error', 'Could not create room');
        } finally {
            client.release();
        }
    });

    socket.on('joinRoom', async ({ userId, roomId }) => {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const canJoin = await BattleService.canUserJoin(client, roomId);
            if (!canJoin) {
                socket.emit('roomFull', { roomId });
                return;
            }

            await BattleService.joinRoom(client, roomId, BigInt(userId));
            socket.join(`room-${roomId}`);
            socket.emit('roomJoined', { roomId });

            socket.to(`room-${roomId}`).emit('playerJoined', { userId });

            const isFull = await BattleService.isRoomFull(client, roomId);
            if (isFull) {
                io.to(`room-${roomId}`).emit('startGame', { roomId });
            }
        } catch (err) {
            console.error(err);
            socket.emit('error', 'Could not join room');
        } finally {
            client.release();
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
