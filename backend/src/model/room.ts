export class Battle {
    id: string;
    bet: number;
    createdAt: string;

    constructor(id: string, bet: number, createdAt: string) {
        this.id = id;
        this.bet = bet;
        this.createdAt = createdAt;
    }

    static fromRow(row: any): Battle {
        return new Battle(row.id, row.bet, row.createdAt);
    }
}