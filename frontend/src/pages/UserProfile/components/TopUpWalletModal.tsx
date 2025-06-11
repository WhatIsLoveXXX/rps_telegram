import { Button } from "@/components/Button/Button";
import { Modal } from "@/components/Modal/Modal";
import { FC, useState } from "react";
import ModalScissors from "@/assets/modal-scissors.svg?react";
import { toast } from "react-toastify";
import { NumberInput } from "@/components/Input/NumberInput";
import { topUpBalance } from "../../../../services/balance.api";
import { prepareTransaction } from "@/utils/transactions/prepareTransaction";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

interface TopUpWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TopUpWalletModal: FC<TopUpWalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [topUpAmount, setTopUpAmount] = useState<number | undefined>();
  const [tonConnectUI] = useTonConnectUI();
  const user = useTelegramUser();
  const userFriendlyAddress = useTonAddress();

  const handleTopUp = async () => {
    if (!tonConnectUI.connected) {
      await tonConnectUI.openModal();
      return;
    }

    if (!topUpAmount) {
      toast.error("Please enter a valid amount");
      return;
    }

    const transaction = prepareTransaction(
      topUpAmount,
      user?.username || "No username provided"
    );
    try {
      const transactionStatus = await tonConnectUI.sendTransaction(transaction);
      await topUpBalance(
        topUpAmount,
        transactionStatus.boc,
        userFriendlyAddress
      );
      onClose();
    } catch (e: any) {
      toast.error(e.message);
      onClose();
      console.log(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setTopUpAmount(undefined);
        onClose();
      }}
    >
      <h2 className="text-[16px] font-semibold text-center mb-6">
        Top up wallet
      </h2>

      <div className="flex flex-col items-center">
        <NumberInput
          value={topUpAmount}
          onChange={(value) => setTopUpAmount(value)}
          placeholder="TON"
          className="max-w-[92px]"
        />

        <div className="relative w-full flex justify-center">
          <ModalScissors className="absolute top-1/2 -translate-y-1/2 left-0" />
          <Button onClick={handleTopUp} className="px-6">
            Top up
          </Button>
        </div>
      </div>
    </Modal>
  );
};
