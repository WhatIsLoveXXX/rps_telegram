import { Queryable } from '../../config/types';
import db from '../../config/db';
import { GameHistoryService } from './gameHistoryService';

export class SeasonService {
    static async archiveTopUsersAndClearHistory(client: Queryable = db) {
        try {
            await client.query('BEGIN');

            const seasonNumber = await this.getNextSeasonNumber(client);

            const topUsers = await GameHistoryService.getTopUsersForCurrentSeason(undefined, 3, client);

            for (const user of topUsers) {
                await client.query(
                    `
                INSERT INTO top_season_players (user_id, username, profit, wins, losses, draws, season_number)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `,
                    [user.id, user.username, user.stats?.profit, user.stats?.wins, user.stats?.losses, user.stats?.draws, seasonNumber]
                );
            }

            await GameHistoryService.deleteGameHistory(client);
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error archiving leaderboard:', err);
            throw err;
        }
    }

    static async getNextSeasonNumber(client: Queryable = db): Promise<number> {
        const res = await client.query(`SELECT MAX(season_number) AS max FROM top_season_players`);
        return (res.rows[0]?.max || 0) + 1;
    }
}
