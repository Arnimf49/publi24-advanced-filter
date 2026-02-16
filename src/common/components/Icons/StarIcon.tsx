import React from "react";

export const StarIcon =
({
   className = '',
   fill = 'white',
   stroke = 'none',
   strokeWidth = 0,
}) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="1 2 23 22"
    fill={fill}
    strokeWidth={strokeWidth}
    stroke={stroke}
  >
    <polygon points="12,2 15,10 23,10 17,14 19,22 12,17 5,22 7,14 1,10 9,10"/>
  </svg>
);
