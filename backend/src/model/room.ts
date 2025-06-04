export class Room {
    id: string;
    bet: number;
    createdAt: string;

    constructor(id: string, bet: number, createdAt: string) {
        this.id = id;
        this.bet = bet;
        this.createdAt = createdAt;
    }

    static fromRow(row: any): Room {
        return new Room(row.id, row.bet, row.createdAt);
    }
}