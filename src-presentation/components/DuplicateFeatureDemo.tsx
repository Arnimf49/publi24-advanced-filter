import React, {useEffect, useRef, useState} from 'react';
import AdsModal from '../../src/publi24/component/Common/Partials/AdsModal/AdsModal';
import AdPanel from '../../src/publi24/component/AdPanel/AdPanel';
import PhoneAndTags from '../../src/publi24/component/Common/Partials/PhoneAndTags/PhoneAndTags';
import type {AdData} from '../../src/publi24/core/adData';
import AnimationStatusBar from './AnimationStatusBar';
import DemoMouse from './DemoMouse';
import Publi24AdFixture from './Publi24AdFixture';
import Publi24SvgSprite from './Publi24SvgSprite';
import useDemoVisibility from './useDemoVisibility';
import styles from './DuplicateFeatureDemo.module.scss';
import demoStyles from './Publi24Demo.module.scss';

type DuplicateDemoPhase =
  | 'waiting'
  | 'entering'
  | 'hovering'
  | 'clicking'
  | 'scrolling'
  | 'showing';

const PHONE = '0740123456';
const FIRST_SEEN = Date.now() - 90 * 24 * 60 * 60 * 1000;
const DUPLICATE_ANIMATION_DURATION = 7600;
const SCROLL_BOTTOM_OFFSET = 100;
const DUPLICATE_IDS = [
  '438EC272-3F57-4FE2-98A6-58D742A4C1B9',
  'D4A7D5B8-0F61-4A2E-9C88-2F2E8B3C6E10',
];

const DUPLICATE_ADS: AdData[] = DUPLICATE_IDS.map((id, index) => ({
  IS_MOBILE_VIEW: false,
  id,
  url: '#demo-ad',
  phone: PHONE,
  qrCode: null,
  title: index === 0 ? 'Anunț demonstrativ pentru testarea extensiei' : 'Anunț similar cu același număr',
  description: 'Același număr de telefon apare într-un alt anunț. Compară fotografiile și detaliile într-un singur loc.',
  image: null,
  location: index === 0 ? 'Cluj-Napoca, Cluj' : 'Oradea, Bihor',
  date: index === 0 ? 'azi 21:20' : 'ieri 18:05',
  timestamp: Date.now() - index * 24 * 60 * 60 * 1000,
  isDateOld: index > 0,
  isLocationDifferent: index > 0,
}));

const DuplicateFeatureDemo: React.FC = () => {
  const [phase, setPhase] = useState<DuplicateDemoPhase>('waiting');
  const [isDuplicatesOpen, setIsDuplicatesOpen] = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches
  ));
  const [pointerPosition, setPointerPosition] = useState({x: -40, y: 100});
  const [playRequested, setPlayRequested] = useState(false);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const resetAnimation = () => {
    setIsDuplicatesOpen(false);
    setPointerPosition({x: -40, y: 100});
    setAnimationCycle((current) => current + 1);
    setPhase('waiting');
  };
  const isDemoActive = useDemoVisibility(stageRef, 4000, playRequested, resetAnimation);

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

    const scrollModalSlowly = () => {
      const modal = stage?.querySelector<HTMLElement>('[data-wwid="ads-modal"]');
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
      const duration = Math.max(4000, maxScroll / 115 * 1000);
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
          if (movePointerTo('[data-wwid="duplicates"]')) {
            setPhase('entering');
          }
        }, 800);
        break;
      case 'entering':
        timeout = window.setTimeout(() => setPhase('hovering'), 1100);
        break;
      case 'hovering':
        timeout = window.setTimeout(() => setPhase('clicking'), 750);
        break;
      case 'clicking':
        timeout = window.setTimeout(() => {
          if (clickElement('[data-wwid="duplicates"]')) {
            setIsDuplicatesOpen(true);
            setPhase('scrolling');
          }
        }, 300);
        break;
      case 'scrolling':
        timeout = window.setTimeout(() => {
          scrollModalSlowly();
        }, 450);
        break;
      case 'showing':
        timeout = window.setTimeout(() => {
          setIsDuplicatesOpen(false);
          setPointerPosition({x: -40, y: 100});
          setAnimationCycle((current) => current + 1);
          setPhase('waiting');
        }, 4650);
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

  const renderAd = (ad: AdData, index: number) => (
    <Publi24AdFixture
      key={ad.id}
      articleId={ad.id}
      imageTransform={index === 1 ? 'rotateY(180deg)' : undefined}
      title={ad.title ?? undefined}
      description={ad.description ?? undefined}
      location={ad.location ?? undefined}
      date={ad.date ?? undefined}
    >
      <AdPanel
        adId={ad.id}
        visible={true}
        phone={ad.phone}
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
  );

  const pointerIsClicking = phase === 'clicking';

  return (
    <div className={`${styles.demo}${isMobile ? ' onMobile' : ''}`} ref={stageRef}>
      <AnimationStatusBar
        duration={DUPLICATE_ANIMATION_DURATION}
        resetKey={animationCycle}
        isPaused={!isDemoActive}
        onPlay={() => {
          setPlayRequested(true);
          setIsAnimationPaused(false);
        }}
        onPauseChange={setIsAnimationPaused}
        onRestart={() => {
          setIsDuplicatesOpen(false);
          setPointerPosition({x: -40, y: 100});
          setPlayRequested(true);
          setIsAnimationPaused(false);
          setAnimationCycle((current) => current + 1);
          setPhase('waiting');
        }}
      />
      <div className={`${styles.viewport}${isDemoActive && !isAnimationPaused ? ` ${demoStyles.mobileScrollThrough}` : ''}`}>
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
                adId={DUPLICATE_IDS[0]}
                visible={true}
                phone={PHONE}
                isFav={false}
                hasNoPhone={false}
                showDuplicates={true}
                hasDuplicateAdsWithSamePhone={true}
                numberOfAdsWithSamePhone={2}
                duplicatesSource="inspector-escorte"
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
                onViewDuplicatesClick={() => {
                  setIsDuplicatesOpen(true);
                  setPhase('scrolling');
                }}
              />
            </Publi24AdFixture>
          </div>
        </div>

        {isDuplicatesOpen && (
          <AdsModal
            inline={true}
            phone={PHONE}
            source="inspector-escorte"
            sourcePhone={PHONE}
            adsData={DUPLICATE_ADS}
            totalCount={DUPLICATE_ADS.length}
            close={() => setIsDuplicatesOpen(false)}
            renderAds={(ads) => ads.map((ad, index) => (
              <div key={ad.id} className={styles.duplicateAd}>
                {renderAd(ad, index)}
              </div>
            ))}
          />
        )}
      </div>
      <DemoMouse x={pointerPosition.x} y={pointerPosition.y} isClicking={pointerIsClicking} />
    </div>
  );
};

export default DuplicateFeatureDemo;
