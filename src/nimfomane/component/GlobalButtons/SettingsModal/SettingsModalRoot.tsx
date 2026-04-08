import React, {useCallback, useEffect, useState} from 'react';
import Modal from '../../../../common/components/Modal/Modal';
import SettingsModal, {NimfomaneSettingsData} from './SettingsModal';
import {NimfomaneStorage} from '../../../core/storage';

type SettingsModalRootProps = {
  onClose: () => void;
};

const SettingsModalRoot: React.FC<SettingsModalRootProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<NimfomaneSettingsData | null>(null);

  useEffect(() => {
    setSettings({
      focusMode: NimfomaneStorage.isFocusMode(),
    });
  }, []);

  const handleToggleFocusMode = useCallback(() => {
    const current = NimfomaneStorage.isFocusMode();
    NimfomaneStorage.setFocusMode(!current);
    setSettings(prev => prev ? { ...prev, focusMode: !current } : null);
    setTimeout(() => {
      window.scrollTo({ left: 0, top: 0 });
      window.location.reload();
    }, 400);
  }, []);

  if (!settings) {
    return null;
  }

  return (
    <Modal close={onClose}>
      <SettingsModal
        onClose={onClose}
        settings={settings}
        onToggleFocusMode={handleToggleFocusMode}
      />
    </Modal>
  );
};

export default SettingsModalRoot;
