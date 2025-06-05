import db from '../config/db';
import { Room } from '../model/room';
import {PoolClient} from "pg";
import {UserService} from "./userService";
import {Queryable} from "../config/types";

export class RoomService {
    static async createRoom(userId: number, betAmount: number): Promise<Room> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            const user = await UserService.getUserById(userId, client);
            if (!user) {
                throw new Error('User not found');
            }

            if (user.balance < betAmount) {
                throw new Error('Insufficient balance');
            }
            
            const result = await client.query(
                `INSERT INTO rooms (betAmount) VALUES ($1) RETURNING id`,
                [betAmount]
            );
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

    static async findOpenRooms(): Promise<Room[]> {
        const result = await db.query(`
            SELECT r.id FROM rooms r
            JOIN room_users ru ON r.id = ru.room_id
            GROUP BY r.id
            HAVING COUNT(ru.user_id) = 1
        `);

        return result.rows.map(Room.fromRow);
    }

    //Если чувак создал комнату, но что-то случилось с сокетом и он не присоединился,
    // но комната то уже есть, шо делать?
    static async joinRoom(roomId: number, userId: number, client: Queryable = db): Promise<void> {
        try {
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
        } catch (err) {
            throw err;
        }
    }

    static async leaveRoom(roomId: number, userId: number, client: Queryable = db): Promise<void> {
        try {
            
            await client.query(
                `DELETE FROM room_users WHERE room_id = $1 and user_id = $2`,
                [roomId, userId]
            );
        } catch (err) {
            throw err;
        }
    }

    static async isRoomEmpty(roomId: number, client: Queryable = db): Promise<boolean> {
        const result = await client.query(
                `SELECT COUNT(*) FROM room_users WHERE room_id = $1`,
                [roomId]);
        return result.rows.length === 0;
    }

    static async getRoomById(id: number, client: Queryable = db): Promise<Room | null> {
        const result = await client.query('SELECT * FROM rooms WHERE id = $1', [id]);
        if (result.rows.length === 0) return null;
        return Room.fromRow(result.rows[0]);
    }

    static async deleteRoom(roomId: number, client: Queryable = db): Promise<void> {
        try {
            await client.query(`DELETE FROM rooms WHERE id = $1`, [roomId]);
        } catch (err) {
            throw err;
        }
    }

    static async isUserInRoom(roomId: number, userId: number, client: Queryable = db): Promise<boolean> {
        const result = await client.query(
            `SELECT 1 FROM room_users WHERE room_id = $1 AND user_id = $2 LIMIT 1`,
            [roomId, userId]
        );
        return (result.rowCount ?? 0) > 0;
    }

    static async canUserJoin(client: PoolClient, roomId: number): Promise<boolean> {
        try {
            const result = await client.query(
                `SELECT COUNT(*) < 2 AS can_join FROM room_users WHERE room_id = $1`,
                [roomId]
            );

            return result.rows[0].can_join;
        } catch (err) {
            throw err;
        }
    }

    static async isRoomFull(client: PoolClient, roomId: number): Promise<boolean> {
        const result = await client.query(
            `SELECT COUNT(*) >= 2 AS is_full FROM room_users WHERE room_id = $1`,
            [roomId]
        );
        return result.rows[0].is_full;
    }
}