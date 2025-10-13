import React, {ChangeEvent, KeyboardEvent, useState} from 'react';
import ContentModal from '../../Common/Modal/ContentModal';
import styles from './SettingsModal.module.scss';
import {AutoHideCriterias} from "../../../core/storage";
import {SettingsIcon} from "../../Common/Icons/SettingsIcon";
import {misc} from "../../../core/misc";

type SwitchProps = {
  isOn?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

const Switch: React.FC<SwitchProps> = ({ isOn, onClick }) => (
  <div
    className={`${styles.switchContainer} ${isOn ? styles.switchOn : ''}`}
    onClick={onClick}
    role="switch"
    aria-checked={isOn}
  >
    <div className={styles.switchBall}></div>
  </div>
);

type SettingControlProps = {
  title: string;
  description?: string | React.ReactNode;
  isOn?: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
  dataWwid?: string;
  dataCriteria?: string;
  showDetails?: boolean;
};

const SettingControl: React.FC<SettingControlProps> =
({
   title,
   description,
   isOn, onToggle,
   children,
   dataWwid,
   dataCriteria,
   showDetails = true
}) => {
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('input, button, a')) {
      e.stopPropagation();
    }
  };

  return (
    <div
      className={styles.control}
      data-wwid={dataWwid}
      data-wwcriteria={dataCriteria}
      onClick={onToggle}
    >
      <div className={styles.controlSwitch}>
        <Switch isOn={isOn}/>
      </div>
      <div className={styles.controlContent} onClick={handleContentClick}>
        <div className={styles.controlTitle}>{title}</div>
        {description && (
          <div className={`${styles.controlDescription} ${!showDetails ? styles.isHidden : ''}`}>
            {description}
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export type SettingsData = {
  focusMode: boolean;
  adDeduplication: boolean;
  autoHide: boolean;
  nextOnlyVisible: boolean;
  defaultManualHideReasonEnabled: boolean;
  defaultManualHideReason: string;
} & AutoHideCriterias;

type SettingsModalProps = {
  onClose: () => void;
  settings: SettingsData;
  onToggleFocusMode: () => void;
  onToggleAdDeduplication: () => void;
  onToggleAutoHide: () => void;
  onToggleNextOnlyVisible: () => void;
  onToggleDefaultManualHideReason: () => void;
  onDefaultManualHideReasonChange: (reason: string) => void;
  onToggleCriteria: (criteriaKey: keyof AutoHideCriterias) => void;
  onCriteriaValueChange: (criteriaKey: keyof AutoHideCriterias, value: number) => void;
  handleExport: () => void;
  handleImport: () => Promise<void>;
};

const SettingsModal: React.FC<SettingsModalProps> =
({
  onClose,
  settings,
  onToggleFocusMode,
  onToggleAdDeduplication,
  onToggleAutoHide,
  onToggleNextOnlyVisible,
  onToggleDefaultManualHideReason,
  onDefaultManualHideReasonChange,
  onToggleCriteria,
  onCriteriaValueChange,
  handleExport,
  handleImport,
}) => {
  const [importMessage, setImportMessage] = useState<[string, string]|null>(null);

  const handleValueChange = (
    criteriaKey: keyof AutoHideCriterias,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      onCriteriaValueChange(criteriaKey, value);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).blur();
    }
  };

  const configureImportMessage = (style: string, message: string, time: number = 6000) => {
    setImportMessage([style, message]);
    setTimeout(() => setImportMessage(null), time);
  }

  const onImport = () => {
    setImportMessage(null);
    handleImport()
      .then(() => {
        configureImportMessage(styles.successMessage, 'Datele au fost importate cu succes. Reîncărcarea paginii imediat ..');
        setTimeout(() => window.location.reload(), 4000);
      })
      .catch(err => configureImportMessage(styles.errorMessage, 'Probleme cu import-ul: ' + err.message, 12000));
  }

  return (
    <ContentModal
      title={<><SettingsIcon fill={misc.getPubliTheme() === 'dark' ? '#bfbfbf' : '#fff'}/> Setări</>}
      onClose={onClose}
      maxWidth={600}
      color={misc.getPubliTheme() === 'dark' ? 'rgb(127 105 24)' : '#c59b2f'}
    >
      <SettingControl
        title="Mod focus"
        description="Cănd activat anunțurile ascunse anterior nu se vor mai afișa deloc pe pagina de listare. Util pentru a vedea numai cea ce ii nou sau încă ne-ascuns."
        isOn={settings.focusMode}
        onToggle={onToggleFocusMode}
        dataWwid="focus-mode-switch"
      />
      <SettingControl
        title="Singur anunț"
        description="Cănd activat numai cel mai nou anunț de la aceeași telefon va fii vizibil pe pagina de listare."
        isOn={settings.adDeduplication}
        onToggle={onToggleAdDeduplication}
        dataWwid="ad-deduplication-switch"
      />

      <SettingControl
        title="Motiv implicit ascundere"
        description="Când este activat, motivul selectat va fi ales implicit la ascunderea manuală (dacă 'poze false' nu este deja selectat)."
        isOn={settings.defaultManualHideReasonEnabled}
        onToggle={onToggleDefaultManualHideReason}
        dataWwid="default-manual-hide-reason-switch"
        showDetails={settings.defaultManualHideReasonEnabled}
      >
        <select
          className={styles.controlSelect}
          value={settings.defaultManualHideReason}
          onChange={(e) => onDefaultManualHideReasonChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          data-wwid="default-manual-hide-reason-select"
        >
          <option value="aspect">aspect</option>
          <option value="comportament">comportament</option>
          <option value="alta">alta</option>
        </select>
      </SettingControl>

      <div className={styles.controlSpacer}></div>

      <SettingControl
        title="Ascundere automată"
        description="Ascunde automat anunțuri pe bază la varii criterii."
        isOn={settings.autoHide}
        onToggle={onToggleAutoHide}
        dataWwid="auto-hiding"
      />

      {settings.autoHide && (
        <div className={styles.controlInset}>
          <SettingControl
            title="Următorul numai vizibil"
            description="La căutarea anunțului următor se va sări peste cele noi care sunt ascunse după analiză."
            isOn={settings.nextOnlyVisible}
            onToggle={onToggleNextOnlyVisible}
            dataWwid="next-only-visible"
            showDetails={settings.nextOnlyVisible}
          />

          <SettingControl
            title="Maximum ani"
            description="Dacă specifică ani mai mare decăt cea setată va fii ascuns."
            isOn={settings.maxAge}
            onToggle={() => onToggleCriteria('maxAge')}
            dataWwid="auto-hide-criteria" dataCriteria="maxAge"
            showDetails={settings.maxAge}
          >
            <input
              type="number"
              className={styles.controlInput}
              defaultValue={settings.maxAgeValue ?? ''}
              onChange={(e) => handleValueChange('maxAgeValue', e)}
              onKeyDown={handleInputKeyDown}
            />
          </SettingControl>

          <SettingControl
            title="Minimum înălțime"
            description="Dacă specifică înălțime mai mică decăt cea setată va fii ascuns."
            isOn={settings.minHeight}
            onToggle={() => onToggleCriteria('minHeight')}
            dataWwid="auto-hide-criteria" dataCriteria="minHeight"
            showDetails={settings.minHeight}
          >
            <input
              type="number"
              className={styles.controlInput}
              defaultValue={settings.minHeightValue ?? ''}
              onChange={(e) => handleValueChange('minHeightValue', e)}
              onKeyDown={handleInputKeyDown}
            />
          </SettingControl>

          <SettingControl
            title="Maximum înălțime"
            description="Dacă specifică înălțime mai mare decăt cea setată va fii ascuns."
            isOn={settings.maxHeight}
            onToggle={() => onToggleCriteria('maxHeight')}
            dataWwid="auto-hide-criteria" dataCriteria="maxHeight"
            showDetails={settings.maxHeight}
          >
            <input
              type="number"
              className={styles.controlInput}
              defaultValue={settings.maxHeightValue ?? ''}
              onChange={(e) => handleValueChange('maxHeightValue', e)}
              onKeyDown={handleInputKeyDown}
            />
          </SettingControl>

          <SettingControl
            title="Maximum greutate"
            description="Dacă specifică greutate mare decăt cea setată va fii ascuns."
            isOn={settings.maxWeight}
            onToggle={() => onToggleCriteria('maxWeight')}
            dataWwid="auto-hide-criteria" dataCriteria="maxWeight"
            showDetails={settings.maxWeight}
          >
            <input
              type="number"
              className={styles.controlInput}
              defaultValue={settings.maxWeightValue ?? ''}
              onChange={(e) => handleValueChange('maxWeightValue', e)}
              onKeyDown={handleInputKeyDown}
            />
          </SettingControl>

          <SettingControl
            title="Matură"
            description="Dacă ii menționat matură atunci va fii ascuns."
            isOn={settings.mature}
            onToggle={() => onToggleCriteria('mature')}
            dataWwid="auto-hide-criteria" dataCriteria="mature"
            showDetails={settings.mature}
          />
          <SettingControl
            title="Transsexual"
            description="Dacă ii menționat trans atunci va fii ascuns."
            isOn={settings.trans}
            onToggle={() => onToggleCriteria('trans')}
            dataWwid="auto-hide-criteria" dataCriteria="trans"
            showDetails={settings.trans}
          />
          <SettingControl
            title="Siliconată"
            description="Dacă zice că are botox / silicoane va fii ascuns."
            isOn={settings.botox}
            onToggle={() => onToggleCriteria('botox')}
            dataWwid="auto-hide-criteria" dataCriteria="botox"
            showDetails={settings.botox}
          />
          <SettingControl
            title="Numai deplasări"
            description="Dacă numai deplasări face / fară locație proprie va fii ascuns."
            isOn={settings.onlyTrips}
            onToggle={() => onToggleCriteria('onlyTrips')}
            dataWwid="auto-hide-criteria" dataCriteria="onlyTrips"
            showDetails={settings.onlyTrips}
          />
          <SettingControl
            title="Show web"
            description="Dacă zice că face show web va fii ascuns. Cei care fac show web tind să fie mai țepari."
            isOn={settings.showWeb}
            onToggle={() => onToggleCriteria('showWeb')}
            dataWwid="auto-hide-criteria" dataCriteria="showWeb"
            showDetails={settings.showWeb}
          />
          <SettingControl
            title="Risc BTS"
            description="Dacă descrierea conține formulări cu indici că ar face normal sau anal neprotejat atunci va fii ascuns."
            isOn={settings.btsRisc}
            onToggle={() => onToggleCriteria('btsRisc')}
            dataWwid="auto-hide-criteria" dataCriteria="btsRisc"
            showDetails={settings.btsRisc}
          />
          <SettingControl
            title="Party"
            description="Dacă zice că face party va fii ascuns. Cei care fac party tind să fie mai obosite și mai riscante din multe puncte de vedere."
            isOn={settings.party}
            onToggle={() => onToggleCriteria('party')}
            dataWwid="auto-hide-criteria" dataCriteria="party"
            showDetails={settings.party}
          />
        </div>
      )}

      <h2 className={styles.header}>Transfer date</h2>
      {importMessage && <p className={misc.cx(importMessage[0], styles.importMessage)}>{importMessage[1]}</p>}
      <button onClick={handleExport} className={styles.button}>↑ export</button>
      <button onClick={onImport} className={styles.button}>↓ import</button>

      <hr style={{ opacity: 0.2, marginTop: '25px', marginBottom: '15px' }} />
      <p className={styles.footerText}>
        Pentru probleme sau idei scrie la <b>arnimf49@gmail.com</b>
      </p>
    </ContentModal>
  );
};

export default SettingsModal;
