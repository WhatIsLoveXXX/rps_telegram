import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { Modal } from "@/components/Modal/Modal";
import { FC, useState } from "react";
import { createRoom } from "../../../../../services/room.api";
import { useInitDataRow } from "@/hooks/useInitDataRow";
import { useNavigate } from "react-router-dom";

interface CreateBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBattleModal: FC<CreateBattleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const initDataRaw = useInitDataRow();
  const [sumTON, setSumTON] = useState("");
  const navigate = useNavigate();

  const handleCreateBattle = async () => {
    try {
      // const response = await createRoom(initDataRaw, Number(sumTON));
      // console.log(response);
      // navigate(`/battle/${response.id}`);
      navigate(`/battle/1`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-[16px] font-semibold text-center mb-6">
        Create battle
      </h2>

      <Input
        value={sumTON}
        onChange={(value) => setSumTON(value)}
        placeholder="SumTON"
      />

      <Button onClick={handleCreateBattle}>Create battle</Button>

      {/* Peace Hand Image (пример позиционирования) */}
      {/* <img
            src="/peace-hand.png" // замените на свой путь
            alt="peace"
            className="absolute -left-8 bottom-4 w-16 drop-shadow-lg"
          /> */}
    </Modal>
  );
};
