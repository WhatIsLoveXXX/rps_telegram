import { FC } from "react";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Input: FC<InputProps> = ({ value, onChange, placeholder }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 mb-4 bg-[#111] border border-gray-700 rounded-lg placeholder:italic text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};
