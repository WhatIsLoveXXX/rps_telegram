import { useSignal } from "@telegram-apps/sdk-react";
import { initData } from "@telegram-apps/sdk";

export const useInitDataRow = () => {
  const initDataRaw = useSignal(initData.raw);
  return initDataRaw;
};
