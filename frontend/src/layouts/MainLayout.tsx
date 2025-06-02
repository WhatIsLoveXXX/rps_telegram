import { BottomNavigation } from "@/components/BottomNavigation/BottomNavigation";
import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  return (
    <div className="relative min-h-screen pb-20 px-[15px] pt-6">
      <Outlet />
      <BottomNavigation />
    </div>
  );
};
