import { Server, Socket } from 'socket.io';
import {registerGameHandlers} from '../controller/gameController';

export function initSocket(io: Server) {
    io.on('connection', (socket: Socket) => {
        registerGameHandlers(io, socket);
    });
}