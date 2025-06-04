import db from './db';
import { PoolClient } from 'pg';

type TransactionCallback<T> = (client: PoolClient) => Promise<T>;

export async function withTransaction<T>(fn: TransactionCallback<T>): Promise<T> {
    const client = await db.connect(); // client: PoolClient
    try {
        await client.query('BEGIN');
        const result = await fn(client); // вызываем пользовательскую функцию
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
