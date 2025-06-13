import { FC, useEffect, useState } from "react";
import { getLeaderBoard } from "../../../../services/users.api";
import { IUser } from "../../../../services/users.types";

export const LeaderBoardList: FC = () => {
  const [leaderBoard, setLeaderBoard] = useState<IUser[]>([]);
  useEffect(() => {
    const fetchLeaderBoard = async () => {
      try {
        const response = await getLeaderBoard();
        console.log(response);
        setLeaderBoard(response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLeaderBoard();
  }, []);
  return <div>LeaderBoardList</div>;
};
