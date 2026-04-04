import React, {FC, useCallback, useState} from "react";
import Modal from "../../../common/components/Modal/Modal";
import {EscortImages} from "../TopicImage/EscortImages/EscortImages";
import {PanelRoot} from "../Panel/PanelRoot";

interface ProfilePanelProps {
  user: string;
  container: HTMLElement;
}

export const ProfilePanel: FC<ProfilePanelProps> = ({user, container}) => {
  const [isModalOpen, setImageModalOpen] = useState(false);

  const onShowImages = useCallback(() => setImageModalOpen(true), []);

  return (
    <>
      <PanelRoot
        escortUser={user}
        container={container}
        hideReasonLayout="horizontal"
        onShowImages={onShowImages}
        fullWidth
      />

      {isModalOpen && (
        <Modal close={() => setImageModalOpen(false)} dataWwid="escort-image-modal">
          <EscortImages
            onClose={() => setImageModalOpen(false)}
            user={user}
          />
        </Modal>
      )}
    </>
  );
};
