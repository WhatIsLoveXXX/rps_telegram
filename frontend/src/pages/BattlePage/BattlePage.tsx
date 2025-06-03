import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const BattlePage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const user = useTelegramUser();
  console.log(user);

  return <div>BattlePage {roomId}</div>;
};
