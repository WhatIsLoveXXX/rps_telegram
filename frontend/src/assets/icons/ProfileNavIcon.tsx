import * as React from "react";
import { SVGProps } from "react";

export const ProfileNavIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    fill="none"
    stroke="#fff"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.102 7.875a2.75 2.75 0 1 0 5.5 0 2.75 2.75 0 0 0-5.5 0ZM1.852 6.5V3.75A2.75 2.75 0 0 1 4.602 1h2.75M1.852 17.5v2.75A2.75 2.75 0 0 0 4.602 23h2.75M18.352 1h2.75a2.75 2.75 0 0 1 2.75 2.75V6.5M18.352 23h2.75a2.75 2.75 0 0 0 2.75-2.75V17.5M7.352 17.5a2.75 2.75 0 0 1 2.75-2.75h5.5a2.75 2.75 0 0 1 2.75 2.75"
    />
  </svg>
);
