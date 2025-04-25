import Modal from '../../Common/Modal/Modal';
import {AutoHideCriterias, WWStorage} from '../../../core/storage';
import { IS_MOBILE_VIEW } from '../../../core/globals';
import SettingsModal, {SettingsData} from "./SettingsModal";
import React, {useCallback, useEffect, useState} from "react";

type SettingsModalRootProps = {
  onClose: () => void;
};

const DEFAULT_CRITERIA_VALUES = {
  maxAgeValue: 40,
  minHeightValue: 160,
  maxHeightValue: 175,
  maxWeightValue: 65,
};

const SettingsModalRoot: React.FC<SettingsModalRootProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const isMobileView = IS_MOBILE_VIEW;

  useEffect(() => {
    const focusMode = WWStorage.isFocusMode();
    const autoHide = WWStorage.isAutoHideEnabled();
    const criteria = WWStorage.getAutoHideCriterias();

    setSettings({
      focusMode,
      autoHide,
      maxAge: criteria.maxAge ?? false,
      maxAgeValue: criteria.maxAgeValue ?? DEFAULT_CRITERIA_VALUES.maxAgeValue,
      minHeight: criteria.minHeight ?? false,
      minHeightValue: criteria.minHeightValue ?? DEFAULT_CRITERIA_VALUES.minHeightValue,
      maxHeight: criteria.maxHeight ?? false,
      maxHeightValue: criteria.maxHeightValue ?? DEFAULT_CRITERIA_VALUES.maxHeightValue,
      maxWeight: criteria.maxWeight ?? false,
      maxWeightValue: criteria.maxWeightValue ?? DEFAULT_CRITERIA_VALUES.maxWeightValue,
      mature: criteria.mature ?? false,
      trans: criteria.trans ?? false,
      botox: criteria.botox ?? false,
      onlyTrips: criteria.onlyTrips ?? false,
      showWeb: criteria.showWeb ?? false,
      total: criteria.total ?? false,
      party: criteria.party ?? false,
    });
  }, []);

  const handleToggleFocusMode = useCallback(() => {
    const currentFocusMode = WWStorage.isFocusMode();
    WWStorage.setFocusMode(!currentFocusMode);
    setSettings(prev => prev ? { ...prev, focusMode: !currentFocusMode } : null);
    setTimeout(() => {
      window.scrollTo({ left: 0, top: 0 });
      window.location.reload();
    }, 400);
  }, []);

  const handleToggleAutoHide = useCallback(() => {
    const currentAutoHide = WWStorage.isAutoHideEnabled();
    WWStorage.setAutoHideEnabled(!currentAutoHide);
    setSettings(prev => prev ? { ...prev, autoHide: !currentAutoHide } : null);
  }, []);

  const handleToggleCriteria = useCallback((criteriaKey: keyof AutoHideCriterias) => {
    if (criteriaKey.endsWith('Value')) return;

    const currentCriteriaValue = WWStorage.isAutoHideCriteriaEnabled(criteriaKey);
    WWStorage.setAutoHideCriteria(criteriaKey, !currentCriteriaValue);

    setSettings(prev => {
      if (!prev) return null;
      return { ...prev, [criteriaKey]: !currentCriteriaValue };
    });
  }, []);

  const handleCriteriaValueChange = useCallback((criteriaKey: keyof AutoHideCriterias, value: number) => {
    if (!String(criteriaKey).endsWith('Value')) return;

    const criteriaRootKey = criteriaKey.replace('Value', '') as keyof AutoHideCriterias;
    WWStorage.setAutoHideCriteria(criteriaRootKey, undefined, value);

    setSettings(prev => {
      if (!prev) return null;
      return { ...prev, [criteriaKey]: value };
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
        isMobileView={isMobileView}
        onToggleFocusMode={handleToggleFocusMode}
        onToggleAutoHide={handleToggleAutoHide}
        onToggleCriteria={handleToggleCriteria}
        onCriteriaValueChange={handleCriteriaValueChange}
      />
    </Modal>
  );
};


export default SettingsModalRoot;
