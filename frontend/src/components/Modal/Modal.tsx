import { Dialog, DialogPanel } from "@headlessui/react";
import CloseModalIcon from "@/assets/close-modal.svg?react";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose || (() => {})}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
        <DialogPanel className="relative bg-[#141414] text-white rounded-xl  w-[calc(100%-30px)] py-6 max-w-md shadow-lg">
          {/* Close Button */}
          {onClose && (
            <CloseModalIcon
              onClick={onClose}
              className="absolute -top-1 -right-1"
            />
          )}

          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
};
