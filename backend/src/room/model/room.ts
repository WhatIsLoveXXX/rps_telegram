export class Room {
    id: string;
    bet: number;
    creatorId: number;
    createdAt: string;

    constructor(id: string, bet: number, creatorId: number, createdAt: string) {
        this.id = id;
        this.bet = bet;
        this.creatorId = creatorId;
        this.createdAt = createdAt;
    }

    static fromRow(row: any): Room {
        return new Room(row.id, parseFloat(row.bet), Number(row.creator_id), Date.parse(row.createdAt).toString());
    }
}
