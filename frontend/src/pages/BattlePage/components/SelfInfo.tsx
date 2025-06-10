import { useGameStore } from "@/store/useGameStore";
import { socket } from "@/utils/socket-config";
import clsx from "clsx";
import { useParams } from "react-router-dom";

export const SelfInfo = () => {
  const { self } = useGameStore();
  const { roomId } = useParams<{ roomId: string }>();

  const handleReady = () => {
    if (self.isReady) return;
    socket.emit("user_ready", { roomId, userId: self.user.id });
  };

  return (
    <div className="flex items-center justify-between mb-4">
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
      <div className="flex items-center gap-2">
        <div className="text-right whitespace-nowrap">
          <p className="text-sm font-semibold">{self.user.firstName}</p>
          <p className="text-[10px]">Mock score</p>
        </div>
        <img
          className="min-w-13 min-h-13 max-w-12 max-h-12 rounded-full"
          src={self.user.photoUrl}
          alt="self"
        />
      </div>
    </div>
  );
};
