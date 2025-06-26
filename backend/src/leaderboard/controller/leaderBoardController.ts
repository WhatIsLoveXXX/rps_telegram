import { Request, Response } from 'express';
import { GameHistoryService } from '../../game/service/gameHistoryService';
import { InternalServiceError, LeaderBoardError } from '../../constants/errors';
import { RoomService } from '../../room/service/roomService';

export class LeaderboardController {
    static async getLeaderboard(req: Request, res: Response) {
        try {
            const { userId: userIdParam, limit: limitParam } = req.query;
            const userId = userIdParam !== undefined ? Number(userIdParam) : undefined;
            const limit = limitParam !== undefined ? Number(limitParam) : undefined;
            const players = await GameHistoryService.getTopUsersForCurrentSeason(userId, limit);
            return res.json(players);
        } catch (err) {
            if (err instanceof LeaderBoardError) {
                res.status(400).json({ message: err.message });
            } else {
                res.status(500).json({ message: new InternalServiceError().message });
            }
        }
    }
}
