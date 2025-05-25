import React, {useCallback, useEffect} from 'react';
import HideReason from "./HideReason";
import {WWStorage} from "../../../../core/storage";

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
  const onReasonSelect = useCallback((reason: string) => {
    WWStorage.setPhoneHiddenReason(phone, reason);
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
