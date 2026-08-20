import React, {FC, useCallback, useEffect, useLayoutEffect, useMemo, useState} from "react";
import {escortActions, Image} from "../../../core/escortActions";
import {utils} from "../../../../common/utils";
import {EscortImages} from './EscortImages';

type EscortImagesRootProps = {
  user: string;
  onClose: () => void;
  isMobile: boolean;
};

export const EscortImagesRoot: FC<EscortImagesRootProps> = ({user, onClose, isMobile}) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loadedPages, setLoadedPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const scrollParent = useMemo(
    () => utils.getScrollParent(scrollElement, false),
    [scrollElement],
  );

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

        if (loadedLength === 0 && newImages && newImages.length > 0) {
          escortActions.updatePreviewImage(user, newImages[0].url);
        }

        if (newImages === null) {
          setEnded(true);
          break;
        }

        if (newImages.length > 0) {
          setImages((previous) => [...previous, ...newImages]);
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
  }, [loading, loadedPages, user]);

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

  return (
    <EscortImages
      images={images}
      loading={loading}
      ended={ended}
      error={error}
      isMobile={isMobile}
      onClose={onClose}
      onLogoClick={utils.openExtensionPage}
      containerRef={setScrollElement}
    />
  );
};

export default EscortImagesRoot;
