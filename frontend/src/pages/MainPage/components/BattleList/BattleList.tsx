import { useCallback, useEffect } from "react";
import { getOpenRooms } from "../../../../../services/room.api";
import BattleCard from "./BattleCard";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { useRoomStore } from "@/store/useRoomStore";
import { useUser } from "@/hooks/useUser";

export const BattleList = () => {
  const navigate = useNavigate();
  const { isLoading, rooms, setRooms, setLoading, currentFilters } =
    useRoomStore();
  const { user } = useUser();

  const fetchBattles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOpenRooms(
        Object.keys(currentFilters).length > 0 ? currentFilters : undefined
      );
      setRooms(data);
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  }, [currentFilters, setRooms, setLoading]);

  const fetchInitialBattles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOpenRooms();
      setRooms(data);
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  }, [setRooms, setLoading]);

  const poolBattlesSilently = useCallback(async () => {
    try {
      const data = await getOpenRooms(
        Object.keys(currentFilters).length > 0 ? currentFilters : undefined
      );
      setRooms(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [setRooms, currentFilters]);

  useEffect(() => {
    fetchInitialBattles();
  }, [fetchInitialBattles]);

  useEffect(() => {
    const interval = setInterval(() => {
      poolBattlesSilently();
    }, 5000);
    return () => clearInterval(interval);
  }, [poolBattlesSilently]);

  const handleBattleClick = (id: string, betAmount: number) => {
    if (Number(user?.balance) < betAmount) {
      toast.error("Insufficient balance");
      return;
    }

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
          <LoaderCircle className="animate-spin text-white" />
        </div>
      ) : (
        rooms.map(({ id, betAmount, creatorPhotoUrl, creatorUsername }) => (
          <BattleCard
            key={id}
            betAmount={betAmount}
            creatorPhotoUrl={creatorPhotoUrl}
            creatorUsername={creatorUsername}
            onBattleClick={() => handleBattleClick(id, betAmount)}
            currency="TON"
          />
        ))
      )}
    </div>
  );
};
