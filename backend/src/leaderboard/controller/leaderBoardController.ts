import { Request, Response } from 'express';
import { GameHistoryService } from '../../game/service/gameHistoryService';
import { InternalServiceError, LeaderBoardError } from '../../constants/errors';

export class LeaderboardController {
    static async getLeaderboard(req: Request, res: Response) {
        try {
            const players = await GameHistoryService.getTopUsersForCurrentSeason();
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
