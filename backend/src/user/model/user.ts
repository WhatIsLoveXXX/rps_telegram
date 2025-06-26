export class User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    photoUrl: string;
    balance: number;
    wallet: string;
    stats: UserStats | null;

    constructor(
        id: number,
        username: string,
        firstName: string,
        lastName: string,
        photoUrl: string,
        balance: number,
        wallet: string,
        stats: UserStats | null = null
    ) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.photoUrl = photoUrl;
        this.balance = balance;
        this.wallet = wallet;
        this.stats = stats;
    }

    static fromRow(row: any): User {
        const stats: UserStats | null =
            'wins' in row && 'losses' in row && 'draws' in row
                ? {
                      wins: Number(row.wins),
                      losses: Number(row.losses),
                      draws: Number(row.draws),
                      profit: row.profit !== undefined ? Number(row.profit) : undefined,
                      rank: row.rank !== undefined ? Number(row.rank) : undefined,
                  }
                : null;

        return new User(Number(row.id), row.username, row.first_name, row.last_name, row.photo_url, Number(row.balance), row.wallet, stats);
    }
}

export type UserStats = {
    wins: number;
    losses: number;
    draws: number;
    profit?: number;
    gamesCount?: number;
    rank?: number;
};
