import React, {useEffect, useState} from 'react';
import {Loader} from '../../../common/components/Loader/Loader';
import {NoImageIcon} from '../TopicImage/NoImageIcon';
import {ImageErrorIcon} from '../TopicImage/ImageErrorIcon';
import styles from './EscortProfileImage.module.scss';

type EscortProfileImageProps = {
  user: string;
  imageUrl?: string | null;
  imageLoading: boolean;
  imageLoadError?: string | null;
  variant?: 'card' | 'details';
  onClick?: () => void;
};

const EscortProfileImage: React.FC<EscortProfileImageProps> = ({
  user,
  imageUrl,
  imageLoading,
  imageLoadError,
  variant = 'card',
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const showImage = typeof imageUrl === 'string' && !imageError && !imageLoadError;
  const showNoImage = imageUrl === null && !imageLoadError;
  const showError = imageError || !!imageLoadError;
  const className = `${styles.imageSection} ${variant === 'details' ? styles.detailsImageSection : ''}`;

  return (
    <div
      className={className}
      data-wwid={variant === 'card' ? 'escort-card-image-section' : 'escort-details-image-section'}
    >
      {imageLoading && <Loader color="#555" />}
      {showImage && (
        <img
          src={imageUrl}
          alt={user}
          className={`${styles.profileImage} ${onClick ? styles.clickable : ''}`}
          onClick={onClick}
          onError={() => setImageError(true)}
          data-wwid="escort-card-image"
        />
      )}
      {showNoImage && <NoImageIcon />}
      {showError && <ImageErrorIcon />}
    </div>
  );
};

export const escortProfileImage = {
  EscortProfileImage,
};
