import { FC, useState } from "react";
import { Page } from "@/components/Page.tsx";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import UserInfo from "@/components/UserInfo/UserInfo.tsx";
import { CreateBattleModal } from "./components/CreateBattleModal/CreateBattleModal";
import { useNavigate } from "react-router-dom";

export const MainPage: FC = () => {
  const wallet = useTonWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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

      <div>
        <button
          onClick={() =>
            navigate("/battle/7be9fec6-e9b1-4764-910c-f4215e34e431")
          }
        >
          Open test battle
        </button>
      </div>

      <CreateBattleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Page>
  );
};
