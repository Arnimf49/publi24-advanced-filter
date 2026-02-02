import React, { CSSProperties } from 'react';
import styles from './PhoneAndTags.module.scss';
import {misc} from "../../../../core/misc";
import {IS_MOBILE_VIEW} from "../../../../../common/globals";
import {LeafIcon} from "../../Icons/LeafIcon";
import {dateLib} from "../../../../core/dateLib";
import {WhatsAppButton} from "../../../../../common/components/Button/WhatsAppButton";

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
        <WhatsAppButton
          phone={phone}
          message={whatsappMessage}
          className={styles.whatsapp}
          fill={misc.getPubliTheme() === 'light' ? '#7bcb32' : '#cfcfcf'}
          stroke={misc.getPubliTheme() === 'light' ? '#fff' : '#222'}
          svgStyle={svgStyle}
        />
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
