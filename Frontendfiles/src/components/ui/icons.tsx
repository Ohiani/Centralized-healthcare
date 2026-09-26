import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

const createIcon =
  (...paths: string[]) =>
  (props: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths.map((d, index) => (
        <path key={index} d={d} />
      ))}
    </svg>
  );

export const Shield = createIcon("M12 3l7 3v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z");
export const Activity = createIcon("M3 12h4l2-6 4 12 3-9 2 3h3");
export const User = createIcon(
  "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  "M4 21c0-4 4-6 8-6s8 2 8 6"
);
export const Users = createIcon(
  "M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  "M8 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  "M2 21c0-3 3-5 6-5",
  "M14 16c4 0 8 2 8 5"
);
export const Settings = createIcon(
  "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  "M4 12h2",
  "M18 12h2",
  "M12 4v2",
  "M12 18v2",
  "M6.3 6.3l1.4 1.4",
  "M16.3 16.3l1.4 1.4",
  "M17.7 6.3l-1.4 1.4",
  "M7.7 16.3l-1.4 1.4"
);
export const LogOut = createIcon(
  "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
  "M16 17l5-5-5-5",
  "M21 12H9"
);
export const Bell = createIcon(
  "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7",
  "M13.5 21a1.5 1.5 0 0 1-3 0"
);
export const Hospital = createIcon(
  "M3 21h18",
  "M5 21V7l7-4 7 4v14",
  "M9 21v-6h6v6",
  "M12 9v4",
  "M10 11h4"
);
export const Database = createIcon(
  "M4 6c0 1.7 3.6 3 8 3s8-1.3 8-3-3.6-3-8-3-8 1.3-8 3z",
  "M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6",
  "M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"
);
export const Search = createIcon(
  "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z",
  "M20 20l-3.5-3.5"
);
export const PlusCircle = createIcon(
  "M12 8v8",
  "M8 12h8",
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"
);
