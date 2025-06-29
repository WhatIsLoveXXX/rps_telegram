import { FC, useState } from "react";
import { Page } from "@/components/Page.tsx";
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { Button } from "@/components/Button/Button";
import { TopUpWalletModal } from "./components/TopUpWalletModal";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { LoaderCircle } from "lucide-react";
import WinIcon from "@/assets/icons/win-icon.svg?react";
import LossIcon from "@/assets/icons/lose-icon.svg?react";
import DrawIcon from "@/assets/icons/draw-icon.svg?react";

export const UserProfile: FC = () => {
  const { user, isLoading } = useUser();
  const wallet = useTonWallet();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin h-10 w-10 text-white" />
      </div>
    );

  return (
    <Page back={false}>
      <div className="flex flex-col items-center">
        <img
          className="w-[96px] h-[96px] rounded-full object-cover mb-[8px]"
          src={user?.photoUrl}
          alt="user"
        />
        <p className="text-sm font-semibold mb-[10px] text-white">
          {user?.username}
        </p>
        <div className="">
          {!wallet ? (
            <TonConnectButton className="ton-connect-page__button !m-0" />
          ) : (
            <TonConnectButton className="ton-connect-page__button-connected !m-0" />
          )}
        </div>
      </div>

      <div className="bg-[#191919] rounded-lg py-3 px-4 border border-[#313030] mb-3 mt-3">
        <div className="flex justify-between">
          <div>
            <h2 className="text-sm font-semibold mb-[6px] text-white">
              Balance
            </h2>
            <p className="text-sm font-semibold text-[#B4B9BE]">
              TON
              <span className="ml-1 text-[#1B73DD] font-semibold">
                {user?.balance.toLocaleString()}
              </span>
            </p>
          </div>

          <div className="flex gap-2 self-end">
            <Button
              className="h-[30px]"
              onClick={() => {
                setIsTopUpModalOpen(true);
              }}
            >
              Top up wallet
            </Button>
            <Button
              className="h-[30px]"
              onClick={async () => {
                if (!tonConnectUI.connected) {
                  await tonConnectUI.openModal();
                  return;
                }
                navigate("/withdraw");
              }}
              variant="secondary"
            >
              Cash out
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-5 bg-[#191919] rounded-lg py-3 px-4 border border-[#313030]">
        <h2 className="text-sm font-semibold mb-[10px] text-white">
          Player statistic
        </h2>
        <div className="flex gap-[120px]">
          <div>
            <p className="text-[10px] text-[#B4B9BE] ">Play game:</p>
            <p className="text-[12px] font-semibold text-[#1B73DD]">
              {user?.stats?.gamesCount || 0}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#B4B9BE] ">Earn:</p>
            <p className="text-[12px] font-semibold text-[#1B73DD] text-sm">
              <span className="text-[#B4B9BE] font-[400]">TON</span>{" "}
              {user?.stats?.profit || 0}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <div className="flex gap-1 items-center">
            <WinIcon />
            <p className="text-[12px] text-white">{user?.stats?.wins}</p>
          </div>
          <div className="flex gap-1 items-center">
            <LossIcon />
            <p className="text-[12px] text-white">{user?.stats?.losses}</p>
          </div>
          <div className="flex gap-1 items-center">
            <DrawIcon className="w-3 h-3" />
            <p className="text-[12px] text-white">{user?.stats?.draws}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center my-[28px]">
        <Button className="h-[30px]" onClick={() => {}}>
          Join community
        </Button>
      </div>

      <TopUpWalletModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
      />
    </Page>
  );
};
