import React, { CSSProperties } from 'react';
import styles from './PhoneAndTags.module.scss';
import {misc} from "../../../../core/misc";

type ContactInfoProps = {
  phone: string;
  isMobileView?: boolean;
  noPadding?: boolean;
  age?: number;
  ageWarn?: boolean;
  height?: number;
  weight?: number;
  bmi?: number;
  bmiWarn?: boolean;
};

const PhoneAndTags: React.FC<ContactInfoProps> = ({
   phone,
   isMobileView,
   noPadding = false,
   age,
   ageWarn = false,
   height,
   weight,
   bmi,
   bmiWarn = false,
 }) => {
  const headingStyle: CSSProperties = {
    fontWeight: 'bold',
    paddingTop: noPadding ? '0' : '10px',
    marginBottom: '-4px',
  };

  const svgStyle: CSSProperties = {
    height: '26px',
    verticalAlign: 'middle',
    marginBottom: '4px',
  };

  const ageChipClasses = misc.cx(
    styles.chip,
    ageWarn && styles.chipWarn
  );

  const bmiChipClasses = misc.cx(
    styles.chip,
    bmiWarn && styles.chipWarn
  );

  const whatsappPhone = phone.replace(/\D/g, '');

  return (
    <>
      <h4 style={headingStyle}>
        {isMobileView ? (
          <a href={`tel:${phone}`} data-wwid="phone-number">{phone}</a>
        ) : (
          <span data-wwid="phone-number">{phone}</span>
        )}
        <a
          href={`https://wa.me/+4${whatsappPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsapp}
          data-wwid="whatsapp"
          title="Deschide Whatsapp"
        >
          <svg style={svgStyle} viewBox="235.36 400.69 325.29 325.29" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="react-clip-path-b">
                <path d="M 0,841.89 H 595.276 V 0 H 0 Z"/>
              </clipPath>
              <linearGradient id="react-gradient-a" x2="1" gradientTransform="matrix(-1.53e-5 -243.96 243.96 -1.53e-5 298.5 541.37)" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7bcb32" offset="0"/>
                <stop stopColor="#5db420" offset="1"/>
              </linearGradient>
            </defs>
            <g transform="matrix(1.3333 0 0 -1.3333 0 1122.5)">
              <g clipPath="url(#react-clip-path-b)">
                <path d="m420.46 359.32c0-1.336-0.041-4.232-0.121-6.47-0.197-5.475-0.63-12.54-1.286-15.76-0.988-4.837-2.477-9.403-4.418-13.204-2.297-4.496-5.228-8.523-8.71-11.998-3.474-3.469-7.497-6.388-11.987-8.676-3.82-1.947-8.415-3.437-13.28-4.419-3.187-0.644-10.199-1.069-15.64-1.263-2.24-0.08-5.137-0.12-6.467-0.12l-120.13 0.019c-1.336 0-4.232 0.041-6.47 0.121-5.475 0.197-12.541 0.631-15.76 1.287-4.837 0.986-9.404 2.476-13.204 4.417-4.496 2.298-8.523 5.228-11.998 8.71-3.469 3.475-6.388 7.498-8.676 11.987-1.947 3.821-3.437 8.415-4.42 13.281-0.643 3.186-1.068 10.199-1.262 15.639-0.08 2.239-0.12 5.137-0.12 6.468l0.019 120.12c0 1.336 0.041 4.233 0.121 6.471 0.196 5.475 0.631 12.54 1.287 15.759 0.986 4.838 2.475 9.404 4.417 13.205 2.298 4.496 5.228 8.522 8.71 11.998 3.474 3.469 7.498 6.388 11.987 8.676 3.82 1.947 8.415 3.437 13.28 4.419 3.187 0.643 10.2 1.069 15.64 1.262 2.24 0.08 5.138 0.121 6.468 0.121l120.12-0.02c1.336 0 4.233-0.04 6.47-0.121 5.476-0.196 12.541-0.63 15.761-1.287 4.837-0.986 9.403-2.475 13.204-4.417 4.495-2.297 8.522-5.228 11.998-8.71 3.469-3.474 6.388-7.497 8.676-11.986 1.947-3.821 3.436-8.415 4.419-13.281 0.643-3.187 1.069-10.199 1.262-15.64 0.08-2.24 0.12-5.137 0.12-6.468z" fill="url(#react-gradient-a)"/> {/* Use renamed ID */}
                <path d="m341.14 403.54c-2.187 1.094-12.934 6.38-14.937 7.109-2.004 0.73-3.461 1.094-4.919-1.093-1.457-2.188-5.645-7.11-6.922-8.569-1.274-1.458-2.549-1.64-4.735-0.547-2.186 1.094-9.229 3.402-17.579 10.846-6.498 5.794-10.885 12.951-12.16 15.139s-0.135 3.37 0.959 4.46c0.983 0.978 2.185 2.552 3.279 3.828 1.092 1.276 1.457 2.188 2.186 3.646 0.728 1.458 0.364 2.735-0.183 3.828-0.546 1.094-4.918 11.85-6.74 16.225-1.774 4.261-3.576 3.685-4.918 3.752-1.274 0.063-2.732 0.077-4.189 0.077s-3.826-0.548-5.829-2.735c-2.004-2.188-7.651-7.475-7.651-18.23 0-10.756 7.833-21.147 8.926-22.605 1.093-1.459 15.414-23.531 37.341-32.996 5.215-2.252 9.288-3.597 12.462-4.604 5.237-1.663 10.001-1.428 13.768-0.866 4.2 0.628 12.933 5.287 14.755 10.392 1.821 5.104 1.821 9.479 1.275 10.39-0.547 0.911-2.004 1.458-4.189 2.553m-39.885-54.441h-0.029c-13.048 6e-3 -25.846 3.509-37.009 10.132l-2.656 1.576-27.52-7.217 7.346 26.823-1.73 2.75c-7.278 11.573-11.122 24.95-11.116 38.685 0.015 40.078 32.634 72.685 72.742 72.685 19.421-8e-3 37.678-7.579 51.407-21.318 13.728-13.739 21.285-32.003 21.277-51.425-0.016-40.082-32.635-72.691-72.712-72.691m61.884 134.56c-16.517 16.531-38.482 25.639-61.885 25.649-48.22 0-87.464-39.23-87.484-87.45-6e-3 -15.415 4.022-30.46 11.678-43.722l-12.411-45.319 46.376 12.161c12.778-6.967 27.164-10.639 41.806-10.645h0.036c3e-3 0-3e-3 0 0 0 48.215 0 87.464 39.235 87.483 87.455 9e-3 23.368-9.082 45.341-25.599 61.871" fill="#fff"/>
              </g>
            </g>
          </svg>
        </a>
      </h4>
      <div>
        {age != null && (
          <span className={ageChipClasses} data-wwid="age" data-wwstatus={ageWarn ? 'warn' : ''}>
            <b>{age}</b>ani
          </span>
        )}
        {height != null && (
          <span className={styles.chip} data-wwid="height">
            <b>{height}</b>cm
          </span>
        )}
        {weight != null && (
          <span className={styles.chip} data-wwid="weight">
            <b>{weight}</b>kg
          </span>
        )}
        {bmi != null && (
          <span className={bmiChipClasses} data-wwid="bmi" data-wwstatus={bmiWarn ? 'warn' : ''}>
            <b>{bmi}</b>bmi
          </span>
        )}
      </div>
    </>
  );
};

export default PhoneAndTags;
