import { FC } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: ButtonVariant;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-[#1B73DD] hover:bg-[#1B73DD]/80 text-white",
  secondary: "border border-[#1B73DD] text-[#1B73DD] bg-transparent",
};

export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  className,
  variant = "primary",
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-3 py-2 rounded-lg transition font-medium",
        buttonVariants[variant],
        className
      )}
    >
      <p className="text-xs">{children}</p>
    </button>
  );
};
