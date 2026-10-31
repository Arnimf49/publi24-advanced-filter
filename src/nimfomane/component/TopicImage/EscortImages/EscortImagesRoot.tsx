import React, {FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {escortActions, Image} from "../../../core/escortActions";
import {NimfomaneStorage} from "../../../core/storage";
import {utils} from "../../../../common/utils";
import {EscortImages} from './EscortImages';

type EscortImagesRootProps = {
  user: string;
  onClose: () => void;
  isMobile: boolean;
};

// Rendering an image triggers a network request (lazy images start loading as
// soon as they enter the viewport). Keep the request burst below Cloudflare's
// per-IP rate limit while still loading fast during normal browsing.
const IMAGE_RENDER_WINDOW_MS = 10_000;
const IMAGE_RENDER_LIMIT = 50;

export const EscortImagesRoot: FC<EscortImagesRootProps> = ({user, onClose, isMobile}) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loadedPages, setLoadedPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const renderedAt = useRef<number[]>([]);
  const scrollParent = useMemo(
    () => utils.getScrollParent(scrollElement, false),
    [scrollElement],
  );

  const pruneRenderWindow = useCallback(() => {
    const cutoff = Date.now() - IMAGE_RENDER_WINDOW_MS;
    renderedAt.current = renderedAt.current.filter(timestamp => timestamp > cutoff);
  }, []);

  const markRendered = useCallback((imageCount: number) => {
    const now = Date.now();
    for (let index = 0; index < imageCount; index++) {
      renderedAt.current.push(now);
    }
  }, []);

  const appendImagesWithThrottle = useCallback(async (newImages: Image[]) => {
    let offset = 0;

    while (offset < newImages.length) {
      pruneRenderWindow();
      const availableSlots = Math.max(0, IMAGE_RENDER_LIMIT - renderedAt.current.length);

      if (availableSlots === 0) {
        // The loader remains visible while the next batch waits for the
        // window to free up.
        const waitUntil = renderedAt.current[0] + IMAGE_RENDER_WINDOW_MS - Date.now();
        await new Promise(resolve => setTimeout(resolve, Math.max(50, waitUntil + 25)));
        continue;
      }

      const chunk = newImages.slice(offset, offset + availableSlots);
      setImages((previous) => [...previous, ...chunk]);
      markRendered(chunk.length);
      offset += chunk.length;
    }
  }, [pruneRenderWindow, markRendered]);

  const loadMoreImages = useCallback(async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    let currentPage = loadedPages;
    let loadedLength = 0;

    try {
      while (loadedLength < 5) {
        const newImages = await escortActions.loadImages(user, currentPage, 200);

        if (loadedPages === 0 && loadedLength === 0 && newImages && newImages.length > 0) {
          escortActions.updatePreviewImage(user, newImages[0].url);
        }

        if (newImages === null) {
          setEnded(true);
          break;
        }

        if (newImages.length > 0) {
          await appendImagesWithThrottle(newImages);
          currentPage += 1;
          setLoadedPages(currentPage);
          loadedLength += newImages.length;
        } else {
          currentPage += 1;
        }
      }
    } catch (err: any) {
      console.error('Image load failed', err);
      setError(err?.message + '. Code: ' + err?.code);
    } finally {
      setLoading(false);
    }
  }, [loading, loadedPages, user, appendImagesWithThrottle]);

  const handleScroll = useCallback(() => {
    if (!(scrollParent instanceof HTMLElement)) {
      return;
    }

    if (scrollParent.scrollHeight - scrollParent.scrollTop <= scrollParent.clientHeight * 3) {
      loadMoreImages();
    }
  }, [loadMoreImages, scrollParent]);

  useEffect(() => {
    loadMoreImages();
  }, []);

  useLayoutEffect(() => {
    if (ended) {
      return () => {};
    }

    if (!(scrollParent instanceof HTMLElement)) {
      return;
    }

    scrollParent.addEventListener('scroll', handleScroll);
    return () => scrollParent.removeEventListener('scroll', handleScroll);
  }, [ended, handleScroll, scrollParent]);

  const escort = NimfomaneStorage.getEscort(user);
  const profileUrl = escort.profileLink
    || `https://nimfomane.com/forum/profile/${encodeURIComponent(user)}/`;

  return (
    <EscortImages
      images={images}
      loading={loading}
      ended={ended}
      error={error}
      isMobile={isMobile}
      escortName={user}
      profileUrl={profileUrl}
      onClose={onClose}
      onLogoClick={utils.openExtensionPage}
      containerRef={setScrollElement}
    />
  );
};

export default EscortImagesRoot;
