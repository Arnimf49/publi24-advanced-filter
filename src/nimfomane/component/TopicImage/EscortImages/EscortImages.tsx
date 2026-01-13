import React, {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {escortActions, Image} from "../../../core/escortActions";
import classes from './EscortImages.module.scss';
import {CloseIcon} from "../../../../publi24/component/Common/Icons/CloseIcon";
import {utils} from "../../../../common/utils";
import {Loader} from "../../../../common/components/Loader/Loader";
import ErrorDisplay from "../../ErrorDisplay/ErrorDisplay";
import {IS_MOBILE_VIEW} from "../../../../common/globals";
import {P24faLogoLight} from "../../../../common/components/Logo/P24faLogoLight";

// @ts-ignore
if (typeof browser === "undefined" && typeof chrome !== "undefined") {
  // @ts-ignore
  var browser = chrome;
}

interface EscortImagesProps {
  user: string;
  onClose: MouseEventHandler;
}

export const EscortImages: FC<EscortImagesProps> = ({ user, onClose }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loadedPages, setLoadedPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const scrollParent = useMemo(() => utils.getScrollParent(ref.current, false) as HTMLDivElement, [ref.current])

  const loadMoreImages = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    let currentPage = loadedPages;
    let loadedLength = 0;

    try {
      while (loadedLength < 5) {
        const newImages = await escortActions.loadImages(user, currentPage, 200);

        if (newImages === null) {
          setEnded(true);
          break;
        } else if (newImages.length > 0) {
          setImages(prev => [...prev, ...newImages]);
          currentPage += 1;
          setLoadedPages(currentPage);
          loadedLength += newImages.length;
        } else {
          currentPage += 1;
        }
      }
    } catch (err: any) {
      console.error("Image load failed", err);
      setError(err?.message + '. Code: ' + err?.code);
    } finally {
      setLoading(false);
    }
  }, [loading, loadedPages, user]);

  const handleScroll = useCallback(() => {
    const el = scrollParent;
    if (!el) return;

    if (el.scrollHeight - el.scrollTop <= el.clientHeight * 3) {
      loadMoreImages();
    }
  }, [scrollParent, loadMoreImages]);

  useEffect(() => {
    loadMoreImages();
  }, []);

  useLayoutEffect(() => {
    if (ended) {
      return () => {};
    }

    scrollParent.addEventListener("scroll", handleScroll);
    return () => scrollParent.removeEventListener("scroll", handleScroll);
  }, [scrollParent, handleScroll, ended]);

  const headerContent = (
    <div className={classes.header}>
      <P24faLogoLight
        onClick={utils.openExtensionPage}
        className={classes.logo}
        data-wwid="logo"
      />

      <button
        type="button"
        className={classes.closeButton}
        onClick={onClose}
        data-wwid="close"
      >
        <CloseIcon />
      </button>
    </div>
  );

  return (
    <div
      className={classes.container}
      ref={ref}
      data-wwid="escort-images"
    >
      {!IS_MOBILE_VIEW && headerContent}

      <div className={classes.content}>
        {!images.length && !loading && !error &&
          <div className={classes.noImages}>Nu sunt poze</div>
        }

        {images.map((image, index) => (
          <div key={index} data-wwid={'escort-image'} className={classes.image_container}>
            <div className={classes.image_inner_container}>
              <img src={image.url} loading='lazy' onClick={(e) => e.stopPropagation()} />
              <div className={classes.image_date}>{image.date}</div>
            </div>
          </div>
        ))}

        {error && (
          <div className={classes.errorWrapper}>
            <ErrorDisplay errorMessage={error} dataWwId="escort-images-error" />
          </div>
        )}

        {loading && <div>
          <Loader classes={classes.loading}/>
        </div>}

        <div className={classes.spacer} />
      </div>

      {IS_MOBILE_VIEW && headerContent}
    </div>
  );
};
