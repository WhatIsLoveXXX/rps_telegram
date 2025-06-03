import db from '../config/db';
import { Battle } from '../model/room';
import {PoolClient} from "pg";

export class BattleService {
    static async createBattleWithUser(userId: number, betAmount: bigint): Promise<Battle> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `INSERT INTO rooms (betAmount) VALUES ($1) RETURNING id`,
                [betAmount]
            );
            const battle = Battle.fromRow(result.rows[0]);

            await client.query(
                `INSERT INTO room_users (Battle_id, user_id) VALUES ($1, $2)`,
                [battle.id, userId]
            );

            await client.query('COMMIT');
            return battle;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    static async findOpenBattles(): Promise<Battle[]> {
        const result = await db.query(`
            SELECT r.id FROM Battles r
            JOIN Battle_users ru ON r.id = ru.Battle_id
            GROUP BY r.id
            HAVING COUNT(ru.user_id) = 1
        `);

        return result.rows.map(Battle.fromRow);
    }

    static async joinBattle(client: PoolClient, BattleId: number, userId: bigint): Promise<void> {
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `SELECT COUNT(*) FROM Battle_users WHERE Battle_id = $1`,
                [BattleId]
            );

            if (parseInt(result.rows[0].count, 10) >= 2) {
                throw new Error('Battle is full');
            }

            await client.query(
                `INSERT INTO Battle_users (Battle_id, user_id) VALUES ($1, $2)`,
                [BattleId, userId]
            );
        } catch (err) {
            throw err;
        }
    }

    static async deleteBattle(client: PoolClient, BattleId: number): Promise<void> {
        try {
            await client.query(`DELETE FROM Battle_users WHERE Battle_id = $1`, [BattleId]);
            await client.query(`DELETE FROM Battles WHERE id = $1`, [BattleId]);
        } catch (err) {
            throw err;
        }
    }

    static async canUserJoin(client: PoolClient, BattleId: number): Promise<boolean> {
        try {
            const result = await client.query(
                `SELECT COUNT(*) < 2 AS can_join FROM BattleUsers WHERE BattleId = $1`,
                [BattleId]
            );

            return result.rows[0].can_join;
        } catch (err) {
            throw err;
        }
    }

    static async isBattleFull(client: PoolClient, BattleId: number): Promise<boolean> {
        const result = await client.query(
            `SELECT COUNT(*) >= 2 AS is_full FROM BattleUsers WHERE BattleId = $1`,
            [BattleId]
        );
        return result.rows[0].is_full;
    }
}