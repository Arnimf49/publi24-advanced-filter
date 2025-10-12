import React, {useCallback, useEffect} from 'react';
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
  const onReasonSelect = useCallback((reasonWithKey: ManualHideReasonWithKey) => {
    WWStorage.setPhoneHiddenReason(phone, reasonWithKey.key);
    
    if (reasonWithKey.config.expireDays) {
      const resetTimestamp = Date.now() + (reasonWithKey.config.expireDays * 24 * 60 * 60 * 1000);
      WWStorage.setPhoneHideResetAt(phone, resetTimestamp);
    }
    
    onReason && onReason();
  }, [phone, onReason]);

  useEffect(() => {
    if (selectedReason) {
      WWStorage.setPhoneHiddenReason(phone, selectedReason);
    }
  }, [phone, selectedReason]);

  return (
    <HideReason
      selectedReason={selectedReason}
      onReasonSelect={onReasonSelect}
      onShowClick={onCancel}
    />
  );
};

export default HideReasonRoot;
