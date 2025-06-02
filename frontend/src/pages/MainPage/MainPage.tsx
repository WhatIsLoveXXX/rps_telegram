import { FC, useState } from "react";
import { Page } from "@/components/Page.tsx";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import UserInfo from "@/components/UserInfo/UserInfo.tsx";
import { CreateBattleModal } from "./components/CreateBattleModal/CreateBattleModal";

export const MainPage: FC = () => {
  const wallet = useTonWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Page back={false}>
      {/* <div className="pb-10">
        <div className="flex justify-between pt-2 px-1">
          <UserInfo />
          {!wallet ? (
            <TonConnectButton className="ton-connect-page__button !m-0" />
          ) : (
            <TonConnectButton className="ton-connect-page__button-connected !m-0" />
          )}
        </div>
      </div> */}
      <h1 className="text-center font-semibold mb-4">Actual battle</h1>

      <button onClick={() => setIsModalOpen(true)}>Create battle</button>

      <CreateBattleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Page>
  );
};
