import React, {useState} from 'react';
import Modal from '../../../common/components/Modal/Modal';
import {CloseIcon} from '../../../common/components/Icons/CloseIcon';
import {exclusionFilter} from '../../core/exclusionFilter';
import {ExclusionIcon} from '../Common/Icons/ExclusionIcon';
import styles from './ExclusionFilter.module.scss';

type ExclusionFilterProps = {
  cities: string[];
};

const ExclusionFilter: React.FC<ExclusionFilterProps> = ({cities}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedValues = exclusionFilter.getSelectedValues();
  const [selectedCities, setSelectedCities] = useState(selectedValues);

  const toggleCity = (city: string) => {
    setSelectedCities((current) => current.includes(city)
      ? current.filter((value) => value !== city)
      : [...current, city]);
  };

  const apply = () => {
    exclusionFilter.setSelectedValues(selectedCities);
    window.location.reload();
  };

  const open = () => {
    setSelectedCities(exclusionFilter.getSelectedValues());
    setIsOpen(true);
  };

  return (
    <>
      <div className={`filter-button-wrap ${styles.control}`}>
        <button type="button" className={`btn-filters ${styles.button}`} onClick={open}>
          <i className="icon-filters">
            <ExclusionIcon className={styles.icon} />
          </i>
          Exclus
          {selectedValues.length > 0 && (
            <span className={`active-filters-bubble ${styles.count}`}>{selectedValues.length}</span>
          )}
        </button>
      </div>

      {isOpen && (
        <Modal close={() => setIsOpen(false)} dataWwid="exclusion-filter-modal">
          <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={styles.close}
              onClick={() => setIsOpen(false)}
              aria-label="Închide"
            >
              <CloseIcon />
            </button>
            <div className={styles.content}>
              <h2 className={styles.title}>Excluderi</h2>
              <div className={styles.list}>
                {cities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    className={styles.option}
                    aria-pressed={selectedCities.includes(city)}
                    onClick={() => toggleCity(city)}
                  >
                    <span
                      className={`${styles.checkbox} ${selectedCities.includes(city) ? styles.checkboxSelected : ''}`}
                      aria-hidden="true"
                    >
                      {selectedCities.includes(city) ? '✓' : ''}
                    </span>
                    <span>{city}</span>
                  </button>
                ))}
              </div>
              <div className={styles.actions}>
                <button type="button" className={`${styles.action} ${styles.cancel}`} onClick={() => setIsOpen(false)}>
                  Anulează
                </button>
                <button type="button" className={`${styles.action} ${styles.confirm}`} onClick={apply}>
                  Confirmă
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ExclusionFilter;
