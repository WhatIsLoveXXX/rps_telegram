export class User {
    id: number;
    name: string;
    balance: number;

    constructor(id: number, name: string, balance: number) {
        this.id = id;
        this.name = name;
        this.balance = balance;
    }

    static fromRow(row: any): User {
        return new User(row.id, row.name, row.balance);
    }
}
