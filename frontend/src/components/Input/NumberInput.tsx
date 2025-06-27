import { FC } from "react";
import clsx from "clsx";
import { NumericFormat, NumericFormatProps } from "react-number-format";

type InputProps = Omit<
  NumericFormatProps,
  "onValueChange" | "value" | "onChange"
> & {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
};

export const NumberInput: FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  ...props
}) => {
  return (
    <NumericFormat
      value={value}
      onValueChange={(values) => {
        // if (values.floatValue !== undefined) {
        onChange(values.floatValue);
        // }
      }}
      placeholder={placeholder}
      className={clsx(
        "w-full text-[12px] block px-4 py-1 bg-[#191919] border border-[#313030] rounded-lg placeholder:text-[#4A4A4A] text-white focus:outline-none focus:ring-2 focus:ring-[#1B73DD]",
        className
      )}
      allowNegative={false}
      decimalScale={0}
      {...props}
    />
  );
};
