import React from 'react';

type TutorialIconProps = {
  fill?: string;
};

const TutorialIcon: React.FC<TutorialIconProps> = ({ fill = 'currentColor' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke={fill}
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="9"/>
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Georgia, serif"
        fontSize="14"
        fontStyle="italic"
        fontWeight="bold"
        fill={fill}
        stroke="none"
      >
        i
      </text>
    </svg>
  );
};

export default TutorialIcon;
