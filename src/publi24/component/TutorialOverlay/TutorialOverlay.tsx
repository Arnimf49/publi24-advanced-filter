import React, { useState, useMemo, useEffect } from 'react';
import styles from './TutorialOverlay.module.scss';
import {IS_MOBILE_VIEW, IS_SAFARI_IOS} from "../../../common/globals";
import {P24faLogoLight} from "../../../common/components/Logo/P24faLogoLight";

export type CutoutRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  xm: number;
  yy: number;
};

type TutorialStep = {
  type: 'welcome' | 'element' | 'section';
  title?: string;
  text: string;
  selectors?: string[];
  nextButtonPosition?: 'bottom-right' | 'top-right';
  tooltipPosition?: 'top' | 'bottom';
};

type TutorialOverlayProps = {
  firstAd: Element;
  onComplete: () => void;
};

const getTutorialSteps = (): TutorialStep[] => [
  {
    type: 'welcome',
    text: 'Bine ai venit la Publi24 Filtru Avansat.\nÎți prezint în scurt funcționalitățile.',
    nextButtonPosition: 'bottom-right'
  },
  {
    type: 'element',
    text: 'Poza principală al anunțului acum deschide toate pozele la click.',
    selectors: ['.art-img'],
    nextButtonPosition: 'bottom-right',
    tooltipPosition: 'bottom'
  },
  {
    type: 'element',
    text: 'Cu acest buton cauți pozele anunțului pe Google Lens.',
    selectors: ['[data-wwid="investigate_img"]'],
    nextButtonPosition: 'bottom-right',
    tooltipPosition: 'bottom'
  },
  {
    type: 'section',
    text: 'Aici vor apărea rezultatele după căutarea de poze de pe Lens.',
    selectors: ['[data-wwid="image-results-title"]', '[data-wwid="image-results"]'],
    nextButtonPosition: 'bottom-right',
    tooltipPosition: 'top'
  },
  {
    type: 'element',
    text: 'Cu acest buton cauți anunțul și numărul de tel pe Google.',
    selectors: ['[data-wwid="investigate"]'],
    nextButtonPosition: 'bottom-right',
    tooltipPosition: 'bottom'
  },
  {
    type: 'section',
    text: 'Aici vor apărea rezultatele după căutarea de Google.',
    selectors: ['[data-wwid="search-results-title"]', '[data-wwid="search-results"]'],
    nextButtonPosition: 'bottom-right',
    tooltipPosition: 'top'
  },
  {
    type: 'element',
    text: 'Poți adăuga numere de telefon la favorite într-un mod mai îmbunătățit față de Publi24.',
    selectors: ['[data-wwid="fav-toggle"]'],
    nextButtonPosition: 'bottom-right',
    tooltipPosition: 'bottom'
  },
  {
    type: 'element',
    text: 'De aici poți vedea lista ta de favorite.',
    selectors: ['[data-wwid="favs-button"]'],
    nextButtonPosition: 'top-right',
    tooltipPosition: 'top'
  },
  {
    type: 'element',
    text: 'Ascunde anunțurile care nu te interesează. Poți și motiva. Cu asta câștigi cel mai mult timp.',
    selectors: ['[data-wwid="toggle-hidden"]'],
    nextButtonPosition: 'bottom-right',
    tooltipPosition: 'bottom'
  },
  {
    type: 'element',
    text: 'În meniu ai setări. Nu uita să te uiți la ce setări sunt posibile, pentru că îți îmbunătățesc experiența.',
    selectors: ['[data-wwid="menu-button"]'],
    nextButtonPosition: 'top-right',
    tooltipPosition: 'top'
  }
];

const getBoundingRect = (selector: string): CutoutRect | null => {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    x: rect.x - 2,
    y: rect.y - 2,
    width: rect.width + 4,
    height: rect.height + 4,
    xm: rect.x + rect.width / 2,
    yy: rect.y + rect.height + 2,
  };
};

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ firstAd, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = getTutorialSteps();
  const step = steps[currentStep];

  useEffect(() => {
    const scrollToAd = () => {
      const panel = firstAd.querySelector<HTMLElement>('[data-wwid="control-panel"]');
      if (panel) {
        const rect = panel.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - (IS_MOBILE_VIEW ? 320 : 350);
        window.scrollTo({ top: scrollTop, behavior: 'instant' });
      } else {
        const rect = firstAd.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - (IS_MOBILE_VIEW ? 100 : 130);
        window.scrollTo({ top: scrollTop, behavior: 'instant' });
      }
    };

    scrollToAd();
    const interval = setInterval(scrollToAd, 1000);

    return () => clearInterval(interval);
  }, [firstAd]);

  const getCutoutsForStep = (): CutoutRect[] => {
    if (currentStep === 0 || !step.selectors) return [];

    const cutouts: CutoutRect[] = [];

    step.selectors.forEach(selector => {
      let rect: CutoutRect | null = null;

      if (selector.startsWith('[data-wwid="favs-button"]') ||
          selector.startsWith('[data-wwid="menu-button"]') ||
          selector.startsWith('[data-wwid="phone-search"]')) {
        rect = getBoundingRect(selector);
      } else if (firstAd) {
        const el = firstAd.querySelector(selector);
        if (el) {
          const elRect = el.getBoundingClientRect();
          rect = {
            x: elRect.x - 2,
            y: elRect.y - 2,
            width: elRect.width + 4,
            height: elRect.height + 4,
            xm: elRect.x + elRect.width / 2,
            yy: elRect.y + elRect.height + 2,
          };
        }
      }

      if (rect) cutouts.push(rect);
    });

    return cutouts;
  };

  const cutouts = useMemo(() => getCutoutsForStep(), [currentStep, firstAd]);

  const getTooltipData = (): { containerX: number; containerY: number; arrowX: number; arrowY: number; showAbove: boolean } => {
    const defaultReturn = { containerX: 0, containerY: 0, arrowX: 0, arrowY: 0, showAbove: false };
    if (currentStep === 0 || cutouts.length === 0) return defaultReturn;

    const firstCutout = cutouts[0];
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const arrowLength = 40;
    const tooltipMaxWidth = IS_MOBILE_VIEW ? 200 : 300;
    const padding = 10;

    let preferAbove = step.tooltipPosition === 'top';

    const spaceAbove = firstCutout.y;
    const spaceBelow = viewportHeight - firstCutout.yy;

    if (spaceAbove < 100 && spaceBelow > spaceAbove) {
      preferAbove = false;
    } else if (spaceBelow < 100 && spaceAbove > spaceBelow) {
      preferAbove = true;
    }

    const arrowX = firstCutout.xm;
    const arrowY = preferAbove ? firstCutout.y : firstCutout.yy;

    let containerX = firstCutout.xm - tooltipMaxWidth / 2;
    const containerY = preferAbove ? firstCutout.y - arrowLength : firstCutout.yy + arrowLength;

    if (containerX < padding) {
      containerX = padding;
    } else if (containerX + tooltipMaxWidth > viewportWidth - padding) {
      containerX = viewportWidth - tooltipMaxWidth - padding;
    }

    return {
      containerX,
      containerY,
      arrowX,
      arrowY,
      showAbove: preferAbove
    };
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const maskId = "tutorial-cutout-mask";
  const clipPathId = "tutorial-cutout-clip";
  const tooltipData = getTooltipData();

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          {IS_SAFARI_IOS ? (
            <clipPath id={clipPathId} clipPathUnits="userSpaceOnUse">
              <path d={`M 0 0 L 5000 0 L 5000 5000 L 0 5000 Z ${cutouts.map(cutout => 
                `M ${cutout.x} ${cutout.y} L ${cutout.x} ${cutout.y + cutout.height} L ${cutout.x + cutout.width} ${cutout.y + cutout.height} L ${cutout.x + cutout.width} ${cutout.y} Z`
              ).join(' ')}`} fillRule="evenodd" />
            </clipPath>
          ) : (
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
          )}
        </defs>
      </svg>

      <div
        key={currentStep}
        className={styles.overlay}
        data-wwid="info-container"
        style={IS_SAFARI_IOS ? { WebkitClipPath: `url(#${clipPathId})`, clipPath: `url(#${clipPathId})` } : { mask: `url(#${maskId})` }}
        onClick={handleNext}
      >
        {step.type === 'welcome' && (
          <div className={styles.welcomeContainer}>
            <div className={styles.welcomeContent}>
              <P24faLogoLight className={styles.logo} />
              <p className={styles.welcomeText}>{step.text}</p>
            </div>
          </div>
        )}

        {step.type !== 'welcome' && cutouts.length > 0 && (
          <>
            <svg
              className={styles.arrow}
              style={{
                left: `${tooltipData.arrowX}px`,
                top: `${tooltipData.arrowY}px`,
                transform: tooltipData.showAbove ? 'translate(-50%, -100%) rotate(180deg)' : 'translate(-50%, 0)'
              }}
              width="20"
              height="40"
              viewBox="0 0 20 40"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="10" y1="5" x2="10" y2="35" />
              <polyline points="4,10 10,4 16,10" />
            </svg>
            <div
              className={styles.tooltipContainer}
              style={{
                left: `${tooltipData.containerX}px`,
                top: `${tooltipData.containerY}px`,
                transform: tooltipData.showAbove ? 'translateY(-100%)' : 'translateY(0)'
              }}
            >
              <p className={styles.tooltipText}>{step.text}</p>
              <span className={styles.tooltipCounter}>({currentStep}/{steps.length - 1})</span>
            </div>
          </>
        )}

        <button
          className={`${styles.nextButton} ${step.nextButtonPosition === 'top-right' ? styles.topRight : styles.bottomRight}`}
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          data-wwid={`tooltip-${currentStep}`}
        >
          {currentStep < steps.length - 1 ? 'Următorul' : 'Gata'}
        </button>
      </div>
    </>
  );
};

export default TutorialOverlay;
