import React, {
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import styles from './ImagesSlider.module.scss';
import Modal from "../../../../common/components/Modal/Modal";

declare const Swiper: any;

type ImageSliderProps = {
  images: string[];
  visible: boolean;
  close: () => void;
  onVisibilityClick: MouseEventHandler;
  onInvestigateImgClick: MouseEventHandler;
};

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  visible,
  close,
  onVisibilityClick,
  onInvestigateImgClick,
}) => {
  const toggleButtonClasses = `${styles.visibilityButton} ${visible ? styles.isVisible : ''}`;
  const hasMultipleImages = images.length > 1;
  const swiperElementRef = useRef<HTMLElement>(null);

  const visibilityClickHandler: MouseEventHandler = (event) => {
    onVisibilityClick(event);
    close();
  };
  const investigateImgClickHandler: MouseEventHandler = (event) => {
    onInvestigateImgClick(event);
    close();
  };

  // Memoize the slides so React never reconciles this subtree. Swiper rearranges
  // the slide DOM itself (e.g. for loop mode), and a re-render would fight it.
  const slides = useMemo(() => images.map((imageUrl, index) => (
    <div key={index} className={`swiper-slide ${styles.sliderSlide}`}>
      <div className="swiper-zoom-container">
        <img
          className={styles.slideImage}
          src={imageUrl}
          alt={`Slide ${index + 1}`}
          draggable={false}
        />
      </div>
    </div>
  )), [images]);

  useEffect(() => {
    const swiperElement = swiperElementRef.current;
    if (!swiperElement) {
      return;
    }

    const swiper = new Swiper(swiperElement, {
      slidesPerView: 1,
      centeredSlides: true,
      spaceBetween: 10,
      loop: hasMultipleImages,
      speed: 250,
      keyboard: { enabled: true, onlyInViewport: false },
      navigation: hasMultipleImages
        ? { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
        : false,
      pagination: hasMultipleImages
        ? { el: '.swiper-pagination', clickable: true }
        : false,
      zoom: { maxRatio: 4, minRatio: 1, toggle: true },
      watchOverflow: true,
    });

    // Swiper's Zoom module only takes swipe control away from the slider once
    // the image is already zoomed (`image.isTouched`). During the initial pinch
    // the core slider still owns the first pointer, so it keeps dragging the
    // carousel while zooming, and the following slide transition resets the
    // zoom. While two or more pointers are down we therefore take swipe control
    // away ourselves and snap back any drag that had already started.
    const activePointers = new Set<number>();

    const releaseSwipeShortly = (): void => {
      if (activePointers.size === 0 && swiper.zoom.scale === 1) {
        swiper.allowTouchMove = true;
      }
    };

    const handlePointerDown = (event: PointerEvent): void => {
      activePointers.add(event.pointerId);
      if (activePointers.size < 2) {
        return;
      }

      const touchData = swiper.touchEventsData;
      if (touchData && touchData.isMoved) {
        swiper.slideToClosest(0, false);
      }
      if (touchData) {
        touchData.isTouched = false;
        touchData.isMoved = false;
      }
      swiper.allowTouchMove = false;
    };
    const handlePointerEnd = (event: PointerEvent): void => {
      activePointers.delete(event.pointerId);
      releaseSwipeShortly();
    };

    swiperElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);
    swiper.on('zoomChange', (_swiper: unknown, scale: number) => {
      if (scale === 1) {
        releaseSwipeShortly();
      }
    });

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key.toLowerCase() === 'a') {
        swiper.slidePrev();
      } else if (event.key.toLowerCase() === 'd') {
        swiper.slideNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      swiperElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
      swiper.destroy(true, true);
    };
  }, []);

  const stopPropagation = (event: React.MouseEvent): void => {
    event.stopPropagation();
  };

  return (
    <Modal
      close={close}
      scroll={false}
      dataWwid="images-slider"
    >
      <div
        className={styles.buttonContainer}
        onClick={stopPropagation}
      >
        <button
          type="button"
          className={`${toggleButtonClasses} mainbg radius`}
          onClick={visibilityClickHandler}
          aria-label={visible ? "Hide" : "Show"}
          data-wwid="toggle-hidden"
        >
          {!visible ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <mask id="react-cut-mask">
                  <rect width="24" height="24" fill="white"></rect>
                  <line x1="6" y1="6" x2="24" y2="24" stroke="black" strokeWidth="4"></line>
                </mask>
              </defs>
              <g mask="url(#react-cut-mask)">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </g>
              <line x1="3" y1="3" x2="21" y2="21" strokeWidth="1"></line>
            </svg>
          )}
        </button>
        <button
          type="button"
          className={`${styles.analyzeButton} mainbg radius`}
          data-wwid="analyze-images"
          onClick={investigateImgClickHandler}
          aria-label="Analyze Images"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M20.4 14.5L16 10 4 20"/></svg>
        </button>
        <button
          type="button"
          className={styles.closeButton}
          onClick={close}
          aria-label="Close Slider"
          data-wwid="close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2"/>
            <line x1="20" y1="4" x2="4" y2="20" strokeWidth="2"/>
          </svg>
        </button>
      </div>

      <section
        ref={swiperElementRef}
        className={`${styles.sliderSection} swiper`}
        aria-label="Image Slider Content"
        onClick={stopPropagation}
      >
        <div className="swiper-wrapper">
          {slides}
        </div>
        {hasMultipleImages && (
          <>
            <div className="swiper-pagination" />
            <div className="swiper-button-prev" />
            <div className="swiper-button-next" />
          </>
        )}
      </section>
    </Modal>
  );
};

export default ImageSlider;
