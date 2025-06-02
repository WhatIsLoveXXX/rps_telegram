import { FC } from "react";
import { Page } from "@/components/Page.tsx";
import { getUsers } from "../../../services/users.api";
import { initData, useSignal } from "@telegram-apps/sdk-react";

export const UserProfile: FC = () => {
  const initDataRaw = useSignal(initData.raw);
  return (
    <Page back={false}>
      <p>UserProfile</p>
      <button onClick={() => getUsers(initDataRaw)}>/api/users</button>
    </Page>
  );
};
