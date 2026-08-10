import React, {useEffect, useRef, useState} from 'react';
import AdPanel from '../../src/publi24/component/AdPanel/AdPanel';
import HideReason from '../../src/publi24/component/Common/Partials/HideReason/HideReason';
import PhoneAndTags from '../../src/publi24/component/Common/Partials/PhoneAndTags/PhoneAndTags';
import AnimationStatusBar from './AnimationStatusBar';
import DemoMouse from './DemoMouse';
import Publi24AdFixture from './Publi24AdFixture';
import Publi24SvgSprite from './Publi24SvgSprite';
import useDemoVisibility from './useDemoVisibility';
import styles from './HideFeatureDemo.module.scss';
import demoStyles from './Publi24Demo.module.scss';

type HideDemoPhase =
  | 'waiting'
  | 'enteringHide'
  | 'hoveringHide'
  | 'clickingHide'
  | 'waitingReason'
  | 'enteringReason'
  | 'hoveringReason'
  | 'clickingReason'
  | 'waitingClose'
  | 'enteringClose'
  | 'hoveringClose'
  | 'clickingClose'
  | 'hidden';

const PHONE = '0740123456';
const FIRST_SEEN = Date.now() - 90 * 24 * 60 * 60 * 1000;
const HIDE_ANIMATION_DURATION = 10600;

const HideFeatureDemo: React.FC = () => {
  const [phase, setPhase] = useState<HideDemoPhase>('waiting');
  const [visible, setVisible] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [hideReason, setHideReason] = useState<string | null>(null);
  const [showHideReason, setShowHideReason] = useState(false);
  const [pointerPosition, setPointerPosition] = useState({x: -40, y: 100});
  const [animationCycle, setAnimationCycle] = useState(0);
  const [playRequested, setPlayRequested] = useState(false);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches
  ));
  const stageRef = useRef<HTMLDivElement>(null);
  const isDemoActive = useDemoVisibility(stageRef, 4000, playRequested);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 800px)');
    const handleViewportChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleViewportChange();
    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    let timeout: number | undefined;

    if (!isDemoActive || isAnimationPaused) {
      return;
    }

    const movePointerTo = (selector: string, text?: string) => {
      if (!stage) {
        return false;
      }

      const element = Array.from(stage.querySelectorAll<HTMLElement>(selector)).find((candidate) => (
        !text || candidate.textContent?.trim() === text
      ));

      if (!element) {
        return false;
      }

      const stageBounds = stage.getBoundingClientRect();
      const elementBounds = element.getBoundingClientRect();

      setPointerPosition({
        x: elementBounds.left - stageBounds.left + elementBounds.width / 2,
        y: elementBounds.top - stageBounds.top + elementBounds.height / 2,
      });

      return true;
    };

    const clickElement = (selector: string, text?: string) => {
      if (!stage) {
        return false;
      }

      const element = Array.from(stage.querySelectorAll<HTMLElement>(selector)).find((candidate) => (
        !text || candidate.textContent?.trim() === text
      ));

      if (!element) {
        return false;
      }

      if (selector === '[data-wwid="toggle-hidden"]' || (
        selector === '[data-wwid="reason"]' && text === 'poze false'
      )) {
        element.setAttribute('data-demo-clicking', 'true');
        window.setTimeout(() => element.removeAttribute('data-demo-clicking'), 360);
      }

      element.click();
      return true;
    };

    switch (phase) {
      case 'waiting':
        timeout = window.setTimeout(() => {
          movePointerTo('[data-wwid="toggle-hidden"]');
          setPhase('enteringHide');
        }, 800);
        break;
      case 'enteringHide':
        timeout = window.setTimeout(() => setPhase('hoveringHide'), 1100);
        break;
      case 'hoveringHide':
        timeout = window.setTimeout(() => setPhase('clickingHide'), 900);
        break;
      case 'clickingHide':
        timeout = window.setTimeout(() => {
          clickElement('[data-wwid="toggle-hidden"]');
          setIsHidden(true);
          setShowHideReason(true);
          setPhase('waitingReason');
        }, 300);
        break;
      case 'waitingReason':
        timeout = window.setTimeout(() => {
          if (movePointerTo('[data-wwid="reason"]', 'poze false')) {
            setPhase('enteringReason');
          }
        }, 150);
        break;
      case 'enteringReason':
        timeout = window.setTimeout(() => setPhase('hoveringReason'), 900);
        break;
      case 'hoveringReason':
        timeout = window.setTimeout(() => setPhase('clickingReason'), 750);
        break;
      case 'clickingReason':
        timeout = window.setTimeout(() => {
          clickElement('[data-wwid="reason"]', 'poze false');
          setPhase('waitingClose');
        }, 300);
        break;
      case 'waitingClose':
        timeout = window.setTimeout(() => setPhase('enteringClose'), 1000);
        break;
      case 'enteringClose':
        timeout = window.setTimeout(() => {
          if (movePointerTo('[data-wwid="close-hide-reason"]')) {
            setPhase('hoveringClose');
          }
        }, 150);
        break;
      case 'hoveringClose':
        timeout = window.setTimeout(() => setPhase('clickingClose'), 750);
        break;
      case 'clickingClose':
        timeout = window.setTimeout(() => {
          clickElement('[data-wwid="close-hide-reason"]');
          setIsHidden(true);
          setPhase('hidden');
        }, 300);
        break;
      case 'hidden':
        timeout = window.setTimeout(() => {
          setVisible(true);
          setIsHidden(false);
          setHideReason(null);
          setShowHideReason(false);
          setPointerPosition({x: -40, y: 100});
          setAnimationCycle((current) => current + 1);
          setPhase('waiting');
        }, 3200);
        break;
    }

    return () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
    };
  }, [phase, animationCycle, isDemoActive, isAnimationPaused]);

  const pointerIsClicking = phase === 'clickingHide'
    || phase === 'clickingReason'
    || phase === 'clickingClose';

  return (
    <div className={styles.demo} ref={stageRef}>
      <AnimationStatusBar
        duration={HIDE_ANIMATION_DURATION}
        resetKey={animationCycle}
        isPaused={!isDemoActive}
        onPlay={() => {
          setPlayRequested(true);
          setIsAnimationPaused(false);
        }}
        onPauseChange={setIsAnimationPaused}
        onRestart={() => {
          setVisible(true);
          setIsHidden(false);
          setHideReason(null);
          setShowHideReason(false);
          setPointerPosition({x: -40, y: 100});
          setPlayRequested(true);
          setIsAnimationPaused(false);
          setAnimationCycle((current) => current + 1);
          setPhase('waiting');
        }}
      />
      <div className={styles.viewport}>
        <div className="publi24-demo-site">
          <div className={demoStyles.siteTopbar}>
            <Publi24SvgSprite />
            <b className="text-logo">
              <span className="t1">publi</span>
              <span className="t2">24</span>
              <span className="t3">.ro</span>
            </b>
          </div>
          <div className={`${demoStyles.siteContent} rmd-container-search-results`}>
            <Publi24AdFixture isHidden={isHidden} hideReason={showHideReason ? (
              <HideReason
                onReasonSelect={(reason, subcategory) => {
                  setHideReason(subcategory ? `${reason.key}: ${subcategory}` : reason.key);
                }}
                onClose={() => setShowHideReason(false)}
              />
            ) : null}>
              <AdPanel
                adId="438EC272-3F57-4FE2-98A6-58D742A4C1B9"
                visible={visible}
                phone={PHONE}
                hideReason={hideReason}
                isFav={false}
                hasNoPhone={false}
                showDuplicates={false}
                hasDuplicateAdsWithSamePhone={false}
                isDark={false}
                renderPhoneAndTags={(_adId, phone, children) => (
                  <PhoneAndTags
                    phone={phone}
                    isMobile={isMobile}
                    isDark={false}
                    age={29}
                    height={168}
                    weight={62}
                    bmi={22}
                    firstSeen={FIRST_SEEN}
                  >
                    {children}
                  </PhoneAndTags>
                )}
                onVisibilityClick={() => setVisible(false)}
                onInvestigateClick={() => undefined}
                onInvestigateImgClick={() => undefined}
                onViewDuplicatesClick={() => undefined}
              />
            </Publi24AdFixture>
          </div>
        </div>
      </div>
      <DemoMouse x={pointerPosition.x} y={pointerPosition.y} isClicking={pointerIsClicking} />
    </div>
  );
};

export default HideFeatureDemo;
