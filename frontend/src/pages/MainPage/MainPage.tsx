import { FC, useState } from "react";
import { Page } from "@/components/Page.tsx";
import { CreateBattleModal } from "./components/CreateBattleModal/CreateBattleModal";
import createBattleBanner from "@/assets/create-battle-banner.png";
import { Button } from "@/components/Button/Button";
import { BattleList } from "./components/BattleList/BattleList";
import { Filters } from "./components/Filters/Filters";

export const MainPage: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Page back={false}>
      <h1 className="text-center font-semibold mb-4  text-white">
        Actual battle
      </h1>
      <div className="relative w-full h-[83px] flex justify-end items-center pr-[18px] mb-3">
        <img
          src={createBattleBanner}
          alt="Create battle banner"
          className="absolute top-0 left-0 w-full h-full z-0"
        />
        <Button className="z-10 relative" onClick={() => setIsModalOpen(true)}>
          Create battle
        </Button>
      </div>
      <Filters />
      <BattleList />

      <CreateBattleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Page>
  );
};
