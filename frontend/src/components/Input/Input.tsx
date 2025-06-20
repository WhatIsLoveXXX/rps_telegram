import { FC, InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ value, onChange, placeholder, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          "w-full text-[12px] block px-4 py-1 bg-[#191919] border border-[#313030] rounded-lg placeholder:text-[#4A4A4A] text-white focus:outline-none focus:ring-2 focus:ring-[#1B73DD]",
          props.readOnly && "bg-[#252525] cursor-not-allowed opacity-70",
          className
        )}
        {...props}
      />
    );
  }
);
