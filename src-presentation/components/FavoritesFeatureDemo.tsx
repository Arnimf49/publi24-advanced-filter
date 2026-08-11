import React, {useEffect, useRef, useState} from 'react';
import AdPanel from '../../src/publi24/component/AdPanel/AdPanel';
import FavoritesModal from '../../src/publi24/component/GlobalButtons/FavoritesModal/FavoritesModal';
import GlobalButtons from '../../src/publi24/component/GlobalButtons/GlobalButtons';
import PhoneAndTags from '../../src/publi24/component/Common/Partials/PhoneAndTags/PhoneAndTags';
import type {AdData} from '../../src/publi24/core/adData';
import AnimationStatusBar from './AnimationStatusBar';
import DemoMouse from './DemoMouse';
import Publi24AdFixture from './Publi24AdFixture';
import Publi24SvgSprite from './Publi24SvgSprite';
import useDemoVisibility from './useDemoVisibility';
import styles from './FavoritesFeatureDemo.module.scss';
import demoStyles from './Publi24Demo.module.scss';

type FavoritesDemoPhase =
  | 'waiting'
  | 'enteringFavorite'
  | 'hoveringFavorite'
  | 'clickingFavorite'
  | 'waitingGlobal'
  | 'enteringGlobal'
  | 'hoveringGlobal'
  | 'clickingGlobal'
  | 'showingFavorites';

const PHONE = '0740123456';
const FIRST_SEEN = Date.now() - 90 * 24 * 60 * 60 * 1000;
const FAVORITES_ANIMATION_DURATION = 8650;

const FAVORITE_AD: AdData = {
  IS_MOBILE_VIEW: false,
  id: '438EC272-3F57-4FE2-98A6-58D742A4C1B9',
  url: '#demo-ad',
  phone: PHONE,
  qrCode: null,
  title: 'Anunț demonstrativ pentru testarea extensiei',
  description: 'Text fictiv folosit pentru a demonstra lista de favorite.',
  image: null,
  location: 'Cluj-Napoca, Cluj',
  date: 'azi 21:20',
  timestamp: Date.now(),
  isDateOld: false,
  isLocationDifferent: false,
};

const FavoritesFeatureDemo: React.FC = () => {
  const [phase, setPhase] = useState<FavoritesDemoPhase>('waiting');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches
  ));
  const [animationCycle, setAnimationCycle] = useState(0);
  const [pointerPosition, setPointerPosition] = useState({x: -40, y: 100});
  const [playRequested, setPlayRequested] = useState(false);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const resetAnimation = () => {
    setIsFavorite(false);
    setIsFavoritesOpen(false);
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

    switch (phase) {
      case 'waiting':
        timeout = window.setTimeout(() => {
          movePointerTo('[data-wwid="fav-toggle"]');
          setPhase('enteringFavorite');
        }, 800);
        break;
      case 'enteringFavorite':
        timeout = window.setTimeout(() => setPhase('hoveringFavorite'), 1100);
        break;
      case 'hoveringFavorite':
        timeout = window.setTimeout(() => setPhase('clickingFavorite'), 750);
        break;
      case 'clickingFavorite':
        timeout = window.setTimeout(() => {
          if (clickElement('[data-wwid="fav-toggle"]')) {
            setIsFavorite(true);
            setPhase('waitingGlobal');
          }
        }, 300);
        break;
      case 'waitingGlobal':
        timeout = window.setTimeout(() => {
          movePointerTo('[data-wwid="favs-button"]');
          setPhase('enteringGlobal');
        }, 300);
        break;
      case 'enteringGlobal':
        timeout = window.setTimeout(() => setPhase('hoveringGlobal'), 900);
        break;
      case 'hoveringGlobal':
        timeout = window.setTimeout(() => setPhase('clickingGlobal'), 700);
        break;
      case 'clickingGlobal':
        timeout = window.setTimeout(() => {
          if (clickElement('[data-wwid="favs-button"]')) {
            setIsFavoritesOpen(true);
            setPhase('showingFavorites');
          }
        }, 300);
        break;
      case 'showingFavorites':
        timeout = window.setTimeout(() => {
          setIsFavoritesOpen(false);
          setIsFavorite(false);
          setPointerPosition({x: -40, y: 100});
          setAnimationCycle((current) => current + 1);
          setPhase('waiting');
        }, 3500);
        break;
    }

    return () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
    };
  }, [phase, animationCycle, isDemoActive, isAnimationPaused]);

  const renderFavoriteAd = (ad: AdData, favorite: boolean, onFavoriteClick?: () => void) => (
    <Publi24AdFixture key={ad.id}>
      <AdPanel
        adId={ad.id}
        visible={true}
        phone={ad.phone}
        isFav={favorite}
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
        onFavClick={onFavoriteClick}
        onVisibilityClick={() => undefined}
        onInvestigateClick={() => undefined}
        onInvestigateImgClick={() => undefined}
        onViewDuplicatesClick={() => undefined}
      />
    </Publi24AdFixture>
  );

  const pointerIsClicking = phase === 'clickingFavorite' || phase === 'clickingGlobal';

  return (
    <div className={`${styles.demo}${isMobile ? ' onMobile' : ''}`} ref={stageRef}>
      <AnimationStatusBar
        duration={FAVORITES_ANIMATION_DURATION}
        resetKey={animationCycle}
        isPaused={!isDemoActive}
        onPlay={() => {
          setPlayRequested(true);
          setIsAnimationPaused(false);
        }}
        onPauseChange={setIsAnimationPaused}
        onRestart={() => {
          setIsFavorite(false);
          setIsFavoritesOpen(false);
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
            {renderFavoriteAd(FAVORITE_AD, isFavorite, () => setIsFavorite(true))}
          </div>
        </div>

        <div className={styles.globalButtonsSlot}>
          <GlobalButtons
            favsCount={isFavorite ? 1 : 0}
            favsWithNoAdsCount={0}
            isMobile={isMobile}
            isDark={false}
            isDemo={true}
            onLogoClick={() => undefined}
            onSearchClick={() => undefined}
            onSettingsClick={() => undefined}
            onFavsClick={() => {
              window.setTimeout(() => setIsFavoritesOpen(true), 360);
            }}
            onVersionHistoryClick={() => undefined}
            onFeedbackClick={() => undefined}
            onTutorialClick={() => undefined}
            onMenuClick={() => undefined}
            isMenuOpen={false}
            onMenuClose={() => undefined}
            hasNewVersion={false}
            currentVersion="demo"
          />
        </div>

        {isFavoritesOpen && (
          <FavoritesModal
            inline={true}
            onClose={() => setIsFavoritesOpen(false)}
            onClearFavorites={() => undefined}
            onRemoveNoAd={() => undefined}
            inLocationAds={[FAVORITE_AD]}
            notInLocationAds={[]}
            noAdsItems={[]}
            isDark={false}
            renderAds={(ads) => ads.map((ad) => renderFavoriteAd(ad, true))}
            renderNoAd={(phone) => <span>{phone}</span>}
          />
        )}
      </div>
      <DemoMouse x={pointerPosition.x} y={pointerPosition.y} isClicking={pointerIsClicking} />
    </div>
  );
};

export default FavoritesFeatureDemo;
