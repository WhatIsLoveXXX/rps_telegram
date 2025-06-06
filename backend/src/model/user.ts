export class User {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl: string;
    balance: number;
    wallet: string;

    constructor(id: number, firstName: string, lastName: string, photoUrl: string, balance: number, wallet: string) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.photoUrl = photoUrl;
        this.balance = balance;
        this.wallet = wallet;
    }

    static fromRow(row: any): User {
        return new User(Number(row.id), row.first_name, row.last_name, row.photo_url, Number(row.balance), row.wallet);
    }
}
