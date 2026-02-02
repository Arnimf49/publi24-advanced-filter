import React, { MouseEventHandler, CSSProperties } from 'react';
import { VisibilityIcon } from '../../../publi24/component/Common/Icons/VisibilityIcon';

type HideButtonProps = {
  visible: boolean;
  onClick: MouseEventHandler;
  size?: number;
  className?: string;
  title?: string;
  svgStyle?: CSSProperties;
};

export const HideButton: React.FC<HideButtonProps> = ({
  visible,
  onClick,
  size = 24,
  className = '',
  title,
  svgStyle,
}) => {
  const defaultTitle = !visible ? "Ma-m razgândit" : "Ascunde";
  const defaultSvgStyle: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <button
      title={title || defaultTitle}
      type="button"
      className={className}
      onClick={onClick}
      data-wwid="toggle-hidden"
    >
      <div style={svgStyle || defaultSvgStyle}>
        <VisibilityIcon visible={visible} size={size} />
      </div>
    </button>
  );
};
