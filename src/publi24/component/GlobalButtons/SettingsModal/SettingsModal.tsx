import React, {ChangeEvent, KeyboardEvent, useState} from 'react';
import ContentModal from '../../../../common/components/Modal/ContentModal';
import styles from './SettingsModal.module.scss';
import type {AutoHideCriterias} from "../../../core/storage";
import {SettingsIcon} from "../../../../common/components/Icons/SettingsIcon";

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
  showChildren?: boolean;
};

const SettingControl: React.FC<SettingControlProps> =
({
   title,
   description,
   isOn, onToggle,
   children,
   dataWwid,
   dataCriteria,
   showDetails = true,
   showChildren = true
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
        {description && showDetails && (
          <div className={`${styles.controlDescription}`}>
            {description}
          </div>
        )}
        {children && showChildren && (
          <div className={`${styles.controlDescription}`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export type SettingsData = {
  whatsappMessageEnabled: boolean;
  whatsappMessage: string;
  focusMode: boolean;
  adDeduplication: boolean;
  autoHide: boolean;
  nextOnlyVisible: boolean;
  defaultManualHideReasonEnabled: boolean;
  defaultManualHideReason: string;
  manualPhoneSearchEnabled: boolean;
  manualImageSearchEnabled: boolean;
} & AutoHideCriterias;

type SettingsModalProps = {
  onClose: () => void;
  settings: SettingsData;
  onToggleWhatsappMessage: () => void;
  onWhatsappMessageChange: (message: string) => void;
  onToggleFocusMode: () => void;
  onToggleAdDeduplication: () => void;
  onToggleAutoHide: () => void;
  onToggleNextOnlyVisible: () => void;
  onToggleDefaultManualHideReason: () => void;
  onDefaultManualHideReasonChange: (reason: string) => void;
  onToggleManualPhoneSearch: () => void;
  onToggleManualImageSearch: () => void;
  onToggleCriteria: (criteriaKey: keyof AutoHideCriterias) => void;
  onCriteriaValueChange: (criteriaKey: keyof AutoHideCriterias, value: number) => void;
  handleExport: () => void;
  handleImport: () => Promise<void>;
  storageUsagePercent: number | null;
  isDark: boolean;
};

const SettingsModal: React.FC<SettingsModalProps> =
({
  onClose,
  settings,
  onToggleWhatsappMessage,
  onWhatsappMessageChange,
  onToggleFocusMode,
  onToggleAdDeduplication,
  onToggleAutoHide,
  onToggleNextOnlyVisible,
  onToggleDefaultManualHideReason,
  onDefaultManualHideReasonChange,
  onToggleManualPhoneSearch,
  onToggleManualImageSearch,
  onToggleCriteria,
  onCriteriaValueChange,
  handleExport,
  handleImport,
  storageUsagePercent,
  isDark,
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
      title={<><SettingsIcon fill={isDark ? '#bfbfbf' : '#fff'}/> Setări</>}
      onClose={onClose}
      maxWidth={600}
      color={isDark ? 'rgb(127 105 24)' : '#c59b2f'}
    >
      <SettingControl
        title="Căutare telefon manuală"
        description="Când este activată, căutarea telefonului nu va închide automat rezultatele. Trebuie să apeși butonul de continuare."
        isOn={settings.manualPhoneSearchEnabled}
        onToggle={onToggleManualPhoneSearch}
        dataWwid="manual-phone-search-switch"
      />
      <SettingControl
        title="Căutare poze manuală"
        description="Când este activată, căutarea pozelor nu va închide automat rezultatele. Trebuie să apeși butonul de continuare."
        isOn={settings.manualImageSearchEnabled}
        onToggle={onToggleManualImageSearch}
        dataWwid="manual-image-search-switch"
      />

      <hr style={{ opacity: 0.2, marginTop: '25px', marginBottom: '25px' }} />

      <SettingControl
        title="Mesaj WhatsApp"
        description="Când este activat, mesajul predefinit va fi inclus la deschiderea WhatsApp."
        isOn={settings.whatsappMessageEnabled}
        onToggle={onToggleWhatsappMessage}
        dataWwid="whatsapp-message-switch"
        showChildren={settings.whatsappMessageEnabled}
      >
        <textarea
          className={styles.controlInput}
          value={settings.whatsappMessage}
          onChange={(e) => onWhatsappMessageChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="Introdu mesajul..."
          data-wwid="whatsapp-message-input"
          rows={2}
          style={{ width: '100%', maxWidth: '100%', resize: 'none' }}
        />
      </SettingControl>

      <hr style={{ opacity: 0.2, marginTop: '25px', marginBottom: '25px' }} />

      <SettingControl
        title="Mod focus"
        description="Când este activat, anunțurile ascunse anterior nu se vor mai afișa pe pagina de listare. Util pentru a vedea doar ceea ce este nou sau încă neascuns."
        isOn={settings.focusMode}
        onToggle={onToggleFocusMode}
        dataWwid="focus-mode-switch"
      />
      <SettingControl
        title="Singur anunț"
        description="Când este activat, pe pagina de listare va fi vizibil doar cel mai nou anunț de la același număr de telefon."
        isOn={settings.adDeduplication}
        onToggle={onToggleAdDeduplication}
        dataWwid="ad-deduplication-switch"
      />

      <hr style={{ opacity: 0.2, marginTop: '25px', marginBottom: '25px' }} />

      <SettingControl
        title="Motiv implicit ascundere"
        description="Când este activat, motivul selectat va fi ales implicit la ascunderea manuală (dacă „poze false” nu este deja selectat)."
        isOn={settings.defaultManualHideReasonEnabled}
        onToggle={onToggleDefaultManualHideReason}
        dataWwid="default-manual-hide-reason-switch"
        showChildren={settings.defaultManualHideReasonEnabled}
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

      <SettingControl
        title="Ascundere automată"
        description="Ascunde automat anunțuri pe baza unor criterii variate."
        isOn={settings.autoHide}
        onToggle={onToggleAutoHide}
        dataWwid="auto-hiding"
      />

      {settings.autoHide && (
        <div className={styles.controlInset}>
          <SettingControl
            title="Următorul numai vizibil"
            description="La căutarea următorului anunț se va sări peste cele noi care sunt ascunse după analiză."
            isOn={settings.nextOnlyVisible}
            onToggle={onToggleNextOnlyVisible}
            dataWwid="next-only-visible"
            showDetails={settings.nextOnlyVisible}
          />

          <SettingControl
            title="Vârstă maximă"
            description="Dacă vârsta specificată este mai mare decât cea setată, anunțul va fi ascuns."
            isOn={settings.maxAge}
            onToggle={() => onToggleCriteria('maxAge')}
            dataWwid="auto-hide-criteria" dataCriteria="maxAge"
            showDetails={settings.maxAge}
            showChildren={settings.maxAge}
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
            title="Înălțime minimă"
            description="Dacă înălțimea specificată este mai mică decât cea setată, anunțul va fi ascuns."
            isOn={settings.minHeight}
            onToggle={() => onToggleCriteria('minHeight')}
            dataWwid="auto-hide-criteria" dataCriteria="minHeight"
            showDetails={settings.minHeight}
            showChildren={settings.minHeight}
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
            title="Înălțime maximă"
            description="Dacă înălțimea specificată este mai mare decât cea setată, anunțul va fi ascuns."
            isOn={settings.maxHeight}
            onToggle={() => onToggleCriteria('maxHeight')}
            dataWwid="auto-hide-criteria" dataCriteria="maxHeight"
            showDetails={settings.maxHeight}
            showChildren={settings.maxHeight}
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
            title="Greutate maximă"
            description="Dacă greutatea specificată este mai mare decât cea setată, anunțul va fi ascuns."
            isOn={settings.maxWeight}
            onToggle={() => onToggleCriteria('maxWeight')}
            dataWwid="auto-hide-criteria" dataCriteria="maxWeight"
            showDetails={settings.maxWeight}
            showChildren={settings.maxWeight}
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
            description="Dacă este menționată maturitatea, anunțul va fi ascuns."
            isOn={settings.mature}
            onToggle={() => onToggleCriteria('mature')}
            dataWwid="auto-hide-criteria" dataCriteria="mature"
            showDetails={settings.mature}
          />
          <SettingControl
            title="Transsexual"
            description="Dacă este menționat „trans”, anunțul va fi ascuns."
            isOn={settings.trans}
            onToggle={() => onToggleCriteria('trans')}
            dataWwid="auto-hide-criteria" dataCriteria="trans"
            showDetails={settings.trans}
          />
          <SettingControl
            title="Siliconată"
            description="Dacă se menționează botoxul sau silicoanele, anunțul va fi ascuns."
            isOn={settings.botox}
            onToggle={() => onToggleCriteria('botox')}
            dataWwid="auto-hide-criteria" dataCriteria="botox"
            showDetails={settings.botox}
          />
          <SettingControl
            title="Numai deplasări"
            description="Dacă sunt oferite doar deplasări sau nu este indicată o locație proprie, anunțul va fi ascuns."
            isOn={settings.onlyTrips}
            onToggle={() => onToggleCriteria('onlyTrips')}
            dataWwid="auto-hide-criteria" dataCriteria="onlyTrips"
            showDetails={settings.onlyTrips}
          />
          <SettingControl
            title="Show web"
            description="Dacă se menționează show web, anunțul va fi ascuns. Persoanele care oferă show web tind să fie mai înșelătoare."
            isOn={settings.showWeb}
            onToggle={() => onToggleCriteria('showWeb')}
            dataWwid="auto-hide-criteria" dataCriteria="showWeb"
            showDetails={settings.showWeb}
          />
          <SettingControl
            title="Risc BTS"
            description="Dacă descrierea conține indicii că ar face sex normal sau anal neprotejat, anunțul va fi ascuns."
            isOn={settings.btsRisc}
            onToggle={() => onToggleCriteria('btsRisc')}
            dataWwid="auto-hide-criteria" dataCriteria="btsRisc"
            showDetails={settings.btsRisc}
          />
          <SettingControl
            title="Party"
            description="Dacă se menționează party, anunțul va fi ascuns. Persoanele care oferă party tind să fie mai obosite și mai riscante din multe puncte de vedere."
            isOn={settings.party}
            onToggle={() => onToggleCriteria('party')}
            dataWwid="auto-hide-criteria" dataCriteria="party"
            showDetails={settings.party}
          />
        </div>
      )}

      <hr style={{ opacity: 0.2, marginTop: '25px', marginBottom: '20px' }} />

      <h2 className={styles.header}>Transfer date</h2>
      <p className={styles.storageInfo}>Spațiu de stocare: <b>{storageUsagePercent === null ? 'n/a' : `${Math.floor(storageUsagePercent)}%`}</b> folosit.</p>
      {importMessage && <p className={`${importMessage[0]} ${styles.importMessage}`}>{importMessage[1]}</p>}
      <button onClick={handleExport} className={styles.button}>↑ export</button>
      <button onClick={onImport} className={styles.button}>↓ import</button>

    </ContentModal>
  );
};

export default SettingsModal;
