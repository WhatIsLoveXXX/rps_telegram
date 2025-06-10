import db from '../../config/db';
import { Room } from '../model/room';
import { UserService } from '../../user/service/userService';
import { Queryable } from '../../config/types';

export class RoomService {
    static async createRoom(userId: number, betAmount: number): Promise<Room> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const user = await UserService.getUserById(userId, false, client);
            if (!user) {
                throw new Error('User not found');
            }

            if (user.balance < betAmount) {
                throw new Error('Insufficient balance');
            }

            const result = await client.query(`INSERT INTO rooms (bet_amount, creator_id) VALUES ($1, $2) RETURNING id`, [
                betAmount,
                userId,
            ]);
            const room = Room.fromRow(result.rows[0]);
            await client.query('COMMIT');
            return room;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    static async findOpenRooms(options?: { creatorUsername?: string; betMin?: number; betMax?: number }): Promise<any[]> {
        const params: any[] = [];
        let whereClauses: string[] = [];

        if (options?.creatorUsername != null) {
            params.push(options.creatorUsername);
            whereClauses.push(`u.username = $${params.length}`);
        }

        if (options?.betMin != null) {
            params.push(options.betMin);
            whereClauses.push(`r.bet_amount >= $${params.length}`);
        }

        if (options?.betMax != null) {
            params.push(options.betMax);
            whereClauses.push(`r.bet_amount <= $${params.length}`);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const query = `
            SELECT
                r.id,
                r.creator_id,
                r.bet_amount,
                r.created_at,
                u.username AS creator_username,
                u.photo_url AS creator_photo_url
            FROM rooms r
                     JOIN users u ON r.creator_id = u.id
                     JOIN room_users ru ON r.id = ru.room_id
                ${whereSql}
            GROUP BY r.id, u.username, u.photo_url
            HAVING COUNT(ru.user_id) = 1
            ORDER BY r.created_at DESC
                LIMIT 50
        `;

        const result = await db.query(query, params);

        return result.rows.map((row) => ({
            id: row.id,
            creatorId: row.creator_id,
            betAmount: row.bet_amount,
            createdAt: row.created_at,
            creatorUsername: row.creator_username,
            creatorPhotoUrl: row.creator_photo_url,
        }));
    }

    static async joinRoom(roomId: string, userId: number, client: Queryable = db): Promise<void> {
        try {
            const result = await client.query(`SELECT COUNT(*) FROM room_users WHERE room_id = $1`, [roomId]);

            if (parseInt(result.rows[0].count, 10) >= 2) {
                throw new Error('Room is full');
            }

            await client.query(`INSERT INTO room_users (room_id, user_id) VALUES ($1, $2)`, [roomId, userId]);
        } catch (err) {
            throw err;
        }
    }

    static async leaveRoom(roomId: number, userId: number, client: Queryable = db): Promise<void> {
        try {
            await client.query(`DELETE FROM room_users WHERE room_id = $1 and user_id = $2`, [roomId, userId]);
        } catch (err) {
            throw err;
        }
    }

    static async isRoomEmpty(roomId: number, client: Queryable = db): Promise<boolean> {
        const result = await client.query(`SELECT COUNT(*) FROM room_users WHERE room_id = $1`, [roomId]);
        return Number(result.rows[0].count) === 0;
    }

    static async getRoomById(id: string, client: Queryable = db): Promise<Room | null> {
        const result = await client.query('SELECT * FROM rooms WHERE id = $1', [id]);
        if (result.rows.length === 0) return null;
        return Room.fromRow(result.rows[0]);
    }

    static async deleteRoom(roomId: string, client: Queryable = db): Promise<void> {
        try {
            await client.query(`DELETE FROM rooms WHERE id = $1`, [roomId]);
        } catch (err) {
            throw err;
        }
    }

    static async isRoomCreator(roomId: string, userId: number, client: Queryable = db): Promise<boolean> {
        const result = await client.query(`SELECT 1 FROM rooms WHERE id = $1 AND creator_id = $2 LIMIT 1`, [roomId, userId]);

        return !!result && typeof result.rowCount === 'number' && result.rowCount > 0;
    }

    static async changeCreatorIfNeeded(roomId: string, userId: number, client: Queryable = db): Promise<void> {
        const isCreator = await RoomService.isRoomCreator(roomId, userId, client);
        if (!isCreator) return;

        const res = await client.query(`SELECT user_id FROM room_users WHERE room_id = $1 LIMIT 1`, [roomId]);

        if (res.rows.length > 0) {
            const newCreatorId = res.rows[0].user_id;
            await client.query(`UPDATE rooms SET creator_id = $1 WHERE id = $2`, [newCreatorId, roomId]);
            console.log(`Room ${roomId}: creator changed to user ${newCreatorId}`);
        }
    }
}
