import React, { CSSProperties } from 'react';
import styles from './PhoneAndTags.module.scss';
import {misc} from "../../../../core/misc";
import {IS_MOBILE_VIEW} from "../../../../../common/globals";
import {LeafIcon} from "../../Icons/LeafIcon";
import {dateLib} from "../../../../core/dateLib";

type ContactInfoProps = {
  phone: string;
  noPadding?: boolean;
  age?: number;
  ageWarn?: boolean;
  height?: number;
  weight?: number;
  bmi?: number;
  bmiWarn?: boolean;
  whatsappMessage?: string | null;
  firstSeen: number;
  children?: React.ReactNode;
};

const PhoneAndTags: React.FC<ContactInfoProps> = ({
   phone,
   noPadding = false,
   age,
   ageWarn = false,
   height,
   weight,
   bmi,
   bmiWarn = false,
   whatsappMessage = null,
   firstSeen,
   children,
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
  const whatsappUrl = whatsappMessage
    ? `https://wa.me/+4${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
    : `https://wa.me/+4${whatsappPhone}`;

  const daysSinceFirstSeen = Math.floor((Date.now() - firstSeen) / 8.64e+7);
  const monthsSinceFirstSeen = daysSinceFirstSeen / 30;

  const leafState: 'fresh' | 'stale' | 'old' =
    monthsSinceFirstSeen < 1 ? 'fresh' :
    monthsSinceFirstSeen < 6 ? 'stale' : 'old';

  const { daysString } = dateLib.calculateTimeSince(firstSeen);

  return (
    <>
      <h4 style={headingStyle}>
        {IS_MOBILE_VIEW ? (
          <a href={`tel:${phone}`} className={styles.phone} data-wwid="phone-number">{phone}</a>
        ) : (
          <span className={styles.phone} data-wwid="phone-number">{phone}</span>
        )}
        <button
          className={styles.leafButton}
          data-wwid="leaf-button"
        >
          <LeafIcon state={leafState} />
          <span className={styles.leafTooltip}>Văzut prima data de extensie: <br/> {daysString}</span>
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsapp}
          data-wwid="whatsapp"
          title="Deschide Whatsapp"
        >
          <svg
            viewBox="0 0 325 325"
            xmlns="http://www.w3.org/2000/svg"
            style={svgStyle}
            role="img"
            aria-label="logo"
          >
            <rect
              x="8"
              y="8"
              width="309"
              height="309"
              rx="42"
              ry="42"
              fill={misc.getPubliTheme() === 'light' ? '#7bcb32' : '#cfcfcf'}
            />

            <g transform="translate(50.5,48.5) scale(7)">
              <path
                d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z"
                fill={misc.getPubliTheme() === 'light' ? '#fff' : '#222'}
              />
            </g>
          </svg>
        </a>
        {children}
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
