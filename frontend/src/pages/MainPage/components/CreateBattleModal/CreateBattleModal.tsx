import { Button } from "@/components/Button/Button";
import { Modal } from "@/components/Modal/Modal";
import { FC, useState } from "react";
import { createRoom } from "../../../../../services/room.api";
import { useNavigate } from "react-router-dom";
import ModalScissors from "@/assets/modal-scissors.svg?react";
import { toast } from "react-toastify";
import { NumberInput } from "@/components/Input/NumberInput";

interface CreateBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBattleModal: FC<CreateBattleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [sumTON, setSumTON] = useState<number | undefined>();
  const navigate = useNavigate();

  const handleCreateBattle = async () => {
    if (!sumTON) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const { roomId } = await createRoom(Number(sumTON));
      navigate(`/battle/${roomId}`);
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSumTON(undefined);
        onClose();
      }}
    >
      <h2 className="text-[16px] font-semibold text-center mb-6">
        Create battle
      </h2>

      <div className="flex flex-col items-center">
        <NumberInput
          value={sumTON}
          onChange={(value) => setSumTON(value)}
          placeholder="TON"
          className="max-w-[92px]"
        />

        <div className="relative w-full flex justify-center">
          <ModalScissors className="absolute top-1/2 -translate-y-1/2 left-0" />
          <Button onClick={handleCreateBattle} className="px-6">
            Create battle
          </Button>
        </div>
      </div>

      {/* Peace Hand Image (пример позиционирования) */}
      {/* <img
            src="/peace-hand.png" // замените на свой путь
            alt="peace"
            className="absolute -left-8 bottom-4 w-16 drop-shadow-lg"
          /> */}
    </Modal>
  );
};
