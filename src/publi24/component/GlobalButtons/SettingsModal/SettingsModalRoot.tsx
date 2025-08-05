import Modal from '../../../../common/components/Modal/Modal';
import {AutoHideCriterias, WWStorage} from '../../../core/storage';
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

  useEffect(() => {
    const focusMode = WWStorage.isFocusMode();
    const adDeduplication = WWStorage.isAdDeduplicationEnabled();
    const autoHide = WWStorage.isAutoHideEnabled();
    const nextOnlyVisible = WWStorage.isNextOnlyVisibleEnabled();
    const criteria = WWStorage.getAutoHideCriterias();

    setSettings({
      focusMode,
      adDeduplication,
      autoHide,
      nextOnlyVisible,
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
      btsRisc: criteria.btsRisc ?? false,
      party: criteria.party ?? false,
    });
  }, []);

  const handleToggleAdDeduplication = useCallback(() => {
    const current = WWStorage.isAdDeduplicationEnabled();
    WWStorage.setAdDeduplication(!current);
    setSettings(prev => prev ? { ...prev, adDeduplication: !current } : null);
    setTimeout(() => {
      window.scrollTo({ left: 0, top: 0 });
      window.location.reload();
    }, 400);
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

  const handleToggleNextOnlyVisible = useCallback(() => {
    const currentValue = WWStorage.isNextOnlyVisibleEnabled();
    WWStorage.setNextOnlyVisibleEnabled(!currentValue);
    setSettings(prev => prev ? { ...prev, nextOnlyVisible: !currentValue } : null);
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
        onToggleFocusMode={handleToggleFocusMode}
        onToggleAdDeduplication={handleToggleAdDeduplication}
        onToggleAutoHide={handleToggleAutoHide}
        onToggleNextOnlyVisible={handleToggleNextOnlyVisible}
        onToggleCriteria={handleToggleCriteria}
        onCriteriaValueChange={handleCriteriaValueChange}
      />
    </Modal>
  );
};


export default SettingsModalRoot;
