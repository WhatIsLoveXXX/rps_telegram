import { SVGProps } from "react";

export const LeaderNavIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={22}
    fill="none"
    stroke="#fff"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7.03 21h9.412M11.736 16.294V21M5.854 1h11.765M17.619 1v9.412a5.882 5.882 0 1 1-11.765 0V1"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M1.148 6.882a2.353 2.353 0 1 0 4.706 0 2.353 2.353 0 0 0-4.706 0ZM17.619 6.882a2.353 2.353 0 1 0 4.706 0 2.353 2.353 0 0 0-4.706 0Z"
    />
  </svg>
);
