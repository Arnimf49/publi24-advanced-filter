import React, {useCallback, useEffect, useMemo} from 'react';
import HideReason from "./HideReason";
import {WWStorage} from "../../../../core/storage";
import {ManualHideReason} from "../../../../core/hideReasons";

export type ManualHideReasonWithKey = {
  key: string;
  config: ManualHideReason;
};

type HideReasonRootProps = {
  phone: string,
  selectedReason?: string | null;
  onCancel?: () => void,
  onReason?: () => void,
};

const HideReasonRoot: React.FC<HideReasonRootProps> = ({
  phone,
  selectedReason = null,
  onCancel,
  onReason,
}) => {
  const defaultReason = useMemo(() => {
    if (selectedReason) return null;
    
    const isDefaultEnabled = WWStorage.isDefaultManualHideReasonEnabled();
    if (isDefaultEnabled) {
      return WWStorage.getDefaultManualHideReason();
    }
    return null;
  }, [selectedReason]);
  const onReasonSelect = useCallback((reasonWithKey: ManualHideReasonWithKey, subcategory?: string) => {
    const reasonKey = (subcategory && subcategory !== '') ? `${reasonWithKey.key}: ${subcategory}` : reasonWithKey.key;
    WWStorage.setPhoneHiddenReason(phone, reasonKey);
    
    if (reasonWithKey.config.expireDays) {
      const resetTimestamp = Date.now() + (reasonWithKey.config.expireDays * 24 * 60 * 60 * 1000);
      WWStorage.setPhoneHideResetAt(phone, resetTimestamp);
    }
    
    const shouldClose = !reasonWithKey.config.subcategories?.length || subcategory !== undefined;
    
    if (shouldClose && onReason) {
      onReason();
    }
  }, [phone, onReason]);

  useEffect(() => {
    if (selectedReason) {
      WWStorage.setPhoneHiddenReason(phone, selectedReason);
    }
  }, [phone, selectedReason]);

  return (
    <HideReason
      selectedReason={selectedReason}
      defaultReason={defaultReason}
      onReasonSelect={onReasonSelect}
      onShowClick={onCancel}
    />
  );
};

export default HideReasonRoot;
