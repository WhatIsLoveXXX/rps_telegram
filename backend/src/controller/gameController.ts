import { Server, Socket } from 'socket.io';

export function registerGameHandlers(io: Server, socket: Socket) {
    socket.on('join_battle', async ({ battleId, userId }) => {
        try {
            // Проверяем, сколько игроков уже в комнате
            const clients = await io.in(battleId.toString()).allSockets();
            if (clients.size >= 2) {
                socket.emit('error', 'Battle is full');
                return;
            }

            // Добавляем пользователя в комнату
            socket.join(battleId.toString());
            console.log(`User ${userId} joined battle ${battleId}`);

            // Если теперь в комнате 2 игрока, запускаем игру
            if (clients.size + 1 === 2) {
                io.in(battleId.toString()).emit('start_game', { battleId });
            }
        } catch (error) {
            console.error(error);
            socket.emit('error', 'Could not join battle');
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
}
