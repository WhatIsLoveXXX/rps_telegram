import { ButtonHTMLAttributes, FC } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: ButtonVariant;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#1B73DD] hover:bg-[#1B73DD]/80 text-white disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed",
  secondary:
    "border border-[#1B73DD] text-[#1B73DD] bg-transparent disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed",
};

export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  className,
  variant = "primary",
  disabled,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "px-3 py-2 rounded-lg transition font-medium cursor-pointer text-xs",
        buttonVariants[variant],
        className
      )}
      {...props}
    >
      <p>{children}</p>
    </button>
  );
};
