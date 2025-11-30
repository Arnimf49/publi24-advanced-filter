import React, {useLayoutEffect, useRef, useState} from 'react';
import styles from './HideReason.module.scss';
import {misc} from "../../../../core/misc";
import {IS_AD_PAGE} from "../../../../core/globals";
import {IS_MOBILE_VIEW} from "../../../../../common/globals";
import {utils} from "../../../../../common/utils";
import {MANUAL_HIDE_REASONS} from "../../../../core/hideReasons";
import {ManualHideReasonWithKey} from "./HideReasonRoot";

const REASONS = Object.keys(MANUAL_HIDE_REASONS);

type HideReasonProps = {
  reasons?: string[];
  selectedReason?: string | null;
  defaultReason?: string | null;
  onReasonSelect: (reason: ManualHideReasonWithKey, subcategory?: string) => void;
  onShowClick?: () => void;
};

const HideReason: React.FC<HideReasonProps> = ({
 selectedReason = null,
 defaultReason = null,
 onReasonSelect,
 onShowClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const initialSelection = selectedReason || defaultReason;
  const [selected, setSelected] = useState<null | string>(initialSelection);
  const [selectedCategory, setSelectedCategory] = useState<null | string>(null);
  const [showSubcategories, setShowSubcategories] = useState<boolean>(false);

  useLayoutEffect(() => {
    if (containerRef.current && (IS_MOBILE_VIEW || IS_AD_PAGE())) {
      const bounding = containerRef.current.getBoundingClientRect();
      if (bounding.top < 120) {
        const scrollParent = utils.getScrollParent(containerRef.current);
        scrollParent?.scrollBy({top: - (120 - bounding.top), behavior: "instant"});
      }
    }
  }, []);

  useLayoutEffect(() => {
    if (initialSelection) {
      const reasonConfig = MANUAL_HIDE_REASONS[initialSelection];
      if (reasonConfig) {
        onReasonSelect({
          key: initialSelection,
          config: reasonConfig
        });

        if (reasonConfig.subcategories && reasonConfig.subcategories.length > 0) {
          setSelectedCategory(initialSelection);
          setShowSubcategories(true);
        }
      }
    }
  }, [initialSelection, onReasonSelect]);

  const handleCategoryClick = (reason: string) => {
    const reasonConfig = MANUAL_HIDE_REASONS[reason];

    setSelected(reason);
    onReasonSelect({
      key: reason,
      config: reasonConfig
    });

    if (reasonConfig.subcategories && reasonConfig.subcategories.length > 0) {
      setSelectedCategory(reason);
      setShowSubcategories(true);
    }
  };

  const handleSubcategoryClick = (subcategory: string) => {
    if (!selectedCategory) return;

    const reasonKey = `${selectedCategory}: ${subcategory}`;
    setSelected(reasonKey);
    onReasonSelect({
      key: selectedCategory,
      config: MANUAL_HIDE_REASONS[selectedCategory]
    }, subcategory);
  };

  const handleBackClick = () => {
    setShowSubcategories(false);
    setSelectedCategory(null);
  };

  return (
    <div
      className={styles.hideReason}
      data-wwid="hide-reason-selection"
      ref={containerRef}
    >
      <div className={styles.reasonButtonsContainer}>
        <span className={styles.title}>
          motivul ascunderii?
        </span>

        {showSubcategories && selectedCategory ? (
          <>
            <button
              type="button"
              className={misc.cx(styles.reasonButton, styles.backButton)}
              onClick={handleBackClick}
              data-wwid="back-button"
            >
              ← înapoi
            </button>

            <button
              type="button"
              className={misc.cx(styles.reasonButton, styles.reasonSelected)}
              onClick={() => {
                if (selectedCategory) {
                  onReasonSelect({
                    key: selectedCategory,
                    config: MANUAL_HIDE_REASONS[selectedCategory]
                  }, '');
                }
              }}
              data-wwid="selected-category"
            >
              {selectedCategory}
            </button>

            {MANUAL_HIDE_REASONS[selectedCategory].subcategories?.map((subcategory) => (
              <button
                key={subcategory}
                type="button"
                className={misc.cx(
                  styles.reasonButton,
                  selected === `${selectedCategory}: ${subcategory}` && styles.reasonSelected
                )}
                onClick={() => handleSubcategoryClick(subcategory)}
                data-wwselected={selected === `${selectedCategory}: ${subcategory}` ? "true" : ""}
                data-wwid="subcategory"
              >
                {subcategory}
              </button>
            ))}
          </>
        ) : (
          <>
            {REASONS.map((reason) => {
              const isTemporar = reason === 'temporar';
              return (
                <button
                  key={reason}
                  type="button"
                  className={misc.cx(
                    styles.reasonButton,
                    isTemporar && styles.temporarButton,
                    selected === reason && styles.reasonSelected
                  )}
                  onClick={() => handleCategoryClick(reason)}
                  data-wwselected={selected === reason ? "true" : ""}
                  data-wwid="reason"
                >
                  {isTemporar ? (
                    <>
                      <div>temporar</div>
                      <div className={styles.temporarSubtext}>15 zile</div>
                    </>
                  ) : (
                    reason
                  )}
                </button>
              );
            })}

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
          </>
        )}
      </div>
    </div>
  );
};

export default HideReason;
