import React, {FC, useState} from "react";
import Modal from "../../../common/components/Modal/Modal";
import {EscortImages} from "../TopicImage/EscortImages/EscortImages";
import classes from './ProfileImages.module.scss'

// @ts-ignore
if (typeof browser === "undefined" && typeof chrome !== "undefined") {
  // @ts-ignore
  var browser = chrome;
}

interface ProfileImagesProps {
  user: string;
}

export const ProfileImages: FC<ProfileImagesProps> =
  ({user}) => {
    const [isModalOpen, setImageModalOpen] = useState(false);

    return (
      <>
        <button
          className={classes.button}
          onClick={() => setImageModalOpen(true)}
          data-wwid="all-photos-button"
        >
          Arată toate pozele
        </button>

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
  }
