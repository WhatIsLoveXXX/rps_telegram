import { api } from "./api";

export const createRoom = async (betAmount: number) => {
  try {
    const response = await api.post("/rooms/create", { betAmount });
    return response.data;
  } catch (error: any) {
    throw error.response.data.message;
  }
};

export interface RoomFilters {
  creatorUsername?: string;
  betMin?: number;
  betMax?: number;
}

export const getOpenRooms = async (filters?: RoomFilters) => {
  try {
    const params = new URLSearchParams();

    if (filters?.creatorUsername) {
      params.append("creatorUsername", filters.creatorUsername);
    }
    if (filters?.betMin !== undefined) {
      params.append("betMin", filters.betMin.toString());
    }
    if (filters?.betMax !== undefined) {
      params.append("betMax", filters.betMax.toString());
    }

    const response = await api.get(`/rooms/open?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    throw error.response.data.message;
  }
};

export const joinRoom = async (roomId: number) => {
  try {
    const response = await api.post("/rooms/join", { roomId });
    return response.data;
  } catch (error: any) {
    throw error.response.data.message;
  }
};
