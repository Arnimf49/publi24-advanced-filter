import React, {useLayoutEffect, useRef, useState} from 'react';
import styles from './HideReason.module.scss';
import {misc} from "../../../../core/misc";
import {IS_AD_PAGE} from "../../../../core/globals";
import {IS_MOBILE_VIEW} from "../../../../../common/globals";
import {utils} from "../../../../../common/utils";

const REASONS = [
  "scump",
  "etnie",
  "țeapă",
  "înălțime",
  "comunicare",
  "formă",
  "servicii slabe",
  "poze false",
  "alta",
];

type HideReasonProps = {
  reasons?: string[];
  selectedReason?: string | null;
  onReasonSelect: (reason: string) => void;
  onShowClick?: () => void;
};

const HideReason: React.FC<HideReasonProps> = ({
 selectedReason = null,
 onReasonSelect,
 onShowClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<null | string>(selectedReason);

  useLayoutEffect(() => {
    if (containerRef.current && (IS_MOBILE_VIEW || IS_AD_PAGE)) {
      const bounding = containerRef.current.getBoundingClientRect();
      if (bounding.top < 120) {
        const scrollParent = utils.getScrollParent(containerRef.current);
        scrollParent?.scrollBy({top: - (120 - bounding.top), behavior: "instant"});
      }
    }
  }, []);

  return (
    <div
      className={styles.hideReason}
      data-wwid="hide-reason-selection"
      ref={containerRef}
    >
      <div className={styles.reasonButtonsContainer}>
        <span className={styles.title}>motivul ascunderii?</span>

        {REASONS.map((reason) => (
          <button
            key={reason}
            type="button"
            className={misc.cx(
              styles.reasonButton,
              selected === reason && styles.reasonSelected
            )}
            onClick={() => {
              setSelected(reason)
              onReasonSelect(reason)
            }}
            data-wwselected={selected === reason ? "true" : ""}
            data-wwid="reason"
          >
            {reason}
          </button>
        ))}

        {onShowClick && (
          <button
            type="button"
            className={misc.cx(styles.reasonButton, styles.showButton)}
            onClick={onShowClick}
            data-wwid="show-button"
          >
            arată
          </button>
        )}
      </div>
    </div>
  );
};

export default HideReason;
