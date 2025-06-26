import { User } from '../../user/model/user';
import { Queryable } from '../../config/types';
import db from '../../config/db';
import { GameResult } from '../gameResult';
import { GameHistoryError, LeaderBoardError } from '../../constants/errors';

export class GameHistoryService {
    static async getTopUsersForCurrentSeason(userId?: number, limit: number = 50, client: Queryable = db) {
        try {
            const query = `
                WITH ranked_users AS (
                    SELECT u.id,
                           u.username,
                           u.first_name,
                           u.last_name,
                           u.photo_url,
                           u.balance,
                           u.wallet,
                           COUNT(*) FILTER (WHERE gh.result = 1) AS wins,
                            COUNT(*) FILTER (WHERE gh.result = 0) AS losses,
                            COUNT(*) FILTER (WHERE gh.result = 3) AS draws,
                            COALESCE(SUM(CASE WHEN gh.result = 1 THEN gh.bet ELSE 0 END), 0)
                                - COALESCE(SUM(CASE WHEN gh.result = 0 THEN gh.bet ELSE 0 END), 0) AS profit,
                           RANK() OVER (ORDER BY 
                           COALESCE(SUM(CASE WHEN gh.result = 1 THEN gh.bet ELSE 0 END), 0)
                         - COALESCE(SUM(CASE WHEN gh.result = 0 THEN gh.bet ELSE 0 END), 0) DESC
                       ) AS rank
                    FROM users u
                             JOIN game_history gh ON u.id = gh.user_id
                    GROUP BY u.id, u.username, u.first_name, u.last_name, u.photo_url, u.balance, u.wallet
                )
                SELECT *
                FROM ranked_users
                WHERE rank <= $1
                    ${userId != null ? 'OR id = $2' : ''}
            `;

            const params = userId != null ? [limit, userId] : [limit];
            const result = await client.query(query, params);
            return result.rows.map(User.fromRow);
        } catch (err) {
            console.error('Error in getTopUsersAndRankForUser:', err);
            throw new LeaderBoardError();
        }
    }

    static async saveGameHistory(userId: number, bet: number, result: GameResult, client: Queryable = db): Promise<void> {
        try {
            await client.query(
                `INSERT INTO game_history (user_id, bet, result)
                                VALUES ($1, $2, $3)`,
                [userId, bet, result]
            );
        } catch (err) {
            console.error('Error in saveGameHistory:', err);
            throw new GameHistoryError();
        }
    }

    static async deleteGameHistory(client: Queryable = db): Promise<void> {
        try {
            await client.query(`DELETE FROM game_history`);
        } catch (err) {
            console.error('Error in deleteGameHistory:', err);
            throw new GameHistoryError();
        }
    }
}
