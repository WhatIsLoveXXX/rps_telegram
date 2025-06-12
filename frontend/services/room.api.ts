import { api } from "./api";

export const createRoom = async (betAmount: number) => {
  try {
    const response = await api.post("/rooms/create", { betAmount });
    return response.data;
  } catch (error: any) {
    throw error.response.data.message;
  }
};

export const getOpenRooms = async () => {
  try {
    const response = await api.get("/rooms/open");
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
