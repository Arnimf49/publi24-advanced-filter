import React, {FC, useEffect, useState} from "react";
import {TopicImage} from "./TopicImage";
import {NimfomaneStorage} from "../../core/storage";
import Modal from "../../../common/components/Modal/Modal";
import {EscortImages} from "./EscortImages/EscortImages";
import {NimfomaneMemoryStorage} from "../../core/memoryStorage";

// @ts-ignore
if (typeof browser === "undefined" && typeof chrome !== "undefined") {
  // @ts-ignore
  var browser = chrome;
}

interface TopicImageRootProps {
  id: string;
}

export const TopicImageRoot: FC<TopicImageRootProps> =
({
  id,
}) => {
  const [isModalOpen, setImageModalOpen] = useState(false);
  const [_, setRenderCycle] = useState(0);

  const topic = NimfomaneStorage.getTopic(id);
  const topicMemoryState = NimfomaneMemoryStorage.getTopicState(id);
  const escort = topic?.ownerUser ? NimfomaneStorage.getEscort(topic.ownerUser) : null;
  const escortMemoryState = topic?.ownerUser ? NimfomaneMemoryStorage.getEscortState(topic.ownerUser) : null;

  useEffect(() => {
    const incrementRender = () => setRenderCycle(v => ++v);

    NimfomaneStorage.onTopicChanged(id, incrementRender);
    NimfomaneMemoryStorage.onTopicMemoryChanged(id, incrementRender);

    if (topic.ownerUser) {
      NimfomaneStorage.onEscortChanged(topic.ownerUser, incrementRender);
      NimfomaneMemoryStorage.onEscortMemoryChanged(topic.ownerUser, incrementRender);
    }

    return () => {
      NimfomaneStorage.removeOnTopicChanged(id, incrementRender);
      NimfomaneMemoryStorage.removeOnTopicMemoryChanged(id, incrementRender);
      if (topic.ownerUser) {
        NimfomaneStorage.removeOnEscortChanged(topic.ownerUser, incrementRender);
        NimfomaneMemoryStorage.removeOnEscortMemoryChanged(topic.ownerUser, incrementRender);
      }
    };
  }, [id, topic.ownerUser]);

  const errors = [
    topicMemoryState.topicAnalysisError,
    escortMemoryState?.escortAnalysisError
  ].filter((e): e is string => !!e);

  const loadError = errors.length > 0 ? errors.join(' | ') : null;

  const isImageLoading = !loadError && (topic.isOfEscort === undefined ||
    (topic.isOfEscort && escort?.optimizedProfileImage === undefined) ||
    (!topic.isOfEscort && topic.publiLink === undefined));
  const url = topic.isOfEscort === false
    ? null
    : escort?.optimizedProfileImage;

  return (
    <>
      <TopicImage
        url={url}
        user={topic.ownerUser}
        isLoading={isImageLoading}
        onClick={escort?.optimizedProfileImage ? (() => setImageModalOpen(true)) : undefined}
        loadError={loadError}
        publiLink={topic.publiLink}
      />

      {isModalOpen && topic.ownerUser && (
        <Modal close={() => setImageModalOpen(false)} dataWwid="escort-image-modal">
          <EscortImages
            onClose={() => setImageModalOpen(false)}
            user={topic.ownerUser}
          />
        </Modal>
      )}
    </>
  );
}
