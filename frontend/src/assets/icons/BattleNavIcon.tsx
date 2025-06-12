import { SVGProps } from "react";

export const BattleNavIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={19}
    height={22}
    fill="none"
    stroke="#fff"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5.852 12V4.5a1.5 1.5 0 1 1 3 0V11M8.852 4.5v-2a1.5 1.5 0 0 1 3 0V11M11.852 4.5a1.5 1.5 0 1 1 3 0V11"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.852 6.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-2 .208a6 6 0 0 1-5.012-2.7l-.196-.3c-.312-.479-1.407-2.388-3.286-5.728a1.5 1.5 0 0 1 .536-2.022 1.867 1.867 0 0 1 2.28.28L5.852 12"
    />
  </svg>
);
