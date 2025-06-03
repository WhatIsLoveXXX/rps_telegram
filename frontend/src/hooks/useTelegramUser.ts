import { initData, useSignal } from "@telegram-apps/sdk-react";

export const useTelegramUser = () => {
  const user = useSignal(initData.user);
  // const lp = useLaunchParams(); initData.user
  return user;
};
