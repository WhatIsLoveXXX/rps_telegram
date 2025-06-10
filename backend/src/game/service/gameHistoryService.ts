import { User, UserStats } from '../../user/model/user';
import { Queryable } from '../../config/types';
import db from '../../config/db';
import { GameResult } from '../gameResult'; // путь подстрой под себя

export class GameHistoryService {
    static async getStatsForUser(userId: number, client: Queryable = db): Promise<UserStats> {
        try {
            const query = `
                SELECT COUNT(*) FILTER (WHERE result = 1) AS wins, COUNT(*) FILTER (WHERE result = 0) AS losses, COUNT(*) FILTER (WHERE result = 3) AS draws,
                        COALESCE(SUM(CASE WHEN result = 1 THEN bet ELSE 0 END), 0)
                            - COALESCE(SUM(CASE WHEN result = 0 THEN bet ELSE 0 END), 0) AS profit
                FROM game_history
                WHERE user_id = $1
                  AND created_at >= date_trunc('month', CURRENT_DATE)
            `;

            const res = await client.query(query, [userId]);
            const row = res.rows[0];

            return {
                wins: Number(row.wins),
                losses: Number(row.losses),
                draws: Number(row.draws),
                profit: parseFloat(row.profit),
            };
        } catch (err) {
            console.error('Error in getStatsForUser:', err);
            throw err;
        }
    }

    static async getTopUsersForCurrentMonth(limit: number = 50, client: Queryable = db): Promise<User[]> {
        const query = `
            SELECT u.id,
                   u.first_name,
                   u.last_name,
                   u.photo_url,
                   u.balance,
                   u.wallet,
                   COUNT(*) FILTER (WHERE gh.result = 1) AS wins, COUNT(*) FILTER (WHERE gh.result = 0) AS losses, COUNT(*) FILTER (WHERE gh.result = 3) AS draws,
                    COALESCE(SUM(CASE WHEN gh.result = 1 THEN gh.bet ELSE 0 END), 0)
                        - COALESCE(SUM(CASE WHEN gh.result = 0 THEN gh.bet ELSE 0 END), 0) AS profit
            FROM users u
                     JOIN game_history gh ON u.id = gh.user_id
            WHERE gh.created_at >= date_trunc('month', CURRENT_DATE)
            GROUP BY u.id, u.first_name, u.last_name, u.photo_url, u.balance, u.wallet
            ORDER BY profit DESC LIMIT $1;
        `;

        const result = await client.query(query, [limit]);

        return result.rows.map(User.fromRow);
    }

    static async saveGameHistory(userId: number, bet: number, result: GameResult, client: Queryable = db): Promise<void> {
        await client.query(`INSERT INTO game_history (user_id, bet, result) VALUES ($1, $2, $3)`, [userId, bet, result]);
    }
}
