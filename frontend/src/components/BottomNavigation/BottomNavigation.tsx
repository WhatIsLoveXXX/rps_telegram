import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { LeaderNavIcon } from "@/assets/icons/LeaderNavIcon";
import { BattleNavIcon } from "@/assets/icons/BattleNavIcon";
import { ProfileNavIcon } from "@/assets/icons/ProfileNavIcon";

const navItems = [
  { to: "/leaderboard", label: "Leader", Icon: LeaderNavIcon },
  { to: "/", label: "Battle", Icon: BattleNavIcon },
  { to: "/user-profile", label: "Profile", Icon: ProfileNavIcon },
];

export const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-4 w-[calc(100%-30px)] max-w-[400px] left-1/2 z-50 flex -translate-x-1/2 justify-between rounded-2xl px-4 py-2 shadow-lg bottom-navigation-gradient">
      {navItems.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              "group flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all",
              isActive ? "text-[#F5EE8F]" : "hover:text-[#F5EE8F] text-white"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className={clsx(
                  "transition-all",
                  isActive
                    ? "stroke-[#F5EE8F]"
                    : "stroke-white group-hover:stroke-[#F5EE8F]"
                )}
              />
              <p className="text-sm mt-2">{label}</p>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
