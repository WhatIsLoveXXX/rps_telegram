import WinIcon from "@/assets/icons/win-icon.svg?react";
import LossIcon from "@/assets/icons/lose-icon.svg?react";
import DrawIcon from "@/assets/icons/draw-icon.svg?react";

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
}

const LeaderBoardCard = ({
  username,
  photoUrl,
  stats,
  position,
}: LeaderBoardCardProps) => {
  const isTopThree = position !== undefined && position <= 3;
  const backgroundClass = isTopThree
    ? "leader-bord-card-gradient"
    : "bg-[#181818] border border-[#313030]";

  return (
    <div
      className={`flex items-center justify-between ${backgroundClass} rounded-lg p-2 pr-4 w-full shadow`}
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
              <WinIcon />
              <span className="text-white">{stats.wins}</span>
            </div>
            <div className="flex items-center gap-1">
              <LossIcon />
              <span className="text-white">{stats.losses}</span>
            </div>
            <div className="flex items-center gap-1">
              <DrawIcon />
              <span className="text-white">{stats.draws}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-[10px] font-semibold text-center">
        <div className="text-[#B4B9BE] mb-1">TON</div>
        <div className="text-[#1B73DD] text-[12px]">
          {stats.profit?.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default LeaderBoardCard;
