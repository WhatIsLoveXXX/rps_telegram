import { useEffect, useState } from "react";
import { IUser } from "../../services/users.types";
import { getUser } from "../../services/users.api";
import { useTelegramUser } from "./useTelegramUser";
import { toast } from "react-toastify";

export const useUser = () => {
  const user = useTelegramUser();

  const [userInfo, setUserInfo] = useState<IUser | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchUser = async () => {
      try {
        const data = await getUser(user?.id);
        setUserInfo(data);
      } catch (error: any) {
        toast.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [user]);

  return { user: userInfo, isLoading };
};
