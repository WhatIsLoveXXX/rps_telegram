import { create } from "zustand";

/**
 * Represents a game room
 */
interface Room {
  betAmount: number;
  createdAt: string;
  creatorId: string;
  creatorPhotoUrl: string;
  creatorUsername: string;
  id: string;
}

/**
 * Current applied filters
 */
export interface CurrentFilters {
  creatorUsername?: string;
  betMin?: number;
  betMax?: number;
}

/**
 * Room store interface
 */
interface RoomStore {
  rooms: Room[];
  isLoading: boolean;
  currentFilters: CurrentFilters;
  setRooms: (rooms: Room[]) => void;
  setLoading: (loading: boolean) => void;
  setCurrentFilters: (filters: CurrentFilters) => void;
}

/**
 * Creates and manages the room store using Zustand
 */
export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  isLoading: false,
  currentFilters: {},

  setRooms: (rooms) => set({ rooms, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setCurrentFilters: (filters) => set({ currentFilters: filters }),
}));
