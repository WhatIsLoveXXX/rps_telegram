import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './user/route/userRoutes';
import roomRouter from './room/route/roomRoutes';
import leaderboardRouter from './leaderboard/route/leaderBoardRoutes';

import { authMiddleware, defaultErrorMiddleware, showInitDataMiddleware } from './middleware/auth.middleware';
import http from 'http';
import { initSocket } from './socket/socket';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Настрой при необходимости
        methods: ['GET', 'POST'],
    },
});

initSocket(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Auth
app.use(authMiddleware);
app.get('/api', showInitDataMiddleware);
app.use(defaultErrorMiddleware);

//Routes
app.use('/api', userRouter);
app.use('/api', roomRouter);
app.use('/api', leaderboardRouter);

// Start server a
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
