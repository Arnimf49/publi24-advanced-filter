import React, {FC, useEffect, useState} from "react";
import {TopicImage} from "./TopicImage";
import {NimfomaneStorage} from "../../core/storage";
import {listingActions} from "../../core/listingActions";
import {escortActions} from "../../core/escortActions";
import Modal from "../../../common/components/Modal/Modal";
import {EscortImages} from "./EscortImages/EscortImages";

// @ts-ignore
if (typeof browser === "undefined" && typeof chrome !== "undefined") {
  // @ts-ignore
  var browser = chrome;
}

interface TopicImageRootProps {
  id: string;
  container: HTMLDivElement;
  priority: number;
}

export const TopicImageRoot: FC<TopicImageRootProps> =
({
  id,
  container,
  priority,
}) => {
  const [isModalOpen, setImageModalOpen] = useState(false);
  const [topic, setTopic] = useState(NimfomaneStorage.getTopic(id));
  const [escort, setEscort] = useState(topic?.ownerUser ? NimfomaneStorage.getEscort(topic.ownerUser) : null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    NimfomaneStorage.onTopicChanged(id, setTopic);
    if (topic.isOfEscort && topic?.ownerUser) {
      NimfomaneStorage.onEscortChanged(topic.ownerUser, setEscort);
    }
    return () => {
      NimfomaneStorage.removeOnTopicChanged(id, setTopic);
      if (topic.isOfEscort && topic?.ownerUser) {
        NimfomaneStorage.removeOnEscortChanged(topic.ownerUser, setEscort);
      }
    }
  }, [topic.ownerUser]);

  useEffect(() => {
    if (topic.isOfEscort === undefined
      || (topic.escortDeterminationTime && (Date.now() - topic.escortDeterminationTime) > 8.64e+7 * 6)) {
      listingActions.determineTopicEscort(container, id, priority).catch((error) => {
        console.error(error);
        setLoadError(error?.message || 'Failed to load topic');
      });
    }
    if (!escort && topic.isOfEscort === true && topic.ownerUser) {
      setEscort(NimfomaneStorage.getEscort(topic.ownerUser))
    }
  }, [topic]);

  useEffect(() => {
    if (topic.ownerUser && ((topic.isOfEscort === true && escort?.optimizedProfileImage === undefined)
      || (escort?.optimizedProfileImageTime && (Date.now() - escort.optimizedProfileImageTime) > 8.64e+7 * 4))) {
      escortActions.determineMainProfileImage(topic.ownerUser, priority).catch((error) => {
        console.error(error);
        setLoadError(error?.message || 'Failed to load image');
      });
    }
  }, [topic, escort]);

  const isImageLoading = topic.isOfEscort === undefined ||
    (topic.isOfEscort === true && escort?.optimizedProfileImage === undefined);
  const url = topic.isOfEscort === false
    ? null
    : escort?.optimizedProfileImage;

  return (
    <>
      <TopicImage
        url={url}
        id={id}
        user={topic.ownerUser}
        isLoading={isImageLoading}
        onClick={escort?.optimizedProfileImage ? (() => setImageModalOpen(true)) : undefined}
        loadError={loadError}
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
