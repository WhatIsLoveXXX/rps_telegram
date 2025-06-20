import { FC, useEffect, useState } from "react";
import { getLeaderBoard } from "../../../../services/users.api";
import { IUser } from "../../../../services/users.types";
import { LoaderCircle } from "lucide-react";
import LeaderBoardCard from "./LeaderBoardCard";

export const LeaderBoardList: FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderBoard = async () => {
      try {
        const response = await getLeaderBoard();
        console.log(response);
        setUsers(response);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderBoard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderCircle className="animate-spin text-white" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {users.map((user, index) => (
        <LeaderBoardCard
          key={user.id}
          username={user.username}
          photoUrl={user.photoUrl}
          stats={user.stats}
          position={index + 1}
        />
      ))}
    </div>
  );
};
