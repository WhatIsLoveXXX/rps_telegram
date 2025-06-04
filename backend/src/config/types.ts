import { QueryResult } from 'pg';

export type Queryable = {
    query: (text: string, params?: any[]) => Promise<QueryResult<any>>;
};
