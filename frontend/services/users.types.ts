export interface IUser {
  balance: number;
  firstName: string;
  id: number;
  lastName: string;
  photoUrl: string;
  username: string;
  stats: {
    draws: number;
    losses: number;
    profit: number;
    wins: number;
  };
  wallet: null;
}
