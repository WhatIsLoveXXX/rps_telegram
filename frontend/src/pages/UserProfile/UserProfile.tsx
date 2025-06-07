import { FC, useState } from "react";
import { Page } from "@/components/Page.tsx";
import { getUsers } from "../../../services/users.api";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import {
  TonConnectButton,
  useTonAddress,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { topUpBalance, withdrawBalance } from "../../../services/balance.api";
import { prepareTransaction } from "@/utils/transactions/prepareTransaction";

export const UserProfile: FC = () => {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const userFriendlyAddress = useTonAddress();

  const handleTopUp = async () => {
    const transaction = prepareTransaction(topUpAmount, "Mock user name");
    try {
      const transactionStatus = await tonConnectUI.sendTransaction(transaction);
      await topUpBalance(topUpAmount, transactionStatus.boc);
    } catch (e) {
      console.log(e);
    }
    // const tx = await getTxByBOC(transactionStatus.boc, userFriendlyAddress);
  };

  return (
    <Page back={false}>
      <p>UserProfile</p>
      <div className="pb-10 flex justify-end">
        <div className="flex justify-between pt-2 px-1">
          {!wallet ? (
            <TonConnectButton className="ton-connect-page__button !m-0" />
          ) : (
            <TonConnectButton className="ton-connect-page__button-connected !m-0" />
          )}
        </div>
      </div>
      <div>
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
      </div>
    </Page>
  );
};
