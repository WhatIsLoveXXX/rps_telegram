import { FC } from "react";
import clsx from "clsx";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export const Button: FC<ButtonProps> = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "bg-[#1B73DD] px-3 hover:bg-[#1B73DD]/80 text-white font-medium py-2 rounded-lg transition",
        className
      )}
    >
      <p className="text-xs text-white">{children}</p>
    </button>
  );
};
