import React from "react";

type VisibilityIconProps = {
  visible?: boolean;
  size?: number;
};

export const VisibilityIcon: React.FC<VisibilityIconProps> = ({visible = false, size = 24}) => {
  return !visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <mask id="cut-mask-react">
          <rect width="24" height="24" fill="white"></rect>
          <line x1="6" y1="6" x2="24" y2="24" stroke="black" strokeWidth="4"></line>
        </mask>
      </defs>
      <g mask="url(#cut-mask-react)">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="4"></circle>
      </g>
      <line x1="3" y1="3" x2="21" y2="21" strokeWidth="1"></line>
    </svg>
  );
}
