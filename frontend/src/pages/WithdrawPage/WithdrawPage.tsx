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
import { LoaderCircle } from "lucide-react";

export const WithdrawPage = () => {
  const { user, isLoading, fetchUser } = useUser();
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
      await withdrawBalance(withdrawAmount, userFriendlyAddress);
      await fetchUser(user?.id);
      toast.success("Withdrawal successful");
    } catch (error: any) {
      toast.error(error);
    } finally {
      setIsCashOutLoading(false);
    }
  };

  return (
    <Page back={false}>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <LoaderCircle className="animate-spin h-10 w-10 text-white" />
        </div>
      ) : (
        <>
          <h2 className="text-base font-semibold text-center mb-3 text-white">
            Cash out
          </h2>
          <div className="border border-[#313030] bg-[#191919]/40 px-4 py-2 rounded-lg">
            <h3 className="text-sm font-semibold text-white">
              Current balance:
            </h3>
            <p className="text-[#B4B9BE] text-[10px]">
              TON <span className="text-[#1B73DD]">{user?.balance}</span>
            </p>
            <div className="mt-5">
              <Input
                value={userFriendlyAddress}
                onChange={() => {}}
                placeholder="Enter your wallet address"
                readOnly={true}
                className="!text-[11px] mb-2"
              />
              <NumberInput
                value={withdrawAmount}
                onChange={(value) => setWithdrawAmount(value)}
                placeholder="Enter amount"
                className="!w-[156px] mb-2"
              />
              <p className="text-[#CBCBCB] text-[10px] mb-4">
                <span className="font-semibold">Please note!</span> When
                replenishing or withdrawing funds, we charge a{" "}
                <span className="font-semibold">commission of 2.5-5%</span>
              </p>
              <div className="flex justify-center">
                <Button
                  disabled={isCashOutLoading || !withdrawAmount}
                  onClick={onWithdraw}
                >
                  {isCashOutLoading ? (
                    <LoaderCircle className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    "Cash out"
                  )}
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
