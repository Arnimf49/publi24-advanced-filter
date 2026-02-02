import React, {useState} from 'react';
import styles from './HideReason.module.scss';
import {MANUAL_HIDE_REASONS} from "../../../core/hideReasons";
import {ManualHideReasonWithKey} from "./HideReasonRoot";
import {CloseIcon} from "../../../../publi24/component/Common/Icons/CloseIcon";

const REASONS = Object.keys(MANUAL_HIDE_REASONS);

type HideReasonProps = {
  onReasonSelect: (reason: ManualHideReasonWithKey, subcategory?: string) => void;
  onShowClick?: () => void;
  onClose?: () => void;
};

const HideReason: React.FC<HideReasonProps> = ({
  onReasonSelect,
  onShowClick,
  onClose,
}) => {
  const [selected, setSelected] = useState<null | string>(null);
  const [selectedCategory, setSelectedCategory] = useState<null | string>(null);
  const [showSubcategories, setShowSubcategories] = useState<boolean>(false);

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
    <div className={styles.hideReason} data-wwid="hide-reason-selection" style={{pointerEvents: 'auto'}}>
      <div className={styles.reasonButtonsContainer}>
        <div className={styles.title}>
          <span>Motivul ascunderii?</span>
          {onClose && (
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              data-wwid="close-hide-reason"
              aria-label="Închide"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        <div className={styles.reasonButtons}>
          {showSubcategories && selectedCategory ? (
            <>
              <button
                type="button"
                className={`${styles.reasonButton} ${styles.backButton}`}
                onClick={handleBackClick}
                data-wwid="back-button"
              >
                ← înapoi
              </button>

              <button
                type="button"
                className={`${styles.reasonButton} ${styles.reasonSelected}`}
                onClick={() => {
                  if (selectedCategory) {
                    setSelected(selectedCategory);
                    onReasonSelect({
                      key: selectedCategory,
                      config: MANUAL_HIDE_REASONS[selectedCategory]
                    }, '');
                  }
                }}
                data-wwselected={selected === selectedCategory ? "true" : ""}
                data-wwid="selected-category"
              >
                {selectedCategory} {"⬇"}
              </button>

              {MANUAL_HIDE_REASONS[selectedCategory].subcategories?.map((subcategory) => (
                <button
                  key={subcategory}
                  type="button"
                  className={`${styles.reasonButton} ${selected === `${selectedCategory}: ${subcategory}` ? styles.reasonSelected : ''}`}
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
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  className={`${styles.reasonButton} ${selected === reason ? styles.reasonSelected : ''}`}
                  onClick={() => handleCategoryClick(reason)}
                  data-wwselected={selected === reason ? "true" : ""}
                  data-wwid="reason"
                >
                  {reason}
                </button>
              ))}

              {onShowClick && (
                <button
                  type="button"
                  className={`${styles.reasonButton} ${styles.showButton}`}
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
    </div>
  );
};

export default HideReason;
