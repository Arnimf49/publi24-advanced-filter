import React, {useEffect, useRef, useState} from 'react';
import AdPanel from '../../src/publi24/component/AdPanel/AdPanel';
import Modal from '../../src/common/components/Modal/Modal';
import GlobalButtons from '../../src/publi24/component/GlobalButtons/GlobalButtons';
import PhoneAndTags from '../../src/publi24/component/Common/Partials/PhoneAndTags/PhoneAndTags';
import SettingsModal, {SettingsData} from '../../src/publi24/component/GlobalButtons/SettingsModal/SettingsModal';
import AnimationStatusBar from './AnimationStatusBar';
import DemoMouse from './DemoMouse';
import Publi24AdFixture from './Publi24AdFixture';
import Publi24SvgSprite from './Publi24SvgSprite';
import useDemoVisibility from './useDemoVisibility';
import styles from './SettingsFeatureDemo.module.scss';
import demoStyles from './Publi24Demo.module.scss';

type SettingsDemoPhase =
  | 'waiting'
  | 'enteringMenu'
  | 'hoveringMenu'
  | 'clickingMenu'
  | 'enteringSettings'
  | 'hoveringSettings'
  | 'clickingSettings'
  | 'scrolling'
  | 'showing';

const PHONE = '0740123456';
const FIRST_SEEN = Date.now() - 90 * 24 * 60 * 60 * 1000;
const SETTINGS_ANIMATION_DURATION = 15000;
const SCROLL_BOTTOM_OFFSET = 100;

const DEMO_SETTINGS: SettingsData = {
  whatsappMessageEnabled: true,
  whatsappMessage: 'Bună, mai este disponibil anunțul?',
  focusMode: false,
  adDeduplication: false,
  autoHide: true,
  nextOnlyVisible: true,
  defaultManualHideReasonEnabled: true,
  defaultManualHideReason: 'aspect',
  manualPhoneSearchEnabled: false,
  manualImageSearchEnabled: false,
  maxAge: true,
  maxAgeValue: 40,
  minHeight: true,
  minHeightValue: 160,
  maxHeight: true,
  maxHeightValue: 175,
  maxWeight: true,
  maxWeightValue: 65,
  mature: true,
  trans: true,
  botox: true,
  onlyTrips: true,
  showWeb: true,
  btsRisc: true,
  party: true,
};

const SettingsFeatureDemo: React.FC = () => {
  const [phase, setPhase] = useState<SettingsDemoPhase>('waiting');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches
  ));
  const [playRequested, setPlayRequested] = useState(false);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const [pointerPosition, setPointerPosition] = useState({x: -40, y: 100});
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
    let animationFrame: number | undefined;

    if (!isDemoActive || isAnimationPaused) {
      return;
    }

    const movePointerTo = (selector: string) => {
      if (!stage) {
        return false;
      }

      const element = stage.querySelector<HTMLElement>(selector);
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

    const clickElement = (selector: string) => {
      if (!stage) {
        return false;
      }

      const element = stage.querySelector<HTMLElement>(selector);
      if (!element) {
        return false;
      }

      element.setAttribute('data-demo-clicking', 'true');
      window.setTimeout(() => element.removeAttribute('data-demo-clicking'), 360);
      element.click();

      return true;
    };

    const scrollSettingsToBottom = () => {
      const modal = stage?.querySelector<HTMLElement>('[data-wwid="settings-modal"]');
      if (!modal) {
        return false;
      }

      const maxScroll = Math.max(0, modal.scrollHeight - modal.clientHeight - SCROLL_BOTTOM_OFFSET);
      if (maxScroll <= 0) {
        setPhase('showing');
        return true;
      }

      modal.scrollTop = 0;
      const startedAt = performance.now();
      const duration = Math.max(5000, maxScroll / 100 * 1000);
      const animateScroll = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const easedProgress = progress * progress * (3 - 2 * progress);
        modal.scrollTop = maxScroll * easedProgress;

        if (progress >= 1) {
          animationFrame = undefined;
          setPhase('showing');
          return;
        }

        animationFrame = window.requestAnimationFrame(animateScroll);
      };

      animationFrame = window.requestAnimationFrame(animateScroll);

      return true;
    };

    switch (phase) {
      case 'waiting':
        timeout = window.setTimeout(() => {
          if (movePointerTo('[data-wwid="menu-button"]')) {
            setPhase('enteringMenu');
          }
        }, 800);
        break;
      case 'enteringMenu':
        timeout = window.setTimeout(() => setPhase('hoveringMenu'), 1100);
        break;
      case 'hoveringMenu':
        timeout = window.setTimeout(() => setPhase('clickingMenu'), 700);
        break;
      case 'clickingMenu':
        timeout = window.setTimeout(() => {
          if (clickElement('[data-wwid="menu-button"]')) {
            setPhase('enteringSettings');
          }
        }, 300);
        break;
      case 'enteringSettings':
        timeout = window.setTimeout(() => {
          if (movePointerTo('[data-wwid="settings-button"]')) {
            setPhase('hoveringSettings');
          }
        }, 350);
        break;
      case 'hoveringSettings':
        timeout = window.setTimeout(() => setPhase('clickingSettings'), 800);
        break;
      case 'clickingSettings':
        timeout = window.setTimeout(() => {
          if (clickElement('[data-wwid="settings-button"]')) {
            setIsSettingsOpen(true);
            setPhase('scrolling');
          }
        }, 300);
        break;
      case 'scrolling':
        timeout = window.setTimeout(() => {
          scrollSettingsToBottom();
        }, 450);
        break;
      case 'showing':
        timeout = window.setTimeout(() => {
          setIsSettingsOpen(false);
          setIsMenuOpen(false);
          setPointerPosition({x: -40, y: 100});
          setAnimationCycle((current) => current + 1);
          setPhase('waiting');
        }, 4300);
        break;
    }

    return () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }

      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [phase, animationCycle, isDemoActive, isAnimationPaused]);

  const pointerIsClicking = phase === 'clickingMenu' || phase === 'clickingSettings';

  return (
    <div className={`${styles.demo}${isMobile ? ' onMobile' : ''}`} ref={stageRef}>
      <AnimationStatusBar
        duration={SETTINGS_ANIMATION_DURATION}
        resetKey={animationCycle}
        isPaused={!isDemoActive}
        onPlay={() => {
          setPlayRequested(true);
          setIsAnimationPaused(false);
        }}
        onPauseChange={setIsAnimationPaused}
        onRestart={() => {
          setIsMenuOpen(false);
          setIsSettingsOpen(false);
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
            <Publi24AdFixture>
              <AdPanel
                adId="438EC272-3F57-4FE2-98A6-58D742A4C1B9"
                visible={true}
                phone={PHONE}
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
                onVisibilityClick={() => undefined}
                onFavClick={() => undefined}
                onInvestigateClick={() => undefined}
                onInvestigateImgClick={() => undefined}
                onViewDuplicatesClick={() => undefined}
              />
            </Publi24AdFixture>
          </div>
        </div>

        <div className={styles.globalButtonsSlot}>
          <GlobalButtons
            favsCount={0}
            favsWithNoAdsCount={0}
            isMobile={isMobile}
            isDark={false}
            isDemo={true}
            onLogoClick={() => undefined}
            onSearchClick={() => undefined}
            onSettingsClick={() => setIsSettingsOpen(true)}
            onFavsClick={() => undefined}
            onVersionHistoryClick={() => undefined}
            onFeedbackClick={() => undefined}
            onTutorialClick={() => undefined}
            onMenuClick={() => setIsMenuOpen((current) => !current)}
            isMenuOpen={isMenuOpen}
            onMenuClose={() => setIsMenuOpen(false)}
            hasNewVersion={false}
            currentVersion="demo"
          />
        </div>

        {isSettingsOpen && (
          <Modal close={() => setIsSettingsOpen(false)} inline={true} dataWwid="settings-modal">
            <SettingsModal
              onClose={() => setIsSettingsOpen(false)}
              settings={DEMO_SETTINGS}
              onToggleWhatsappMessage={() => undefined}
              onWhatsappMessageChange={() => undefined}
              onToggleFocusMode={() => undefined}
              onToggleAdDeduplication={() => undefined}
              onToggleAutoHide={() => undefined}
              onToggleNextOnlyVisible={() => undefined}
              onToggleDefaultManualHideReason={() => undefined}
              onDefaultManualHideReasonChange={() => undefined}
              onToggleManualPhoneSearch={() => undefined}
              onToggleManualImageSearch={() => undefined}
              onToggleCriteria={() => undefined}
              onCriteriaValueChange={() => undefined}
              handleExport={() => undefined}
              handleImport={async () => undefined}
              storageUsagePercent={18}
              isDark={false}
            />
          </Modal>
        )}
      </div>
      <DemoMouse x={pointerPosition.x} y={pointerPosition.y} isClicking={pointerIsClicking} />
    </div>
  );
};

export default SettingsFeatureDemo;
