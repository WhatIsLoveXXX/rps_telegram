export class RoomUser {
    roomId: number;
    userId: number;

    constructor(roomId: number, userId: number) {
        this.roomId = roomId;
        this.userId = userId;
    }

    static fromRow(row: any): RoomUser {
        return new RoomUser(row.room_id, Number(row.user_id));
    }
}
