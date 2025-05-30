import {
  TonConnectButton,
  useTonWallet,
  useTonConnectUI,
  SendTransactionRequest,
} from "@tonconnect/ui-react";
import { List, Placeholder, Text } from "@telegram-apps/telegram-ui";
import type { FC } from "react";

import { DisplayData } from "@/components/DisplayData/DisplayData.tsx";
import { Page } from "@/components/Page.tsx";

import "./TONConnectPage.css";

const transaction: SendTransactionRequest = {
  validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
  messages: [
    {
      address: "TEST", // message destination in user-friendly format
      amount: "1", // Toncoin in nanotons
    },
  ],
};

export const TONConnectPage: FC = () => {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const handlePayment = async () => {
    try {
      const transactionStatus = await tonConnectUI.sendTransaction(transaction);
      console.log("transactionStatus", transactionStatus);
    } catch (e) {
      console.log("error", e);
    }
  };

  if (!wallet) {
    return (
      <Page>
        <Placeholder
          className="ton-connect-page__placeholder"
          header="TON Connect"
          description={
            <>
              <Text>
                To display the data related to the TON Connect, it is required
                to connect your wallet
              </Text>
              <TonConnectButton className="ton-connect-page__button" />
            </>
          }
        />
      </Page>
    );
  }

  const {
    account: { chain, publicKey, address },
    device: { appName, appVersion, maxProtocolVersion, platform, features },
  } = wallet;

  return (
    <Page>
      <List>
        {"imageUrl" in wallet && (
          <>
            {/* <Section>
              <Cell
                before={
                  <Avatar
                    src={wallet.imageUrl}
                    alt="Provider logo"
                    width={60}
                    height={60}
                  />
                }
                after={<Navigation>About wallet</Navigation>}
                subtitle={wallet.appName}
                onClick={(e) => {
                  e.preventDefault();
                  openLink(wallet.aboutUrl);
                }}
              >
                <Title level="3">{wallet.name}</Title>
              </Cell>
            </Section> */}
            <TonConnectButton className="ton-connect-page__button-connected" />
            <button onClick={handlePayment}>pay</button>
          </>
        )}
        <DisplayData
          header="Account"
          rows={[
            { title: "Address", value: address },
            { title: "Chain", value: chain },
            { title: "Public Key", value: publicKey },
          ]}
        />
        <DisplayData
          header="Device"
          rows={[
            { title: "App Name", value: appName },
            { title: "App Version", value: appVersion },
            { title: "Max Protocol Version", value: maxProtocolVersion },
            { title: "Platform", value: platform },
            {
              title: "Features",
              value: features
                .map((f) => (typeof f === "object" ? f.name : undefined))
                .filter((v) => v)
                .join(", "),
            },
          ]}
        />
      </List>
    </Page>
  );
};
