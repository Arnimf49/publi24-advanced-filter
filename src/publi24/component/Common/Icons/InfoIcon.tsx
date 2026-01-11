import React from 'react';

type InfoIconProps = {
  size?: number;
};

const InfoIcon: React.FC<InfoIconProps> = ({ size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 24"
      width={size / 2}
      height={size}
      data-wwid="info-icon"
    >
      <text
        x="6"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Georgia, serif"
        fontSize="24"
        fontStyle="italic"
        fontWeight="bold"
        opacity={0.67}
        fill="currentColor"
      >
        i
      </text>
    </svg>
  );
};

export default InfoIcon;
