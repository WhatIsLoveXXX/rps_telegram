import { api } from "./api";

export const createRoom = async (
  initDataRaw: string | undefined,
  betAmount: number
) => {
  try {
    const response = await api.post(
      "/rooms/create",
      { betAmount },
      {
        headers: {
          Authorization: `tma ${initDataRaw}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error creating room`);
  }
};

export const getOpenRooms = async (initDataRaw: string | undefined) => {
  try {
    const response = await api.get("/rooms/open", {
      headers: {
        Authorization: `tma ${initDataRaw}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching open rooms`);
  }
};

export const joinRoom = async (
  initDataRaw: string | undefined,
  roomId: number
) => {
  try {
    const response = await api.post(
      "/rooms/join",
      { roomId },
      {
        headers: {
          Authorization: `tma ${initDataRaw}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error joining room`);
  }
};
