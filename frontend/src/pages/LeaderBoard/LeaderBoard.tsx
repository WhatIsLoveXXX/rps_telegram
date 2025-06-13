import { FC } from "react";
import { Page } from "@/components/Page.tsx";
import { LeaderBoardList } from "./components/LeaderBoardList";
import createBattleBanner from "@/assets/leader-page-banner.png";

export const LeaderBoard: FC = () => {
  return (
    <Page back={false}>
      <h1 className="text-center font-semibold mb-4  text-white">Leader tab</h1>
      <img
        src={createBattleBanner}
        alt="Leader board banner"
        className="w-full  block rounded-lg max-h-[100px] mb-4"
      />
      <LeaderBoardList />
    </Page>
  );
};
