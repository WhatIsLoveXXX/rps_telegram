import axios from "axios";

const api = axios.create({
    headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
    },
});

export const getTonPrice = async () => {
    try {
        const response = await api.get("https://tonapi.io/v2/rates?tokens=ton&currencies=usdt");
        return response.data;
    } catch (error) {
        throw new Error(`Error loading price : ${error}`);
    }
};

export const fetchUsernameForBuyingStars = async (body: { query: string, quantity?: string }) => {
    try {
        const response = await api.post("https://tg.parssms.info/v1/stars/search", body, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': import.meta.env.VITE_FRAGMENT_API_KEY,
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Error fetching username : ${error}`);
    }
};

export const buyTelegramStarsForUser = async (body: { query: string, quantity: string }) => {
    try {
        const response = await api.post("https://tg.parssms.info/v1/stars/payment", body, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': import.meta.env.VITE_FRAGMENT_API_KEY,
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`Error buying stars : ${error}`);
    }
};