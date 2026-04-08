import React from 'react';
import ContentModal from '../../../../common/components/Modal/ContentModal';
import styles from './SettingsModal.module.scss';
import {SettingsIcon} from '../../../../common/components/Icons/SettingsIcon';

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
  dataWwid?: string;
};

const SettingControl: React.FC<SettingControlProps> = ({ title, description, isOn, onToggle, dataWwid }) => (
  <div
    className={styles.control}
    data-wwid={dataWwid}
    onClick={onToggle}
  >
    <div className={styles.controlSwitch}>
      <Switch isOn={isOn}/>
    </div>
    <div className={styles.controlContent}>
      <div className={styles.controlTitle}>{title}</div>
      {description && (
        <div className={styles.controlDescription}>{description}</div>
      )}
    </div>
  </div>
);

export type NimfomaneSettingsData = {
  focusMode: boolean;
};

type SettingsModalProps = {
  onClose: () => void;
  settings: NimfomaneSettingsData;
  onToggleFocusMode: () => void;
};

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, settings, onToggleFocusMode }) => (
  <ContentModal
    title={<><SettingsIcon fill="#fff"/> Setări</>}
    onClose={onClose}
    maxWidth={600}
    color="rgb(47, 73, 121)"
  >
    <SettingControl
      title="Mod focus"
      description="Când este activat, topicele ascunse anterior nu se vor mai afișa deloc pe pagina de listare. Util pentru a vedea numai ceea ce este nou sau încă neascuns."
      isOn={settings.focusMode}
      onToggle={onToggleFocusMode}
      dataWwid="focus-mode-switch"
    />

  </ContentModal>
);

export default SettingsModal;
