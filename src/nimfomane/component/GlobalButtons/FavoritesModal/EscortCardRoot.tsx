import React, {useEffect, useRef, useState} from 'react';
import {NimfomaneStorage} from '../../../core/storage';
import {PanelRoot} from '../../Panel/PanelRoot';
import Modal from '../../../../common/components/Modal/Modal';
import EscortImagesRoot from '../../TopicImage/EscortImages/EscortImagesRoot';
import {NimfomaneMemoryStorage} from '../../../core/memoryStorage';
import {profileActions} from '../../../core/profileActions';
import {dateLib} from '../../../../common/utils/dateLib';
import {IS_MOBILE_VIEW} from '../../../../common/globals';
import {nimfomaneUtils} from '../../../core/nimfomaneUtils';
import {EscortCard} from './EscortCard';

type EscortCardRootProps = {
  user: string;
  index?: number;
};

export const EscortCardRoot: React.FC<EscortCardRootProps> = ({user, index}) => {
  const ref = useRef<HTMLDivElement>(null);
  const escort = NimfomaneStorage.getEscort(user);
  const escortMemoryState = NimfomaneMemoryStorage.getEscortState(user);
  const [isModalOpen, setImageModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [_, setRenderCycle] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const incrementRender = () => setRenderCycle(v => ++v);
    NimfomaneStorage.onEscortChanged(user, incrementRender);
    NimfomaneMemoryStorage.onEscortMemoryChanged(user, incrementRender);

    return () => {
      NimfomaneStorage.removeOnEscortChanged(user, incrementRender);
      NimfomaneMemoryStorage.removeOnEscortMemoryChanged(user, incrementRender);
    };
  }, [user]);

  const profileUrl = escort.profileLink || `https://www.nimfomane.com/forum/profile/${encodeURIComponent(user)}/`;
  const isImageLoading = escort.optimizedProfileImage === undefined && !escortMemoryState.escortAnalysisError;
  const isStatsLoading = !escort.profileStatsTime && !escortMemoryState.profileStatsError;
  const isStatsStale = !escortMemoryState.profileStatsError && profileActions.isProfileStatsStale(user);
  const lastVisitedLabel = escort.profileStats?.lastVisited
    ? dateLib.getRelativeTime(escort.profileStats.lastVisited)
    : null;

  return (
    <EscortCard
      user={user}
      index={index}
      profileUrl={profileUrl}
      containerRef={ref}
      imageUrl={typeof escort.optimizedProfileImage === 'string'
        ? nimfomaneUtils.normalizeCmsUrl(escort.optimizedProfileImage)
        : escort.optimizedProfileImage}
      imageLoading={isImageLoading}
      imageLoadError={escortMemoryState.escortAnalysisError}
      onImageClick={() => setImageModalOpen(true)}
      profileStats={escort.profileStats}
      statsLoading={isStatsLoading}
      statsStale={isStatsStale}
      lastVisitedLabel={lastVisitedLabel}
      panel={mounted && ref.current ? <PanelRoot escortUser={user} container={ref.current} hideReasonLayout="vertical" /> : null}
      imageModal={isModalOpen ? (
        <Modal close={() => setImageModalOpen(false)} mobileContentOverlay dataWwid="escort-image-modal">
          <EscortImagesRoot onClose={() => setImageModalOpen(false)} user={user} isMobile={IS_MOBILE_VIEW} />
        </Modal>
      ) : null}
    />
  );
};

export default EscortCardRoot;
