import React, {CSSProperties, FC, MouseEventHandler, Ref, useCallback, useEffect, useRef, useState} from "react";
import type {Image} from "../../../core/escortActions";
import classes from './EscortImages.module.scss';
import {CloseIcon} from "../../../../publi24/component/Common/Icons/CloseIcon";
import {Loader} from "../../../../common/components/Loader/Loader";
import ErrorDisplay from "../../Common/ErrorDisplay/ErrorDisplay";
import {P24faLogoLight} from "../../../../common/components/Logo/P24faLogoLight";
import {P24faLogoDark} from "../../../../common/components/Logo/P24faLogoDark";
import {nimfomaneUtils} from "../../../core/nimfomaneUtils";
import {darkTheme} from "../../../core/darkTheme";
import {ImageErrorIcon} from "../ImageErrorIcon";

// The forum markup does not expose image dimensions, so until the browser has
// decoded the image header we reserve a portrait-ish frame. Once the real size
// is known (and for every later render) the frame matches the image exactly,
// which keeps the modal from jumping around on slow connections.
const DEFAULT_IMAGE_ASPECT_RATIO = 3 / 4;
const IMAGE_MAX_HEIGHT = '80vh';
const IMAGE_SIZE_POLL_INTERVAL_MS = 150;

type ImageSize = {width: number; height: number};
type ImageStatus = 'loading' | 'loaded' | 'error';

const imageSizeCache = new Map<string, ImageSize>();

const EscortImage: FC<{ image: Image }> = ({image}) => {
  const url = nimfomaneUtils.imageFullSize(nimfomaneUtils.normalizeCmsUrl(image.url));
  const [size, setSize] = useState<ImageSize | null>(() => imageSizeCache.get(url) ?? null);
  const [status, setStatus] = useState<ImageStatus>('loading');
  const [isNearViewport, setIsNearViewport] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only poll for dimensions once the lazy-loaded image is about to be
  // requested. Polling every offscreen card would needlessly keep timers alive.
  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setIsNearViewport(true);
        observer.disconnect();
      }
    }, {rootMargin: '200px'});

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const rememberSize = useCallback((element: HTMLImageElement): boolean => {
    const width = element.naturalWidth;
    const height = element.naturalHeight;

    if (!width || !height) {
      return false;
    }

    const previous = imageSizeCache.get(url);
    if (!previous || previous.width !== width || previous.height !== height) {
      const measured = {width, height};
      imageSizeCache.set(url, measured);
      setSize(measured);
    }

    return true;
  }, [url]);

  // A cached image can finish loading before React attaches its `onLoad`
  // handler, which would leave it hidden behind the skeleton forever.
  useEffect(() => {
    const element = imageRef.current;
    if (!element?.complete) {
      return;
    }

    if (element.naturalWidth > 0 && element.naturalHeight > 0) {
      rememberSize(element);
      setStatus('loaded');
    } else {
      setStatus('error');
    }
  }, [rememberSize]);

  // A `load` event only fires once the whole image is downloaded and decoded.
  // The intrinsic dimensions are usually available much earlier (as soon as the
  // header is parsed), so poll for them and resize the placeholder right away.
  useEffect(() => {
    if (!isNearViewport || status !== 'loading' || size) {
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;

    const poll = (): void => {
      const element = imageRef.current;
      if (!cancelled && element && rememberSize(element)) {
        return;
      }

      if (!cancelled) {
        timeoutId = window.setTimeout(poll, IMAGE_SIZE_POLL_INTERVAL_MS);
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isNearViewport, rememberSize, size, status]);

  const handleLoad = (): void => {
    if (imageRef.current) {
      rememberSize(imageRef.current);
    }
    setStatus('loaded');
  };

  const aspectRatio = size ? size.width / size.height : DEFAULT_IMAGE_ASPECT_RATIO;
  const naturalWidth = size ? `${size.width}px` : null;
  const wrapperStyle: CSSProperties = {
    width: naturalWidth
      ? `min(100%, ${naturalWidth}, calc(${IMAGE_MAX_HEIGHT} * ${aspectRatio}))`
      : `min(100%, calc(${IMAGE_MAX_HEIGHT} * ${aspectRatio}))`,
    aspectRatio: `${aspectRatio}`,
  };

  return (
    <div ref={containerRef} data-wwid="escort-image" className={classes.image_container}>
      <div className={classes.image_inner_container}>
        <div className={classes.image_wrapper} style={wrapperStyle}>
          {status === 'loading' && (
            <div
              className={`${classes.image_skeleton} ${isNearViewport ? classes.image_skeleton_visible : ''}`}
              data-wwid="escort-image-skeleton"
            />
          )}
          {status === 'error' && (
            <div className={classes.image_error} data-wwid="escort-image-error">
              <ImageErrorIcon/>
            </div>
          )}
          <img
            ref={imageRef}
            src={url}
            className={`${classes.image} ${status === 'loaded' ? classes.image_loaded : ''}`}
            loading="lazy"
            decoding="async"
            alt={image.date || ''}
            onClick={(event) => event.stopPropagation()}
            onLoad={handleLoad}
            onError={() => setStatus('error')}
          />
          <div className={classes.image_overlay}>
            <div className={classes.image_date}>
              {image.date}
              {image.section && ` · ${image.section}`}
            </div>
            {image.topicUrl && (
              <a
                className={classes.image_topic}
                href={image.topicUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
              >topic &gt;</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export interface EscortImagesProps {
  images: Image[];
  loading: boolean;
  ended: boolean;
  error: string | null;
  isMobile: boolean;
  escortName: string;
  profileUrl: string;
  onClose: MouseEventHandler;
  onLogoClick: () => void;
  containerRef?: Ref<HTMLDivElement>;
}

export const EscortImages: FC<EscortImagesProps> = ({
  images,
  loading,
  ended,
  error,
  isMobile,
  escortName,
  profileUrl,
  onClose,
  onLogoClick,
  containerRef,
}) => {
  const [isDark, setIsDark] = useState(() => darkTheme.isEnabled());
  const LogoComponent = isDark ? P24faLogoDark : P24faLogoLight;

  useEffect(() => darkTheme.onChange(setIsDark), []);

  const headerContent = (
    <div className={classes.header}>
      <div className={classes.headerLeft}>
        <LogoComponent onClick={onLogoClick} className={classes.logo} data-wwid="logo" />
        <a
          className={classes.escortName}
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          data-wwid="escort-image-name"
        >{escortName}</a>
      </div>
      <button type="button" className={classes.closeButton} onClick={onClose} data-wwid="close">
        <CloseIcon />
      </button>
    </div>
  );

  return (
    <div className={classes.container} data-wwid="escort-images">
      {!isMobile && headerContent}
      <div className={classes.content} ref={containerRef}>
        {!images.length && !loading && !error && <div className={classes.noImages}>Nu sunt poze</div>}
        {images.map((image, index) => (
          <EscortImage key={index} image={image} />
        ))}
        {error && (
          <div className={classes.errorWrapper}>
            <ErrorDisplay errorMessage={error} dataWwId="escort-images-error" />
          </div>
        )}
        {ended && images.length > 0 && <div className={classes.endMessage} data-wwid="escort-images-end">final listă poze</div>}
        {loading && <div><Loader classes={classes.loading} /></div>}
        <div className={classes.spacer} />
      </div>
      {isMobile && headerContent}
    </div>
  );
};
