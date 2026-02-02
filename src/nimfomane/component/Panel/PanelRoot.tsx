import React, {useCallback, useEffect, useState} from 'react';
import * as ReactDOM from 'react-dom';
import {NimfomaneStorage} from '../../core/storage';
import {Panel} from './Panel';
import HideReasonRoot from './HideReason/HideReasonRoot';

type PanelRootProps = {
  id: string;
  container: HTMLElement;
};

export const PanelRoot: React.FC<PanelRootProps> = ({ id, container }) => {
  const [_, setRenderCycle] = useState(0);
  const [showHideReason, setShowHideReason] = useState(false);

  const topic = NimfomaneStorage.getTopic(id);
  const isOfEscort = topic.isOfEscort && topic.ownerUser;
  const phone = isOfEscort
    ? NimfomaneStorage.getEscort(topic.ownerUser!).phone
    : topic.phone;

  const escort = isOfEscort ? NimfomaneStorage.getEscort(topic.ownerUser!) : null;
  const hidden = isOfEscort ? escort?.hidden : topic.hidden;
  const hiddenReason = isOfEscort ? escort?.hiddenReason : topic.hiddenReason;
  const visible = !hidden;

  useEffect(() => {
    const incrementRender = () => setRenderCycle(v => ++v);
    const topic = NimfomaneStorage.getTopic(id);

    NimfomaneStorage.onTopicChanged(id, incrementRender);

    if (topic.ownerUser) {
      NimfomaneStorage.onEscortChanged(topic.ownerUser, incrementRender);
    }

    return () => {
      NimfomaneStorage.removeOnTopicChanged(id, incrementRender);
      if (topic.ownerUser) {
        NimfomaneStorage.removeOnEscortChanged(topic.ownerUser, incrementRender);
      }
    };
  }, [id]);

  useEffect(() => {
    const topicContainer = container.closest('[data-wwtopic]') as HTMLElement;
    if (!topicContainer) return;

    const hideReasonContainer = topicContainer.querySelector('[data-wwid="hide-reason-container"]') as HTMLElement;
    const children = Array.from(topicContainer.children) as HTMLElement[];

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

    if (isOfEscort && topic.ownerUser) {
      NimfomaneStorage.setEscortProp(topic.ownerUser, 'hidden', !newVisible);
      if (newVisible) {
        NimfomaneStorage.setEscortProp(topic.ownerUser, 'hiddenReason', undefined);
      }
    } else {
      NimfomaneStorage.setTopicProp(id, 'hidden', !newVisible);
      if (newVisible) {
        NimfomaneStorage.setTopicProp(id, 'hiddenReason', undefined);
      }
    }

    if (!newVisible) {
      setShowHideReason(true);
    }
  }, [visible, isOfEscort, topic.ownerUser, id]);

  const onHideReasonSelect = useCallback((reasonKey: string) => {
    if (isOfEscort && topic.ownerUser) {
      NimfomaneStorage.setEscortProp(topic.ownerUser, 'hiddenReason', reasonKey);
    } else {
      NimfomaneStorage.setTopicProp(id, 'hiddenReason', reasonKey);
    }
  }, [isOfEscort, topic.ownerUser, id]);

  const onHideReasonCancel = useCallback(() => {
    if (isOfEscort && topic.ownerUser) {
      NimfomaneStorage.setEscortProp(topic.ownerUser, 'hidden', false);
      NimfomaneStorage.setEscortProp(topic.ownerUser, 'hiddenReason', undefined);
    } else {
      NimfomaneStorage.setTopicProp(id, 'hidden', false);
      NimfomaneStorage.setTopicProp(id, 'hiddenReason', undefined);
    }
    setShowHideReason(false);
  }, [isOfEscort, topic.ownerUser, id]);

  const onHideReasonClose = useCallback(() => {
    setShowHideReason(false);
  }, []);

  return (
    <>
      <Panel
        phone={phone}
        visible={visible}
        hiddenReason={hiddenReason}
        onHideClick={onHideClick}
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
