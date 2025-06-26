import { useEffect } from "react";
import { useTelegramUser } from "./useTelegramUser";
import { useUserStore } from "../store/useUserStore";

export const useUser = () => {
  const telegramUser = useTelegramUser();
  const { user, isLoading, fetchUser } = useUserStore();

  useEffect(() => {
    if (!telegramUser?.id) return;

    fetchUser(telegramUser.id);
  }, [telegramUser, fetchUser]);

  return { user, isLoading, fetchUser };
};
