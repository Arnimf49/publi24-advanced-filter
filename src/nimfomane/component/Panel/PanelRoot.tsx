import React, {useCallback, useEffect, useState} from 'react';
import * as ReactDOM from 'react-dom';
import {NimfomaneStorage} from '../../core/storage';
import {Panel} from './Panel';
import HideReasonRoot from './HideReason/HideReasonRoot';

type PanelRootProps = {
  id?: string;
  escortUser?: string;
  container: HTMLElement;
};

export const PanelRoot: React.FC<PanelRootProps> = ({ id, escortUser, container }) => {
  const [_, setRenderCycle] = useState(0);
  const [showHideReason, setShowHideReason] = useState(false);

  const topic = id ? NimfomaneStorage.getTopic(id) : null;
  const effectiveEscortUser = escortUser || (topic?.isOfEscort ? topic.ownerUser : null);
  const isOfEscort = !!effectiveEscortUser;
  const phone = isOfEscort && effectiveEscortUser
    ? NimfomaneStorage.getEscort(effectiveEscortUser).phone
    : topic?.phone;

  const escort = isOfEscort && effectiveEscortUser ? NimfomaneStorage.getEscort(effectiveEscortUser) : null;
  const hidden = isOfEscort ? escort?.hidden : topic?.hidden;
  const hiddenReason = isOfEscort ? escort?.hiddenReason : topic?.hiddenReason;
  const visible = !hidden;
  const isFav = isOfEscort && effectiveEscortUser ? NimfomaneStorage.isFavorite(effectiveEscortUser) : false;

  useEffect(() => {
    const incrementRender = () => setRenderCycle(v => ++v);

    if (id) {
      NimfomaneStorage.onTopicChanged(id, incrementRender);
    }
    if (effectiveEscortUser) {
      NimfomaneStorage.onEscortChanged(effectiveEscortUser, incrementRender);
    }

    return () => {
      if (id) {
        NimfomaneStorage.removeOnTopicChanged(id, incrementRender);
      }
      if (effectiveEscortUser) {
        NimfomaneStorage.removeOnEscortChanged(effectiveEscortUser, incrementRender);
      }
    };
  }, [id, effectiveEscortUser]);

  useEffect(() => {
    const parentContainer = container.getAttribute('data-wwid') === 'escort-card'
      ? container
      : container.closest('[data-wwtopic]') as HTMLElement;
    if (!parentContainer) return;

    const hideReasonContainer = parentContainer.querySelector('[data-wwid="hide-reason-container"]') as HTMLElement;
    const children = Array.from(parentContainer.children) as HTMLElement[];

    children.forEach(child => {
      if (child === hideReasonContainer) return;

      if (visible) {
        child.style.opacity = '1';
        child.style.mixBlendMode = 'normal';
      } else {
        child.style.opacity = '0.5';
        child.style.mixBlendMode = 'luminosity';
      }
    });
  }, [visible, container]);

  const onHideClick = useCallback(() => {
    const newVisible = !visible;

    if (isOfEscort) {
      NimfomaneStorage.setEscortProp(effectiveEscortUser, 'hidden', !newVisible);
      if (newVisible) {
        NimfomaneStorage.setEscortProp(effectiveEscortUser, 'hiddenReason', undefined);
      }
    } else if (id) {
      NimfomaneStorage.setTopicProp(id, 'hidden', !newVisible);
      if (newVisible) {
        NimfomaneStorage.setTopicProp(id, 'hiddenReason', undefined);
      }
    }

    if (!newVisible) {
      setShowHideReason(true);
    }
  }, [visible, isOfEscort, effectiveEscortUser, id]);

  const onHideReasonSelect = useCallback((reasonKey: string) => {
    if (isOfEscort) {
      NimfomaneStorage.setEscortProp(effectiveEscortUser, 'hiddenReason', reasonKey);
    } else if (id) {
      NimfomaneStorage.setTopicProp(id, 'hiddenReason', reasonKey);
    }
  }, [isOfEscort, effectiveEscortUser, id]);

  const onHideReasonCancel = useCallback(() => {
    if (isOfEscort) {
      NimfomaneStorage.setEscortProp(effectiveEscortUser, 'hidden', false);
      NimfomaneStorage.setEscortProp(effectiveEscortUser, 'hiddenReason', undefined);
    } else if (id) {
      NimfomaneStorage.setTopicProp(id, 'hidden', false);
      NimfomaneStorage.setTopicProp(id, 'hiddenReason', undefined);
    }
    setShowHideReason(false);
  }, [isOfEscort, effectiveEscortUser, id]);

  const onHideReasonClose = useCallback(() => {
    setShowHideReason(false);
  }, []);

  const onFavClick = useCallback(() => {
    if (isOfEscort) {
      NimfomaneStorage.toggleFavorite(effectiveEscortUser);
    }
  }, [isOfEscort, effectiveEscortUser]);

  return (
    <>
      <Panel
        phone={phone}
        visible={visible}
        hiddenReason={hiddenReason}
        isEscort={isOfEscort}
        isFav={isFav}
        onHideClick={onHideClick}
        onFavClick={onFavClick}
      />
      {showHideReason && ReactDOM.createPortal(
        <HideReasonRoot
          onReasonSelect={onHideReasonSelect}
          onCancel={onHideReasonCancel}
          onClose={onHideReasonClose}
        />,
        container.querySelector('[data-wwid="hide-reason-container"]') as HTMLElement,
      )}
    </>
  );
};
