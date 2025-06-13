import { FC } from "react";
import { Page } from "@/components/Page.tsx";
import { LeaderBoardList } from "./components/LeaderBoardList";

export const LeaderBoard: FC = () => {
  return (
    <Page back={false}>
      LeaderBoard
      <LeaderBoardList />
    </Page>
  );
};
