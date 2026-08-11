import React, {useEffect, useRef, useState} from 'react';
import AdPanel from '../../src/publi24/component/AdPanel/AdPanel';
import type {SearchResult} from '../../src/publi24/core/linksFilter';
import PhoneAndTags from '../../src/publi24/component/Common/Partials/PhoneAndTags/PhoneAndTags';
import AnimationStatusBar from './AnimationStatusBar';
import DemoMouse from './DemoMouse';
import Publi24AdFixture from './Publi24AdFixture';
import Publi24SvgSprite from './Publi24SvgSprite';
import useDemoVisibility from './useDemoVisibility';
import styles from './SearchFeatureDemo.module.scss';
import demoStyles from './Publi24Demo.module.scss';

type SearchType = 'phone' | 'image';

type SearchFeatureDemoProps = {
  searchType: SearchType;
};

type SearchDemoPhase =
  | 'waiting'
  | 'entering'
  | 'hovering'
  | 'clicking'
  | 'loading'
  | 'results';

type ImageSearchResult = {
  domain: string;
  rawDomain: string;
  isSafe: boolean;
  isEscortListing: boolean;
  flag?: string;
  links: Array<{
    link: string;
    isDead?: boolean;
    isSafe?: boolean;
    isSuspicious?: boolean;
  }>;
};

const PHONE = '0740123456';
const FIRST_SEEN = Date.now() - 90 * 24 * 60 * 60 * 1000;
const SEARCH_ANIMATION_DURATION = 20000;
const PHONE_SEARCH_RESULTS: SearchResult[] = [
  ['nimfomane.com', 'https://nimfomane.com/forum/topic/230613-asd/'],
  ['ddcforum.com', 'https://ddcforum.com/index.php?/forums/topic/36424-antonia-0791169479-grand-arena/'],
  'https://example-review-site.com/0740123456',
];
const IMAGE_SEARCH_RESULTS: ImageSearchResult[] = [
  {
    domain: '🇷🇴  publi24.ro',
    rawDomain: 'publi24.ro',
    isSafe: true,
    isEscortListing: false,
    flag: '🇷🇴',
    links: [{link: 'https://publi24.ro/anunturi/demo-image', isSafe: true}],
  },
  {
    domain: '🇷🇴  ddcforum.com',
    rawDomain: 'ddcforum.com',
    isSafe: true,
    isEscortListing: false,
    flag: '🇷🇴',
    links: [{link: 'https://ddcforum.com/topic/demo-image', isSafe: true}],
  },
  {
    domain: '🇦🇹  escortlook.org',
    rawDomain: 'escortlook.org',
    isSafe: false,
    isEscortListing: true,
    flag: '🇦🇹',
    links: [{link: 'https://escortlook.org/profile/demo-image', isSuspicious: true}],
  },
  {
    domain: 'random-image-source-492.example',
    rawDomain: 'random-image-source-492.example',
    isSafe: false,
    isEscortListing: false,
    links: [{link: 'https://random-image-source-492.example/result'}],
  },
];

const SearchFeatureDemo: React.FC<SearchFeatureDemoProps> = ({searchType}) => {
  const [phase, setPhase] = useState<SearchDemoPhase>('waiting');
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches
  ));
  const [pointerPosition, setPointerPosition] = useState({x: -40, y: 100});
  const [animationCycle, setAnimationCycle] = useState(0);
  const [playRequested, setPlayRequested] = useState(false);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const resetAnimation = () => {
    setPointerPosition({x: -40, y: 100});
    setAnimationCycle((current) => current + 1);
    setPhase('waiting');
  };
  const isDemoActive = useDemoVisibility(stageRef, 4000, playRequested, resetAnimation);

  const isLoading = phase === 'loading';
  const hasResults = phase === 'results';
  const searchButtonSelector = searchType === 'phone'
    ? '[data-wwid="investigate"]'
    : '[data-wwid="investigate_img"]';

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

  const startSearch = () => {
    setPhase('loading');
  };

  useEffect(() => {
    const stage = stageRef.current;
    let timeout: number | undefined;

    if (!isDemoActive || isAnimationPaused) {
      return;
    }

    const movePointerToSearchButton = () => {
      if (!stage) {
        return false;
      }

      const element = stage.querySelector<HTMLElement>(searchButtonSelector);
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

    const clickSearchButton = () => {
      if (!stage) {
        return false;
      }

      const element = stage.querySelector<HTMLElement>(searchButtonSelector);
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
          if (movePointerToSearchButton()) {
            setPhase('entering');
          }
        }, 800);
        break;
      case 'entering':
        timeout = window.setTimeout(() => setPhase('hovering'), 1100);
        break;
      case 'hovering':
        timeout = window.setTimeout(() => setPhase('clicking'), 800);
        break;
      case 'clicking':
        timeout = window.setTimeout(() => {
          if (clickSearchButton()) {
            startSearch();
          }
        }, 300);
        break;
      case 'loading':
        timeout = window.setTimeout(() => setPhase('results'), 2000);
        break;
      case 'results':
        timeout = window.setTimeout(() => {
          setPointerPosition({x: -40, y: 100});
          setAnimationCycle((current) => current + 1);
          setPhase('waiting');
        }, 15000);
        break;
    }

    return () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
    };
  }, [phase, searchButtonSelector, animationCycle, isDemoActive, isAnimationPaused]);

  const pointerIsClicking = phase === 'clicking';

  return (
    <div className={`${styles.demo}${isMobile ? ' onMobile' : ''}`} ref={stageRef}>
      <AnimationStatusBar
        duration={SEARCH_ANIMATION_DURATION}
        resetKey={animationCycle}
        isPaused={!isDemoActive}
        onPlay={() => {
          setPlayRequested(true);
          setIsAnimationPaused(false);
        }}
        onPauseChange={setIsAnimationPaused}
        onRestart={() => {
          setPointerPosition({x: -40, y: 100});
          setPlayRequested(true);
          setIsAnimationPaused(false);
          setAnimationCycle((current) => current + 1);
          setPhase('waiting');
        }}
      />
      <div className={`${styles.viewport} ${searchType === 'image' ? styles.imageViewport : ''}${isDemoActive && !isAnimationPaused ? ` ${demoStyles.mobileScrollThrough}` : ''}`}>
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
                nimfomaneLink={searchType === 'phone' && hasResults ? 'https://nimfomane.com/forum/topic/230613-asd/' : undefined}
                ddcLink={searchType === 'phone' && hasResults ? 'https://ddcforum.com/index.php?/forums/topic/36424-antonia-0791169479-grand-arena/' : undefined}
                phoneInvestigatedSinceDays={searchType === 'phone' && hasResults ? 'azi' : undefined}
                imageInvestigatedSinceDays={searchType === 'image' && hasResults ? 'azi' : undefined}
                searchLinks={searchType === 'phone' && hasResults ? PHONE_SEARCH_RESULTS : undefined}
                filteredSearchLinks={searchType === 'phone' && hasResults ? PHONE_SEARCH_RESULTS : []}
                imageSearchDomains={searchType === 'image' && hasResults ? IMAGE_SEARCH_RESULTS : undefined}
                imageResultsStatus={searchType === 'image' && hasResults ? 'red' : undefined}
                isPhoneSearchLoading={searchType === 'phone' && isLoading}
                isImageSearchLoading={searchType === 'image' && isLoading}
                imageSearchJustCompleted={searchType === 'image' && hasResults}
                phoneSearchJustCompleted={searchType === 'phone' && hasResults}
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
                onInvestigateClick={searchType === 'phone' ? startSearch : undefined}
                onInvestigateImgClick={searchType === 'image' ? startSearch : undefined}
                onVisibilityClick={() => undefined}
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

export default SearchFeatureDemo;
