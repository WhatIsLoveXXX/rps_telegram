import { FC } from "react";
import { Page } from "@/components/Page.tsx";
import { LeaderBoardList } from "./components/LeaderBoardList";

export const LeaderBoard: FC = () => {
  return (
    <Page back={false}>
      <div className="relative mb-4 h-[110px] rounded-lg overflow-hidden">
        <div className="text-white font-semibold text-[12px] relative z-10 mt-[17px] max-w-[188px] px-4">
          The end of the <br />
          <span className="text-yellow-200 text-[14px]">
            month is approaching
          </span>
          <br />
          1 2 3 place will receive <br />
          telegram nft
        </div>
        <img
          src="/leader-page-min.png"
          alt="Leader board banner"
          className="w-full h-full block rounded-lg absolute top-0 left-0 object-fill"
        />
      </div>
      <h1 className="text-center font-semibold mb-4  text-white">
        Leaderboard
      </h1>
      <LeaderBoardList />
    </Page>
  );
};
