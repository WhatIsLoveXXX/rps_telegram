import { useGameStore } from "@/store/useGameStore";
import { socket } from "@/utils/socket-config";
import clsx from "clsx";
import { useParams } from "react-router-dom";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import WinIcon from "@/assets/icons/win-icon.svg?react";
import LossIcon from "@/assets/icons/lose-icon.svg?react";
import DrawIcon from "@/assets/icons/draw-icon.svg?react";

export const SelfInfo = () => {
  const user = useTelegramUser();
  const { self, gameStarted, opponent } = useGameStore();
  const { roomId } = useParams<{ roomId: string }>();

  const handleReady = () => {
    if (self.isReady) return;
    socket.emit("user_ready", { roomId, userId: self.user.id });
  };
  console.log("self", self);
  return (
    <div
      className={clsx(
        "flex items-center mb-4",
        !gameStarted && !!opponent?.user?.id ? "justify-between" : "justify-end"
      )}
    >
      {!gameStarted && !!opponent?.user?.id && (
        <button
          onClick={handleReady}
          className={clsx(
            "px-2  text-white font-medium text-sm py-1 rounded-lg transition",
            self.isReady
              ? "bg-[#1B73DD]/60"
              : "bg-[#1B73DD] hover:bg-[#1B73DD]/80"
          )}
        >
          Ready
        </button>
      )}
      <div className="flex items-center gap-[10px]">
        <div className="text-right whitespace-nowrap">
          <p className="text-sm font-semibold">{user?.username}</p>
          <div className="text-[10px] flex justify-end gap-1">
            <div className="flex items-center gap-1">
              <WinIcon />
              <span>{self.user.stats.wins}</span>
            </div>
            <div className="flex items-center gap-1">
              <LossIcon />
              <span>{self.user.stats.losses}</span>
            </div>
            <div className="flex items-center gap-1">
              <DrawIcon />
              <span>{self.user.stats.draws}</span>
            </div>
          </div>
        </div>
        <img
          className="min-w-13 min-h-13 max-w-12 max-h-12 rounded-full"
          src={user?.photoUrl}
          alt="self"
        />
      </div>
    </div>
  );
};
