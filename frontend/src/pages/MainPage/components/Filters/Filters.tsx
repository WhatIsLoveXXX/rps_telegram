import React, { useState, useCallback } from "react";
import { StakeRange } from "./StakeRange/StakeRange";
import { SearchInput } from "./SearchInput/SearchInput";
import { useRoomStore } from "@/store/useRoomStore";
import { getOpenRooms } from "../../../../../services/room.api";
import { toast } from "react-toastify";
import { useDebouncedCallback } from "use-debounce";
import { MIN_BET, MAX_BET } from "../../consts";

export const Filters: React.FC = () => {
  const [values, setValues] = useState([MIN_BET, MAX_BET]);
  const [search, setSearch] = useState("");
  const { setLoading, setRooms, setCurrentFilters } = useRoomStore();

  const fetchRooms = useCallback(
    async (searchTerm: string, stakeRange: number[]) => {
      const filters = {
        creatorUsername: searchTerm || undefined,
        betMin: stakeRange[0],
        betMax: stakeRange[1],
      };

      setCurrentFilters(filters);
      setLoading(true);
      try {
        const rooms = await getOpenRooms(filters);
        setRooms(rooms);
      } catch (error: any) {
        toast.error(error.message);
        setLoading(false);
      }
    },
    [setLoading, setRooms, setCurrentFilters]
  );

  const debouncedFetchRooms = useDebouncedCallback(fetchRooms, 300);

  const handleSearchChange = async (value: string) => {
    setSearch(value);
    await fetchRooms(value, values);
  };

  const handleStakeChange = (newValues: number[]) => {
    setValues(newValues);
    debouncedFetchRooms(search, newValues);
  };

  return (
    <div className="bg-[#141414] mb-4 p-4 pt-5 rounded-lg w-full text-white border border-[#313030]">
      <StakeRange values={values} onChange={handleStakeChange} />
      <SearchInput value={search} onChange={handleSearchChange} />
    </div>
  );
};
