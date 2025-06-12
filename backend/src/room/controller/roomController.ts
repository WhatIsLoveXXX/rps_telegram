import { Request, Response } from 'express';
import { RoomService } from '../service/roomService';
import { CouldntFetchRooms, InsufficientBalanceError, InternalServiceError } from '../../constants/errors';

export class RoomController {
    static async createRoom(req: Request, res: Response) {
        const userId = res.locals.initData?.user?.id;
        const { betAmount } = req.body;

        try {
            const room = await RoomService.createRoom(userId, betAmount);
            res.status(201).json({ roomId: room.id });
        } catch (error) {
            console.error(error);

            if (error instanceof InsufficientBalanceError) {
                return res.status(400).json({ message: error.message });
            }

            res.status(500).json({ message: 'Internal server error' });
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

            if (error instanceof CouldntFetchRooms) {
                return res.status(400).json({ message: error.message });
            }

            res.status(500).json({ message: new InternalServiceError().message });
        }
    }
}
