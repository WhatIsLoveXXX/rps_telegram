import type { ComponentType, JSX } from "react";

import { MainPage } from "@/pages/MainPage/MainPage";
import { LeaderBoard } from "@/pages/LeaderBoard/LeaderBoard";
import { UserProfile } from "@/pages/UserProfile/UserProfile";
import { BattlePage } from "@/pages/BattlePage/BattlePage";

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
  { path: "/battle/:id", Component: BattlePage },
];
