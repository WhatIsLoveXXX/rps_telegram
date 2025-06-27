import WinIcon from "@/assets/icons/win-icon.svg?react";
import LossIcon from "@/assets/icons/lose-icon.svg?react";
import DrawIcon from "@/assets/icons/draw-icon.svg?react";
import clsx from "clsx";

interface LeaderBoardCardProps {
  username: string;
  photoUrl: string;
  stats: {
    wins: number;
    losses: number;
    draws: number;
    profit?: number;
    gamesCount?: number;
  };
  position?: number;
  isOutside?: boolean;
}

const LeaderBoardCard = ({
  username,
  photoUrl,
  stats,
  position,
  isOutside = false,
}: LeaderBoardCardProps) => {
  const isTopThree = position !== undefined && position <= 3;
  const topThreeBgClasses = isTopThree
    ? `leader-bord-${position}-place-gradient`
    : "bg-[#181818] border border-[#313030]";

  const backgroundClasses = isOutside
    ? "bg-[#1B73DD] border border-[#313030]"
    : topThreeBgClasses;

  return (
    <div
      className={`flex items-center justify-between ${backgroundClasses} rounded-lg p-2 pr-4 w-full shadow`}
    >
      <div className="flex items-center gap-2">
        <div className="text-white text-sm font-semibold">{position}</div>
        <img
          src={photoUrl}
          alt={username}
          className="w-[53px] h-[53px] rounded-full object-cover mr-2"
        />
        <div className="">
          <div className="text-white text-sm font-semibold mb-1">
            {username}
          </div>
          <div className="text-[10px] flex gap-1">
            <div className="flex items-center gap-1">
              <WinIcon className={clsx(isOutside && "stroke-white")} />
              <span className="text-white">{stats.wins}</span>
            </div>
            <div className="flex items-center gap-1">
              <LossIcon className={clsx(isOutside && "stroke-white")} />
              <span className="text-white">{stats.losses}</span>
            </div>
            <div className="flex items-center gap-1">
              <DrawIcon className={clsx(isOutside && "fill-white")} />
              <span className="text-white">{stats.draws}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-[10px] font-semibold text-center">
        <div
          className={clsx(
            "text-[#B4B9BE] mb-1",
            isOutside ? "text-white" : "text-[#B4B9BE]"
          )}
        >
          TON
        </div>
        <div
          className={clsx(
            "text-[12px]",
            isOutside ? "text-white" : "text-[#1B73DD]"
          )}
        >
          {stats.profit?.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default LeaderBoardCard;
