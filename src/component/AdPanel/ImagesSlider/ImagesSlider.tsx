import React, {MouseEventHandler, useEffect} from 'react';
import styles from './ImagesSlider.module.scss';
import Modal from "../../Common/Modal/Modal";

declare const Splide: any;

type ImageSliderProps = {
  images: string[];
  visible: boolean;
  isMobileView: boolean;
  close: () => void;
  onVisibilityClick: MouseEventHandler;
  onInvestigateImgClick: MouseEventHandler;
};

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  visible,
  isMobileView,
  close,
  onVisibilityClick,
  onInvestigateImgClick,
}) => {
  const buttonContainerClasses = `${styles.buttonContainer} ${isMobileView ? styles.isMobile : ''}`;
  const toggleButtonClasses = `${styles.visibilityButton} ${visible ? styles.isVisible : ''}`;

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    event.stopPropagation();
  };
  const visibilityClickHandler: MouseEventHandler = (event) => {
    onVisibilityClick(event);
    close();
  };
  const investigateImgClickHandler: MouseEventHandler = (event) => {
    onInvestigateImgClick(event);
    close();
  }

  useEffect(() => {
    const splideElement = document.querySelector<HTMLElement>('.splide');

    if (!splideElement) return;

    const splide = new Splide( splideElement, { focus: 'center', type: 'loop', keyboard: 'global' });
    splide.mount();

    const onKeyDown = function (event: KeyboardEvent): void {
      if (event.key.toLowerCase() === 'a') {
        splide.go('-1');
      } else if (event.key.toLowerCase() === 'd') {
        splide.go('+1');
      }
    };
    window.addEventListener("keydown", onKeyDown);

    document.querySelectorAll<HTMLElement>('.splide__arrow')
      .forEach((el) => el.addEventListener('click', (e: MouseEvent) => e.stopPropagation()));

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    }
  }, []);

  return (
    <Modal
      close={close}
      scroll={false}
      dataWwid="images-slider"
    >
      <div className={buttonContainerClasses}>
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

      <section className={`${styles.sliderSection} splide`} aria-label="Image Slider Content">
        <div className={`${styles.sliderTrack} splide__track`}>
          <ul className={`${styles.sliderList} splide__list`}>
            {images.map((imageUrl, index) => (
              <li key={index} className={`${styles.sliderSlide} splide__slide`}>
                <img
                  onClick={handleImageClick}
                  className={styles.slideImage}
                  src={imageUrl}
                  alt={`Slide ${index + 1}`}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Modal>
  );
};

export default ImageSlider;
