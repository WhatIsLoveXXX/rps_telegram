import type { ComponentType, JSX } from "react";

import { MainPage } from "@/pages/MainPage/MainPage";
import { LeaderBoard } from "@/pages/LeaderBoard/LeaderBoard";
import { UserProfile } from "@/pages/UserProfile/UserProfile";
import { BattlePage } from "@/pages/BattlePage/BattlePage";
import { WithdrawPage } from "@/pages/WithdrawPage/WithdrawPage";

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: "/", Component: MainPage },
  { path: "/leaderboard", Component: LeaderBoard },
  { path: "/user-profile", Component: UserProfile },
  { path: "/battle/:roomId", Component: BattlePage },
  { path: "/withdraw", Component: WithdrawPage },
];
