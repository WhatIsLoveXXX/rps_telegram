import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
        <DialogPanel className="relative bg-[#141414] text-white rounded-xl p-6 w-[calc(100%-30px)] max-w-md shadow-lg">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
};
