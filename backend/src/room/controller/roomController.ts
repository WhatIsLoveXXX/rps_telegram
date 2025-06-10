import { Request, Response } from 'express';
import { RoomService } from '../service/roomService';

export class RoomController {
    static async createRoom(req: Request, res: Response) {
        const userId = res.locals.initData?.user?.id;
        const { betAmount } = req.body;

        try {
            const room = await RoomService.createRoom(userId, betAmount);
            res.status(201).json({ roomId: room.id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Could not create Room' });
        }
    }

    static async findOpenRooms(req: Request, res: Response) {
        try {
            const { betMin, betMax } = req.query;
            const creatorUsernameParam = req.query.creatorUsername;
            const creatorUsername: string | undefined = typeof creatorUsernameParam === 'string' ? creatorUsernameParam : undefined;

            const rooms = await RoomService.findOpenRooms({
                creatorUsername: creatorUsername,
                betMin: betMin ? Number(betMin) : undefined,
                betMax: betMax ? Number(betMax) : undefined,
            });

            res.json(rooms);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Could not fetch Rooms' });
        }
    }

    static async joinRoom(req: Request, res: Response) {
        const userId = res.locals.initData?.user?.id;
        const { roomId } = req.body;

        if (!roomId) {
            return res.status(400).json({ error: 'Invalid or missing roomId' });
        }

        try {
            await RoomService.joinRoom(roomId, userId);
            res.json({ message: 'Joined Room', roomId });
        } catch (error: any) {
            console.error(error);
            const status = error.message === 'Room is full' ? 400 : 500;
            res.status(status).json({ error: error.message || 'Could not join Room' });
        }
    }
}
