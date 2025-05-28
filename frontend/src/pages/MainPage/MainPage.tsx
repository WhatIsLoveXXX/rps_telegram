import { FC } from "react";
import { Page } from "@/components/Page.tsx";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import UserInfo from "@/components/UserInfo/UserInfo.tsx";
import { testApi } from "../../../services/api";
export interface TGUser {
  photo: string;
  name: string;
}

export const MainPage: FC = () => {
  const wallet = useTonWallet();

  return (
    <Page back={false}>
      <div className="pb-10">
        <div className="flex justify-between pt-2 px-1">
          <UserInfo />
          {!wallet ? (
            <TonConnectButton className="ton-connect-page__button !m-0" />
          ) : (
            <TonConnectButton className="ton-connect-page__button-connected !m-0" />
          )}
        </div>
        React app
        <button onClick={() => testApi()}>Test</button>
      </div>
    </Page>
  );
};
