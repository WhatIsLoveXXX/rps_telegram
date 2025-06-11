import { FC, useEffect, useState } from "react";
import { Page } from "@/components/Page.tsx";
import { getUser } from "../../../services/users.api";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { Button } from "@/components/Button/Button";
import { TopUpWalletModal } from "./components/TopUpWalletModal";
import { useNavigate } from "react-router-dom";

interface UserInfo {
  balance: number;
  firstName: string;
  id: number;
  lastName: string;
  photoUrl: string;
  stats: {
    draws: number;
    losses: number;
    profit: number;
    wins: number;
  };
  wallet: null;
}

export const UserProfile: FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const user = useTelegramUser();
  const wallet = useTonWallet();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;

    const fetchUser = async () => {
      const data = await getUser(user?.id);
      setUserInfo(data);
    };

    fetchUser();
  }, [user]);

  return (
    <Page back={false}>
      <div className="flex flex-col items-center">
        <img
          className="w-[96px] h-[96px] rounded-full object-cover mb-[8px]"
          src={user?.photoUrl}
          alt="user"
        />
        <p className="text-sm font-semibold mb-[10px]">{user?.username}</p>
        <div className="">
          {!wallet ? (
            <TonConnectButton className="ton-connect-page__button !m-0" />
          ) : (
            <TonConnectButton className="ton-connect-page__button-connected !m-0" />
          )}
        </div>
      </div>

      <div className="mt-5 bg-[#191919] rounded-lg py-3 px-4 border border-[#313030] mb-3">
        <h2 className="text-sm font-semibold mb-[10px]">Player statistic</h2>
        <div className="flex gap-[120px]">
          <div>
            <p className="text-[10px] text-[#B4B9BE] ">Play game:</p>
            <p className="text-[12px] font-semibold text-[#1B73DD]">0</p>
          </div>
          <div>
            <p className="text-[10px] text-[#B4B9BE] ">Earn:</p>
            <p className="text-[12px] font-semibold text-[#1B73DD]">
              <span className="text-[#B4B9BE] text-[10px] font-[400]">TON</span>{" "}
              {userInfo?.stats.profit}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 bg-[#191919] rounded-lg py-3 px-4 border border-[#313030] mb-3">
        <div className="flex justify-between">
          <div>
            <h2 className="text-sm font-semibold mb-[6px]">Balance</h2>
            <p className="text-[10px] font-semibold text-[#B4B9BE]">
              TON
              <span className="ml-1 text-[12px] text-[#1B73DD] font-semibold">
                {userInfo?.balance.toLocaleString()}
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
              onClick={() => {
                navigate("/withdraw");
              }}
              variant="secondary"
            >
              Cash out
            </Button>
          </div>
        </div>
      </div>

      {/* <div>
        <input
          type="number"
          placeholder="Top up amount"
          className="bg-white text-black"
          value={topUpAmount}
          onChange={(e) => setTopUpAmount(Number(e.target.value))}
        />
        <button onClick={async () => await handleTopUp()}>Top up</button>
      </div>
      <div>
        <input
          type="number"
          placeholder="Withdraw amount"
          className="bg-white text-black"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(Number(e.target.value))}
        />
        <button onClick={async () => await withdrawBalance(withdrawAmount)}>
          Withdraw
        </button>
      </div> */}
      <TopUpWalletModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
      />
    </Page>
  );
};
