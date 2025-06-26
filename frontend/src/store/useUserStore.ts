import { create } from "zustand";
import { IUser } from "../../services/users.types";
import { getUser } from "../../services/users.api";
import { toast } from "react-toastify";

export interface State {
  user: IUser;
  isLoading: boolean;
}

/**
 * Initial state with default values
 */
const initialState: State = {
  user: {
    id: 0,
    balance: 0,
    firstName: "",
    lastName: "",
    photoUrl: "",
    wallet: null,
    username: "",
    stats: {
      wins: 0,
      losses: 0,
      draws: 0,
      profit: 0,
    },
  },
  isLoading: true,
};

/**
 * Game store interface with actions
 */
interface Store extends State {
  setState: (state: Partial<State>) => void;
  setUser: (user: IUser) => void;
  setLoading: (isLoading: boolean) => void;
  fetchUser: (userId: number) => Promise<void>;
  reset: () => void;
}

export const useUserStore = create<Store>((set) => ({
  user: { ...initialState.user },
  isLoading: initialState.isLoading,

  setState: (state) => set((prev) => ({ ...prev, ...state })),

  setUser: (user) => set((state) => ({ ...state, user })),

  setLoading: (isLoading) => set((state) => ({ ...state, isLoading })),

  fetchUser: async (userId: number) => {
    try {
      set((state) => ({ ...state, isLoading: true }));
      const userData = await getUser(userId);
      set((state) => ({ ...state, user: userData }));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      set((state) => ({ ...state, isLoading: false }));
    }
  },

  reset: () => set((state) => ({ ...state, ...initialState })),
}));
