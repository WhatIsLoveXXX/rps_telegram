import db from '../config/db';
import { Room } from '../model/room';

export class RoomService {
    static async createRoomWithUser(userId: number): Promise<Room> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `INSERT INTO rooms DEFAULT VALUES RETURNING id`
            );
            const room = Room.fromRow(result.rows[0]);

            await client.query(
                `INSERT INTO room_users (room_id, user_id) VALUES ($1, $2)`,
                [room.id, userId]
            );

            await client.query('COMMIT');
            return room;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    static async findOpenRooms(): Promise<Room[]> {
        const result = await db.query(`
            SELECT r.id FROM rooms r
            JOIN room_users ru ON r.id = ru.room_id
            GROUP BY r.id
            HAVING COUNT(ru.user_id) = 1
        `);

        return result.rows.map(Room.fromRow);
    }

    static async joinRoom(roomId: number, userId: number): Promise<void> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `SELECT COUNT(*) FROM room_users WHERE room_id = $1`,
                [roomId]
            );

            if (parseInt(result.rows[0].count, 10) >= 2) {
                throw new Error('Room is full');
            }

            await client.query(
                `INSERT INTO room_users (room_id, user_id) VALUES ($1, $2)`,
                [roomId, userId]
            );

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    static async deleteRoom(roomId: number): Promise<void> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const check = await client.query(
                `SELECT id FROM rooms WHERE id = $1`,
                [roomId]
            );
            if (check.rowCount === 0) {
                throw new Error('Room not found');
            }

            await client.query(`DELETE FROM room_users WHERE room_id = $1`, [roomId]);
            await client.query(`DELETE FROM rooms WHERE id = $1`, [roomId]);

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}