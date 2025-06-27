import { FC, useEffect, useState } from "react";
import { getLeaderBoard } from "../../../../services/users.api";
import { IUser } from "../../../../services/users.types";
import { LoaderCircle } from "lucide-react";
import LeaderBoardCard from "./LeaderBoardCard";
import { useTelegramUser } from "@/hooks/useTelegramUser";

const TOP_USERS_COUNT = 10;

export const LeaderBoardList: FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = useTelegramUser();

  useEffect(() => {
    if (!user?.id) return;

    const fetchLeaderBoard = async () => {
      try {
        const response = await getLeaderBoard(TOP_USERS_COUNT, user?.id);
        console.log(response);

        const currentUserIndex = response.findIndex(
          (u: IUser) => u.id === user.id
        );

        if (currentUserIndex !== -1) {
          const foundUser = response[currentUserIndex];

          if (currentUserIndex >= TOP_USERS_COUNT) {
            setCurrentUser(foundUser);
            setUsers(response.slice(0, TOP_USERS_COUNT));
          } else {
            setUsers(response);
            setCurrentUser(null);
          }
        } else {
          setUsers(response);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderBoard();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderCircle className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 relative pb-22">
      {users.map((user, index) => (
        <LeaderBoardCard
          key={user.id}
          username={user.username}
          photoUrl={user.photoUrl}
          stats={user.stats}
          position={index + 1}
          isOutside={false}
        />
      ))}

      {currentUser && (
        <div className="fixed bottom-[109px] left-0 right-0 px-4">
          <LeaderBoardCard
            key={`current-${currentUser.id}`}
            username={currentUser.username}
            photoUrl={currentUser.photoUrl}
            stats={currentUser.stats}
            position={currentUser.stats?.rank || 0}
            isOutside={true}
          />
        </div>
      )}
    </div>
  );
};
