import { useSignal, initData } from "@telegram-apps/sdk-react";

export const useInitDataRow = () => {
  const initDataRaw = useSignal(initData.raw);
  return initDataRaw;
};
