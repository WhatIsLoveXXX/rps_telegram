import { Button } from "@/components/Button/Button";

interface BattleCardProps {
  betAmount: number;
  creatorPhotoUrl: string;
  creatorUsername: string;
  currency: string;
  onBattleClick: () => void;
}

const BattleCard = ({
  betAmount,
  creatorPhotoUrl,
  creatorUsername,
  currency,
  onBattleClick,
}: BattleCardProps) => {
  return (
    <div className="flex items-center bg-[#181818] border border-[#313030] rounded-lg p-2 pr-4 mb-[10px] w-full shadow">
      <img
        src={creatorPhotoUrl}
        alt={creatorUsername}
        className="w-[53px] h-[53px] rounded-full object-cover mr-2"
      />
      <div className="flex-1">
        <div className="text-white text-sm font-semibold">
          {creatorUsername}
        </div>
        <div className="flex gap-[14px] mt-2">
          <div>
            <div className="text-gray-400 text-[10px]">Currency</div>
            <div className="text-blue-500 text-[12px] font-medium">
              {currency}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-[10px]">Bet</div>
            <div className="text-blue-500 text-[12px] font-medium">
              {betAmount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      <Button onClick={onBattleClick}>Battle</Button>
    </div>
  );
};

export default BattleCard;
