import { useEffect, useState } from "react";
import { getOpenRooms } from "../../../../../services/room.api";
import BattleCard from "./BattleCard";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const fetchBattles = async () => {
      const data = await getOpenRooms();
      setBattles(data);
    };
    fetchBattles();
  }, []);

  const handleBattleClick = (id: string) => {
    navigate(`/battle/${id}`);
  };

  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">Battles</h2>
      {battles.map(({ id, betAmount, creatorPhotoUrl, creatorUsername }) => (
        <BattleCard
          key={id}
          betAmount={betAmount}
          creatorPhotoUrl={creatorPhotoUrl}
          creatorUsername={creatorUsername}
          onBattleClick={() => handleBattleClick(id)}
          currency="TON"
        />
      ))}
    </div>
  );
};
