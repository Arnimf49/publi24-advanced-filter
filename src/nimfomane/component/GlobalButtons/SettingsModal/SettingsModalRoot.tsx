import React, {useCallback, useEffect, useState} from 'react';
import Modal from '../../../../common/components/Modal/Modal';
import SettingsModal, {NimfomaneSettingsData} from './SettingsModal';
import {NimfomaneStorage} from '../../../core/storage';
import {utils} from '../../../../common/utils';

type SettingsModalRootProps = {
  onClose: () => void;
};

const SettingsModalRoot: React.FC<SettingsModalRootProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<NimfomaneSettingsData | null>(null);
  const [storageUsagePercent, setStorageUsagePercent] = useState<number | null>(null);

  useEffect(() => {
    setSettings({
      focusMode: NimfomaneStorage.isFocusMode(),
    });
    setStorageUsagePercent(utils.getStorageUsagePercent());
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

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(NimfomaneStorage.exportData())], {type: 'application/json'});
    const anchor = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `p24fa-nimfo-${Date.now()}.json`,
    });
    anchor.click();
  }, []);

  const handleImport = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      const input = Object.assign(document.createElement('input'), {
        type: 'file',
        accept: '.json',
      });

      input.onchange = async (event: Event) => {
        try {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) {
            throw new Error('Nu a fost selectat niciun fișier.');
          }

          const data = JSON.parse(await file.text());
          await NimfomaneStorage.importData(data);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      input.click();
    });
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
        handleExport={handleExport}
        handleImport={handleImport}
        storageUsagePercent={storageUsagePercent}
      />
    </Modal>
  );
};

export default SettingsModalRoot;
