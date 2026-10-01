import React, {
  MouseEventHandler,
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './ImagesSlider.module.scss';
import Modal from "../../../../common/components/Modal/Modal";

declare const Splide: any;

type Point = {
  x: number;
  y: number;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const getDistance = (first: Point, second: Point): number =>
  Math.hypot(second.x - first.x, second.y - first.y);

const getMidpoint = (first: Point, second: Point): Point => ({
  x: (first.x + second.x) / 2,
  y: (first.y + second.y) / 2,
});

const imageDimensions = (image: HTMLImageElement): Point => ({
  x: image.clientWidth,
  y: image.clientHeight,
});

const getBoundedPosition = (
  dimensions: Point,
  zoom: number,
  nextPosition: Point,
): Point => ({
  x: clamp(nextPosition.x, -(dimensions.x * (zoom - 1)) / 2, (dimensions.x * (zoom - 1)) / 2),
  y: clamp(nextPosition.y, -(dimensions.y * (zoom - 1)) / 2, (dimensions.y * (zoom - 1)) / 2),
});

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
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [position, setPosition] = useState<Point>({x: 0, y: 0});
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const pointersRef = useRef(new Map<number, Point>());
  const pinchStartRef = useRef<{
    distance: number;
    midpoint: Point;
    position: Point;
    zoom: number;
  } | null>(null);
  const zoomRef = useRef(MIN_ZOOM);
  const positionRef = useRef<Point>({x: 0, y: 0});
  const splideRef = useRef<any>(null);
  const splideHasMultipleImagesRef = useRef(false);
  const singlePointerStartRef = useRef<Point | null>(null);
  const slideHandoffRef = useRef(false);
  const pendingSlideRef = useRef<'-1' | '+1' | null>(null);
  const edgeDragDistanceRef = useRef(0);
  const edgeDragDirectionRef = useRef<'previous' | 'next' | null>(null);
  const previewBasePositionRef = useRef<number | null>(null);
  const snapBackTimeoutRef = useRef<number | null>(null);
  const expectedSlideMoveRef = useRef(false);
  const slideTransitionActiveRef = useRef(false);

  const setSplideDragDisabled = (disabled: boolean): void => {
    splideRef.current?.Components.Drag.disable(disabled);
  };

  const snapPreviewBack = (position: number): void => {
    const list = splideRef.current?.Components.Elements.list as HTMLElement | undefined;
    if (!list) {
      splideRef.current?.Components.Move.translate(position, true);
      return;
    }

    if (snapBackTimeoutRef.current !== null) {
      window.clearTimeout(snapBackTimeoutRef.current);
    }

    list.style.transition = 'transform 180ms ease-out';
    requestAnimationFrame(() => {
      splideRef.current?.Components.Move.translate(position, true);
      snapBackTimeoutRef.current = window.setTimeout(() => {
        list.style.transition = '';
        snapBackTimeoutRef.current = null;
      }, 180);
    });
  };

  const resetZoom = (): void => {
    zoomRef.current = MIN_ZOOM;
    positionRef.current = {x: 0, y: 0};
    setZoom(MIN_ZOOM);
    setPosition({x: 0, y: 0});
    setSplideDragDisabled(!splideHasMultipleImagesRef.current);
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    event.stopPropagation();
  };

  const handlePointerDown = (event: PointerEvent<HTMLImageElement>): void => {
    const image = event.currentTarget;

    if (
      slideTransitionActiveRef.current
      || splideRef.current?.Components.Controller.isBusy()
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    pointersRef.current.set(event.pointerId, {x: event.clientX, y: event.clientY});

    if (pointersRef.current.size === 1 && zoomRef.current > MIN_ZOOM) {
      singlePointerStartRef.current = {x: event.clientX, y: event.clientY};
      slideHandoffRef.current = false;
      pendingSlideRef.current = null;
      edgeDragDistanceRef.current = 0;
      edgeDragDirectionRef.current = null;
      previewBasePositionRef.current = splideRef.current?.Components.Move.getPosition() ?? null;

      image.setPointerCapture(event.pointerId);
      setSplideDragDisabled(true);
      event.stopPropagation();
    }

    if (pointersRef.current.size === 1 && zoomRef.current === MIN_ZOOM) {
      singlePointerStartRef.current = {x: event.clientX, y: event.clientY};
      slideHandoffRef.current = false;
      pendingSlideRef.current = null;
      edgeDragDistanceRef.current = 0;
      edgeDragDirectionRef.current = null;
      previewBasePositionRef.current = splideRef.current?.Components.Move.getPosition() ?? null;
      image.setPointerCapture(event.pointerId);
      event.stopPropagation();
    }

    if (pointersRef.current.size === 2) {
      const pointerIds = [...pointersRef.current.keys()];
      const [first, second] = [...pointersRef.current.values()];
      pinchStartRef.current = {
        distance: getDistance(first, second),
        midpoint: getMidpoint(first, second),
        position: positionRef.current,
        zoom: zoomRef.current,
      };
      image.setPointerCapture(pointerIds[0]);
      image.setPointerCapture(event.pointerId);
      setSplideDragDisabled(true);
      event.stopPropagation();
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLImageElement>): void => {
    if (!pointersRef.current.has(event.pointerId)) {
      return;
    }

    const previousPointer = pointersRef.current.get(event.pointerId);
    pointersRef.current.set(event.pointerId, {x: event.clientX, y: event.clientY});

    if (pointersRef.current.size >= 2 && pinchStartRef.current) {
      const [first, second] = [...pointersRef.current.values()];
      const distance = getDistance(first, second);
      const midpoint = getMidpoint(first, second);
      const nextZoom = clamp(
        pinchStartRef.current.zoom * (distance / pinchStartRef.current.distance),
        MIN_ZOOM,
        MAX_ZOOM,
      );
      const nextPosition = getBoundedPosition(
        imageDimensions(event.currentTarget),
        nextZoom,
        {
          x: pinchStartRef.current.position.x
            + midpoint.x
            - pinchStartRef.current.midpoint.x,
          y: pinchStartRef.current.position.y
            + midpoint.y
            - pinchStartRef.current.midpoint.y,
        },
      );

      zoomRef.current = nextZoom;
      positionRef.current = nextPosition;
      setZoom(nextZoom);
      setPosition(nextPosition);
      setSplideDragDisabled(nextZoom > MIN_ZOOM || pointersRef.current.size >= 2);
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (pointersRef.current.size === 1) {
      const start = singlePointerStartRef.current;
      const deltaX = start ? event.clientX - start.x : 0;
      const deltaY = start ? event.clientY - start.y : 0;
      const sliderWidth = event.currentTarget.closest<HTMLElement>('.splide__track')?.clientWidth
        || event.currentTarget.clientWidth;
      const handoffThreshold = sliderWidth * (zoomRef.current === MIN_ZOOM ? 0.15 : 0.4);
      const isHorizontalDrag = Math.abs(deltaX) > Math.abs(deltaY);

      if (zoomRef.current === MIN_ZOOM) {
        if (isHorizontalDrag && previewBasePositionRef.current !== null) {
          splideRef.current?.Components.Move.translate(
            previewBasePositionRef.current + deltaX,
            true,
          );
        }

        if (!slideHandoffRef.current && isHorizontalDrag && Math.abs(deltaX) >= handoffThreshold) {
          slideHandoffRef.current = true;
          pendingSlideRef.current = deltaX > 0 ? '-1' : '+1';
        }
      } else {
        const dimensions = imageDimensions(event.currentTarget);
        const horizontalLimit = (dimensions.x * (zoomRef.current - 1)) / 2;
        const minPosition = -horizontalLimit;
        const maxPosition = horizontalLimit;

        const deltaX = previousPointer ? event.clientX - previousPointer.x : 0;
        const isAtLeftEdge = positionRef.current.x >= maxPosition - 2;
        const isAtRightEdge = positionRef.current.x <= minPosition + 2;

        if (!edgeDragDirectionRef.current && isAtLeftEdge && deltaX > 0) {
          edgeDragDirectionRef.current = 'previous';
        } else if (!edgeDragDirectionRef.current && isAtRightEdge && deltaX < 0) {
          edgeDragDirectionRef.current = 'next';
        }

        if (edgeDragDirectionRef.current === 'previous') {
          edgeDragDistanceRef.current = Math.max(0, edgeDragDistanceRef.current + deltaX);
        } else if (edgeDragDirectionRef.current === 'next') {
          edgeDragDistanceRef.current = Math.max(0, edgeDragDistanceRef.current - deltaX);
        }

        if (edgeDragDirectionRef.current && edgeDragDistanceRef.current > 0) {
          if (previewBasePositionRef.current !== null) {
            const previewDirection = edgeDragDirectionRef.current === 'previous' ? 1 : -1;
            splideRef.current?.Components.Move.translate(
              previewBasePositionRef.current
                + previewDirection * edgeDragDistanceRef.current,
              true,
            );
          }
        } else {
          edgeDragDirectionRef.current = null;
          if (previewBasePositionRef.current !== null) {
            splideRef.current?.Components.Move.translate(
              previewBasePositionRef.current,
              true,
            );
          }
        }

        const draggingToPrevious = edgeDragDirectionRef.current === 'previous'
          && edgeDragDistanceRef.current >= handoffThreshold;
        const draggingToNext = edgeDragDirectionRef.current === 'next'
          && edgeDragDistanceRef.current >= handoffThreshold;

        if (
          pendingSlideRef.current
          && edgeDragDistanceRef.current < handoffThreshold
        ) {
          slideHandoffRef.current = false;
          pendingSlideRef.current = null;
        }

        if (!slideHandoffRef.current && (draggingToPrevious || draggingToNext)) {
          slideHandoffRef.current = true;
          pendingSlideRef.current = draggingToPrevious ? '-1' : '+1';
        } else if (!slideHandoffRef.current && previousPointer) {
          const nextPosition = getBoundedPosition(
            dimensions,
            zoomRef.current,
            {
              x: positionRef.current.x + event.clientX - previousPointer.x,
              y: positionRef.current.y + event.clientY - previousPointer.y,
            },
          );

          positionRef.current = nextPosition;
          setPosition(nextPosition);
        }
      }

      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLImageElement>): void => {
    const image = event.currentTarget;
    pointersRef.current.delete(event.pointerId);
    pinchStartRef.current = null;

    if (image.hasPointerCapture(event.pointerId)) {
      image.releasePointerCapture(event.pointerId);
    }

    if (pointersRef.current.size === 0) {
      const pendingSlide = pendingSlideRef.current;
      const previewBasePosition = previewBasePositionRef.current;
      singlePointerStartRef.current = null;
      slideHandoffRef.current = false;
      pendingSlideRef.current = null;
      edgeDragDistanceRef.current = 0;
      edgeDragDirectionRef.current = null;
      previewBasePositionRef.current = null;

      if (previewBasePosition !== null && !pendingSlide) {
        snapPreviewBack(previewBasePosition);
      }

      if (pendingSlide) {
        expectedSlideMoveRef.current = true;
        slideTransitionActiveRef.current = true;

        if (previewBasePosition !== null) {
          splideRef.current?.Components.Move.translate(previewBasePosition, true);
        }

        resetZoom();
        window.requestAnimationFrame(() => {
          splideRef.current?.go(pendingSlide);
        });
      }
    }

    if (zoomRef.current === MIN_ZOOM && pointersRef.current.size === 0) {
      setSplideDragDisabled(!splideHasMultipleImagesRef.current);
    }

    if (zoomRef.current > MIN_ZOOM) {
      event.stopPropagation();
    }
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLImageElement>): void => {
    event.stopPropagation();

    const nextZoom = zoomRef.current === MIN_ZOOM ? 2 : MIN_ZOOM;
    if (nextZoom === MIN_ZOOM) {
      resetZoom();
      return;
    }

    zoomRef.current = nextZoom;
    setZoom(nextZoom);
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

    const hasMultipleImages = images.length > 1;
    const splide = new Splide(splideElement, {
      focus: 'center',
      type: 'loop',
      keyboard: 'global',
      arrows: hasMultipleImages,
      drag: hasMultipleImages,
      gap: '10px',
      speed: 250,
      noDrag: `.${styles.slideImage}`,
    });
    splide.mount();
    splideRef.current = splide;
    splideHasMultipleImagesRef.current = hasMultipleImages;
    splide.on('moved', (newIndex: number) => {
      setActiveSlideIndex(newIndex);
      if (expectedSlideMoveRef.current) {
        expectedSlideMoveRef.current = false;
        resetZoom();
      }
      slideTransitionActiveRef.current = false;
    });

    const onKeyDown = function (event: KeyboardEvent): void {
      if (event.key.toLowerCase() === 'a') {
        expectedSlideMoveRef.current = true;
        slideTransitionActiveRef.current = true;
        splide.go('-1');
      } else if (event.key.toLowerCase() === 'd') {
        expectedSlideMoveRef.current = true;
        slideTransitionActiveRef.current = true;
        splide.go('+1');
      }
    };
    window.addEventListener("keydown", onKeyDown);

    document.querySelectorAll<HTMLElement>('.splide__arrow')
      .forEach((el) => el.addEventListener('click', (e: MouseEvent) => {
        expectedSlideMoveRef.current = true;
        slideTransitionActiveRef.current = true;
        e.stopPropagation();
      }));

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      splide.destroy();
      splideRef.current = null;
    }
  }, []);

  return (
    <Modal
      close={close}
      scroll={false}
      dataWwid="images-slider"
    >
      <div
        className={styles.buttonContainer}
        onClick={(event) => event.stopPropagation()}
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
        className={`${styles.sliderSection} splide`}
        aria-label="Image Slider Content"
      >
        <div className={`${styles.sliderTrack} splide__track`}>
          <ul className={`${styles.sliderList} splide__list`}>
            {images.map((imageUrl, index) => (
              <li key={index} className={`${styles.sliderSlide} splide__slide`}>
                <img
                  onClick={handleImageClick}
                  onDoubleClick={handleDoubleClick}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className={`${styles.slideImage} ${
                    index === activeSlideIndex && zoom > MIN_ZOOM ? styles.zoomedImage : ''
                  }`}
                  src={imageUrl}
                  alt={`Slide ${index + 1}`}
                  style={index === activeSlideIndex ? {
                    transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`,
                  } : undefined}
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
