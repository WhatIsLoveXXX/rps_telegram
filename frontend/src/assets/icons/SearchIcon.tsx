import { SVGProps } from "react";
export const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <path
      stroke="#1B73DD"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M1 6.444a5.444 5.444 0 1 0 10.889 0A5.444 5.444 0 0 0 1 6.444ZM15 15l-4.667-4.667"
    />
  </svg>
);
