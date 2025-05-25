import React, { CSSProperties } from 'react';
import styles from './InfoOverlay.module.scss';
import {IS_MOBILE_VIEW} from "../../../common/globals";

export type CutoutRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  xm: number;
  yy: number;
  xlc: number;
  xrc: number;
};

type InfoOverlayProps = {
  cutouts: CutoutRect[];
  adButtonsInfo?: boolean;
  globalButtonsInfo?: boolean;
};

type TooltipProps = {
  text: string;
  left: number;
  top: number;
  lineHeight: number;
  isDown?: boolean;
  isLeft?: boolean;
  marginTop?: number;
  textWidthClass?: string;
};

const Tooltip: React.FC<TooltipProps> =
({
   text,
   left,
   top,
   lineHeight,
   isDown = false,
   isLeft = false,
   marginTop,
   textWidthClass
}) => {

  const tooltipStyle: CSSProperties = {
    left: `${left}px`,
    top: `${top}px`,
  };

  const textStyle: CSSProperties = {
    marginTop: marginTop !== undefined ? `${marginTop}px` : undefined,
  };

  const tooltipClasses = `${styles.tooltip} ${isDown ? styles.isDown : ''}`;
  const textClasses = `
    ${styles.text}
    ${isLeft ? styles.textLeft : ''}
    ${textWidthClass ? styles[textWidthClass] || '' : ''}
  `;

  return (
    <div className={tooltipClasses} style={tooltipStyle} data-wwid="info-tooltip">
      <svg
        className={styles.line}
        width="20"
        height={lineHeight}
        viewBox={`0 0 20 ${lineHeight}`}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="10" y1={isDown ? 5 : lineHeight - 2} x2="10" y2={isDown ? lineHeight : 5} />
        <polyline points={isDown ? "4,6 10,0 16,6" : "4,10 10,4 16,10"} />
      </svg>
      <p className={textClasses.trim()} style={textStyle}>{text}</p>
    </div>
  );
};


const InfoOverlay: React.FC<InfoOverlayProps> =
({
  cutouts = [],
  adButtonsInfo = false,
  globalButtonsInfo = false,
}) => {
  const maskId = "info-cutout-mask";

  const c0 = cutouts[0];
  const c1 = cutouts[1];
  const c2 = cutouts[2];
  const c3 = cutouts[3];
  const c4 = cutouts[4];

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <mask id={maskId}>
            <rect width="5000" height="5000" fill="white"/>
            {cutouts.map((cutout, index) => (
              <rect
                key={index}
                x={cutout.x}
                y={cutout.y}
                width={cutout.width}
                height={cutout.height}
                rx="3"
                ry="3"
                fill="black"
              />
            ))}
          </mask>
        </defs>
      </svg>

      <div
        className={styles.infoContainer}
        data-wwid="info-container"
        style={{ mask: `url(#${maskId})` }}
        role="dialog"
        aria-modal="true"
        aria-label="Information Overlay"
      >
        {adButtonsInfo && c0 && c1 && c2 && c3 && c4 && (
          <>
            <Tooltip
              text="Caută pozele anuțului pe Google"
              left={c3.xm} top={c3.yy}
              lineHeight={40}
              isLeft={IS_MOBILE_VIEW}
              marginTop={20}
              textWidthClass="textWidthMobile145"
            />
            <Tooltip
              text="Caută anunțul și numărul de tel pe Google"
              left={c2.xm} top={c2.yy}
              lineHeight={IS_MOBILE_VIEW ? 90 : 70}
              isLeft={IS_MOBILE_VIEW}
              marginTop={IS_MOBILE_VIEW ? 75 : 55}
              textWidthClass="textWidthMobile191"
            />
            <Tooltip
              text="Adaugă la lista de favorite"
              left={c1.xm}
              top={c1.yy}
              lineHeight={IS_MOBILE_VIEW ? 144 : 105}
              isLeft={IS_MOBILE_VIEW}
              marginTop={IS_MOBILE_VIEW ? 129 : 90}
            />
            <Tooltip
              text="Ascunde sau arată anunțul"
              left={c0.xm}
              top={c0.yy}
              lineHeight={IS_MOBILE_VIEW ? 181 : 140}
              isLeft={IS_MOBILE_VIEW}
              marginTop={IS_MOBILE_VIEW ? 166 : 125}
            />
            <Tooltip
              text="Deschide toate pozele anunțului"
              left={IS_MOBILE_VIEW ? c4.xlc : c4.xrc}
              top={IS_MOBILE_VIEW ? c4.y : c4.yy}
              lineHeight={40}
              isDown={IS_MOBILE_VIEW}
              marginTop={IS_MOBILE_VIEW ? undefined : 20}
            />
          </>
        )}

        {globalButtonsInfo && c0 && c1 && c2 && (
          <>
            <Tooltip
              text="Setări specifice al extensiei"
              left={c2.xm} top={c2.y}
              lineHeight={IS_MOBILE_VIEW ? 105 : 40}
              isDown={true}
              textWidthClass="textWidthMobile200"
            />
            <Tooltip
              text="Accesează lista ta de favorite"
              left={c1.xm} top={c1.y}
              lineHeight={IS_MOBILE_VIEW ? 50 : 75}
              isDown={true}
              textWidthClass="textWidthMobile136"
            />
            <Tooltip
              text="Caută toate anunțurile pe bază la tel"
              left={c0.xm} top={c0.y}
              lineHeight={IS_MOBILE_VIEW ? 142 : 110}
              isDown={true}
            />
          </>
        )}

      </div>
    </>
  );
};

export default InfoOverlay;
