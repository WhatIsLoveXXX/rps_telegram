import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "@/utils/socket-config";
import { useSocketConnection } from "./hooks/useSocketConnection";

export const BattlePage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const user = useTelegramUser();
  const navigate = useNavigate();

  const { isLoading } = useSocketConnection();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      BattlePage {roomId}
      <div>
        <button
          onClick={() => {
            console.log("click");
            socket.emit("connect_user", {
              roomId: roomId,
              userId: user?.id,
            });
          }}
        >
          Emit connect_user
        </button>
      </div>
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
};
