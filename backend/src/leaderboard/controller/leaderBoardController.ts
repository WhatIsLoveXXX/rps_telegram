import { Request, Response } from 'express';
import { GameHistoryService } from '../../game/service/gameHistoryService';
import { UserService } from '../../user/service/userService';

export class LeaderboardController {
    static async getLeaderboard(req: Request, res: Response) {
        try {
            const players = await GameHistoryService.getTopUsersForCurrentMonth();
            return res.json(players);
        } catch (err) {
            console.error('Failed to get leader board:', err);
            return res.status(401).json({ error: err });
        }
    }
}
