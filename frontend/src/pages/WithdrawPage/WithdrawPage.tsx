import { Page } from "@/components/Page";
import gameBackground from "@/assets/game-background.svg";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";
import { Input } from "@/components/Input/Input";
import { useTonAddress } from "@tonconnect/ui-react";
import { NumberInput } from "@/components/Input/NumberInput";
import { toast } from "react-toastify";
import { withdrawBalance } from "../../../services/balance.api";
import { Button } from "@/components/Button/Button";

export const WithdrawPage = () => {
  const { user, isLoading } = useUser();
  const userFriendlyAddress = useTonAddress();
  const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>(
    undefined
  );
  const [isCashOutLoading, setIsCashOutLoading] = useState(false);

  const onWithdraw = async () => {
    if (!withdrawAmount) {
      toast.error("Please enter an amount");
      return;
    }

    if (withdrawAmount > Number(user?.balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setIsCashOutLoading(true);
      await withdrawBalance(withdrawAmount);
      toast.success("Withdrawal successful");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsCashOutLoading(false);
    }
  };
  console.log(withdrawAmount);
  return (
    <Page back={false}>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h2 className="text-base font-semibold text-center mb-3">Cash out</h2>
          <div className="border border-[#313030] bg-[#191919]/40 px-4 py-2 rounded-lg">
            <h3 className="text-sm font-semibold">Current balance:</h3>
            <p className="text-[#B4B9BE] text-[10px]">
              TON <span className="text-[#1B73DD]">{user?.balance}</span>
            </p>
            <div className="mt-5">
              <p className="text-[#AF0808] text-[10px] mb-1">
                Please note, a 5% fee is charged for withdrawal of funds
              </p>
              <Input
                value={userFriendlyAddress}
                onChange={() => {}}
                placeholder="Enter your wallet address"
                readOnly={true}
                className="!text-[11px]"
              />
              <NumberInput
                value={withdrawAmount}
                onChange={(value) => setWithdrawAmount(value)}
                placeholder="Enter amount"
                className="!w-[156px]"
              />
              <div className="flex justify-center">
                <Button
                  disabled={isCashOutLoading || !withdrawAmount}
                  onClick={onWithdraw}
                >
                  Cash out
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <img
        src={gameBackground}
        alt="bg"
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      />
    </Page>
  );
};
