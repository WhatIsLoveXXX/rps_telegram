import { useCallback, useEffect, useState } from "react";
import { getOpenRooms } from "../../../../../services/room.api";
import BattleCard from "./BattleCard";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LoaderCircle, RotateCcw } from "lucide-react";

interface Battle {
  betAmount: number;
  createdAt: string;
  creatorId: string;
  creatorPhotoUrl: string;
  creatorUsername: string;
  id: string;
}

export const BattleList = () => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const fetchBattles = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getOpenRooms();
      setBattles(data);
    } catch (error: any) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBattles();
  }, [fetchBattles]);

  const handleBattleClick = (id: string) => {
    navigate(`/battle/${id}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold  text-white">Battles</h2>
        <RotateCcw
          className="cursor-pointer hover:scale-110 transition-all duration-300"
          onClick={fetchBattles}
          color="#1B73DD"
        />
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <LoaderCircle className="animate-spin" />
        </div>
      ) : (
        battles.map(({ id, betAmount, creatorPhotoUrl, creatorUsername }) => (
          <BattleCard
            key={id}
            betAmount={betAmount}
            creatorPhotoUrl={creatorPhotoUrl}
            creatorUsername={creatorUsername}
            onBattleClick={() => handleBattleClick(id)}
            currency="TON"
          />
        ))
      )}
    </div>
  );
};
