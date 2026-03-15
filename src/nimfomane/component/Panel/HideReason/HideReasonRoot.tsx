import React, {useCallback} from 'react';
import HideReason from "./HideReason";
import {ManualHideReason} from "../../../core/hideReasons";

export type ManualHideReasonWithKey = {
  key: string;
  config: ManualHideReason;
};

type HideReasonRootProps = {
  onReasonSelect: (reasonKey: string) => void,
  onCancel?: () => void,
  onClose?: () => void,
  layout?: 'horizontal' | 'vertical';
};

const HideReasonRoot: React.FC<HideReasonRootProps> = ({
  onReasonSelect,
  onCancel,
  onClose,
  layout = 'horizontal',
}) => {
  const handleReasonSelect = useCallback((reasonWithKey: ManualHideReasonWithKey, subcategory?: string) => {
    const reasonKey = (subcategory && subcategory !== '') ? `${reasonWithKey.key}: ${subcategory}` : reasonWithKey.key;
    onReasonSelect(reasonKey);
  }, [onReasonSelect]);

  return (
    <HideReason
      onReasonSelect={handleReasonSelect}
      onShowClick={onCancel}
      onClose={onClose}
      layout={layout}
    />
  );
};

export default HideReasonRoot;
