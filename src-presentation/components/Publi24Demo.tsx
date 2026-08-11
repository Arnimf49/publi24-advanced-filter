import React, {useEffect, useRef, useState} from 'react';
import AdPanel from '../../src/publi24/component/AdPanel/AdPanel';
import PhoneAndTags from '../../src/publi24/component/Common/Partials/PhoneAndTags/PhoneAndTags';
import AnimationStatusBar from './AnimationStatusBar';
import Publi24AdFixture from './Publi24AdFixture';
import Publi24SvgSprite from './Publi24SvgSprite';
import useDemoVisibility from './useDemoVisibility';
import styles from './Publi24Demo.module.scss';

type Publi24DemoProps = {
  extensionEnabled: boolean;
  onExtensionChange: (enabled: boolean) => void;
};

const PHONE = '0740123456';
const FIRST_SEEN = Date.now() - 90 * 24 * 60 * 60 * 1000;

const Publi24Demo: React.FC<Publi24DemoProps> = ({extensionEnabled, onExtensionChange}) => {
  const [visible, setVisible] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);
  const [playRequested, setPlayRequested] = useState(false);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches
  ));
  const demoRef = useRef<HTMLDivElement>(null);
  const resetAnimation = () => {
    setVisible(true);
    setIsFavorite(false);
    setAnimationCycle((current) => current + 1);
  };
  const isDemoActive = useDemoVisibility(demoRef, 4000, playRequested, resetAnimation);

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
    if (!isDemoActive || isAnimationPaused) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onExtensionChange(!extensionEnabled);
    }, extensionEnabled ? 30000 : 2000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [extensionEnabled, onExtensionChange, animationCycle, isDemoActive, isAnimationPaused]);

  const handleVisibilityClick = () => {
    setVisible((current) => !current);
  };

  const handleFavoriteClick = () => {
    setIsFavorite((current) => !current);
  };

  return (
    <div className={`${styles.demo}${isMobile ? ' onMobile' : ''}`} ref={demoRef}>
      <div className={styles.demoHeader}>
        <div className={styles.stateSwitch} role="group" aria-label="Starea extensiei">
          <button
            type="button"
            className={!extensionEnabled ? styles.stateActive : ''}
            onClick={() => onExtensionChange(false)}
            aria-pressed={!extensionEnabled}
          >
            Normal
          </button>
          <button
            type="button"
            className={extensionEnabled ? styles.stateActive : ''}
            onClick={() => onExtensionChange(true)}
            aria-pressed={extensionEnabled}
          >
            Cu extensie
          </button>
        </div>
      </div>

      <AnimationStatusBar
        duration={extensionEnabled ? 30000 : 2000}
        resetKey={`${extensionEnabled ? 'enabled' : 'disabled'}-${animationCycle}`}
        isPaused={!isDemoActive}
        onPlay={() => {
          setPlayRequested(true);
          setIsAnimationPaused(false);
        }}
        onPauseChange={setIsAnimationPaused}
        onRestart={() => {
          setVisible(true);
          setIsFavorite(false);
          setPlayRequested(true);
          setIsAnimationPaused(false);
          setAnimationCycle((current) => current + 1);
        }}
      />
      <div className={`${styles.viewport} ${extensionEnabled ? styles.extensionOn : styles.extensionOff}${isDemoActive && !isAnimationPaused ? ` ${styles.mobileScrollThrough}` : ''}`}>
        <div className={styles.browserBar}>
          <span className={styles.browserDot} />
          <span className={styles.browserDot} />
          <span className={styles.browserDot} />
          <span className={styles.address}>publi24.ro/anunturi</span>
        </div>
        <div className={`publi24-demo-site ${styles.primaryDemoSite}`}>
          <Publi24SvgSprite />
          <div className={styles.siteTopbar}>
            <b className="text-logo">
              <span className="t1">publi</span>
              <span className="t2">24</span>
              <span className="t3">.ro</span>
            </b>
          </div>
          <div className={`${styles.siteContent} rmd-container-search-results`}>
            <p className={styles.siteBreadcrumb}>Anunțuri / Cluj-Napoca</p>
            <Publi24AdFixture>
              <div className={styles.extensionPanel} aria-hidden={!extensionEnabled}>
                <AdPanel
                  adId="438EC272-3F57-4FE2-98A6-58D742A4C1B9"
                  visible={visible}
                  phone={PHONE}
                  isFav={isFavorite}
                  hasNoPhone={false}
                  showDuplicates={true}
                  hasDuplicateAdsWithSamePhone={true}
                  numberOfAdsWithSamePhone={4}
                  duplicatesSource="local"
                  hideReason={visible ? null : 'poze false'}
                  searchLinks={undefined}
                  filteredSearchLinks={[]}
                  imageSearchDomains={undefined}
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
                  onVisibilityClick={handleVisibilityClick}
                  onFavClick={handleFavoriteClick}
                  onInvestigateClick={() => undefined}
                  onInvestigateImgClick={() => undefined}
                  onViewDuplicatesClick={() => undefined}
                />
              </div>
            </Publi24AdFixture>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Publi24Demo;
