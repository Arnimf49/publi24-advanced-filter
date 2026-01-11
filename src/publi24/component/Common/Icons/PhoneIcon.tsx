import React from "react";

interface PhoneIconProps {
  fill?: string;
  size?: number;
}

export const PhoneIcon = ({fill = '#fff', size = 24}: PhoneIconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" stroke={fill}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
