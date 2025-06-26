import { SVGProps } from "react";

export const ProfileNavIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={22}
    fill="none"
    stroke="#fff"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3.37 5.444a4.444 4.444 0 1 0 8.89 0 4.444 4.444 0 0 0-8.89 0ZM1.148 21v-2.222a4.445 4.445 0 0 1 4.445-4.445h4.444a4.444 4.444 0 0 1 4.444 4.445V21"
    />
  </svg>
);
