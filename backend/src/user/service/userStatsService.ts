import { UserStats } from '../model/user';
import db from '../../config/db';
import { Queryable } from '../../config/types';
import { UserStatsError } from '../../constants/errors';

export class UserStatsService {
    static async updateUserStats(userId: number, bet: number, result: number, client: Queryable = db): Promise<UserStats> {
        try {
            const query = `
                SELECT wins, losses, draws, profit
                FROM user_stats
                WHERE user_id = $1
            `;
            const res = await client.query(query, [userId]);
            let userStats = res.rows[0];

            if (!userStats) {
                userStats = {
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    profit: 0.0,
                };
            }

            switch (result) {
                case 1:
                    userStats.wins += 1;
                    userStats.profit += bet;
                    break;
                case 0:
                    userStats.losses += 1;
                    userStats.profit -= bet;
                    break;
                case 3:
                    userStats.draws += 1;
                    break;
                default:
                    break;
            }

            const updateQuery = `
                INSERT INTO user_stats (user_id, wins, losses, draws, profit, updated_at)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id) 
                DO UPDATE SET
                    wins = EXCLUDED.wins,
                    losses = EXCLUDED.losses,
                    draws = EXCLUDED.draws,
                    profit = EXCLUDED.profit,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `;
            const updatedRes = await client.query(updateQuery, [
                userId,
                userStats.wins,
                userStats.losses,
                userStats.draws,
                userStats.profit,
            ]);

            const row = updatedRes.rows[0];

            return {
                wins: row?.wins ?? 0,
                losses: row?.losses ?? 0,
                draws: row?.draws ?? 0,
                profit: Number(row?.profit ?? 0),
            };
        } catch (err) {
            console.error('Error in updateUserStats:', err);
            throw new UserStatsError();
        }
    }

    static async getUserStats(userId: number, client: Queryable = db): Promise<UserStats> {
        try {
            const query = `
                SELECT wins, losses, draws, profit
                FROM user_stats
                WHERE user_id = $1
            `;
            const res = await client.query(query, [userId]);
            const row = res.rows[0];
            console.log('getUserStats row', row);
            const wins = row?.wins ?? 0;
            const losses = row?.losses ?? 0;
            const draws = row?.draws ?? 0;

            return {
                wins: row?.wins ?? 0,
                losses: row?.losses ?? 0,
                draws: row?.draws ?? 0,
                profit: Number(row?.profit ?? 0),
                gamesCount: wins + losses + draws,
            };
        } catch (err) {
            console.error('Error in getUserStats:', err);
            throw new UserStatsError();
        }
    }
}
