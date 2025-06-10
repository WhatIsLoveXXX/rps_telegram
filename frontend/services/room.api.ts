import { api } from "./api";

export const createRoom = async (betAmount: number) => {
  try {
    const response = await api.post("/rooms/create", { betAmount });
    return response.data;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getOpenRooms = async () => {
  try {
    const response = await api.get("/rooms/open");
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching open rooms`);
  }
};

export const joinRoom = async (roomId: number) => {
  try {
    const response = await api.post("/rooms/join", { roomId });
    return response.data;
  } catch (error) {
    throw new Error(`Error joining room`);
  }
};
