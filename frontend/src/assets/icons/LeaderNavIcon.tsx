import { SVGProps } from "react";

export const LeaderNavIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={23}
    height={23}
    fill="none"
    stroke="#fff"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.884 8.123a7.002 7.002 0 1 0 14.005 0 7.002 7.002 0 0 0-14.005 0Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.886 15.126 15.854 22l1.865-3.773 4.2.27-3.968-6.872M5.82 11.625l-3.968 6.874 4.199-.272 1.865 3.772 3.968-6.873"
    />
  </svg>
);
