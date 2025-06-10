import { FC, useState } from "react";
import { Page } from "@/components/Page.tsx";
import { CreateBattleModal } from "./components/CreateBattleModal/CreateBattleModal";
import { useNavigate } from "react-router-dom";

export const MainPage: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Page back={false}>
      <h1 className="text-center font-semibold mb-4">Actual battle</h1>

      <button onClick={() => setIsModalOpen(true)}>Create battle</button>

      <div>
        <button
          onClick={() =>
            navigate("/battle/7be9fec6-e9b1-4764-910c-f4215e34e431")
          }
        >
          Open test battle
        </button>
      </div>

      <CreateBattleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Page>
  );
};
