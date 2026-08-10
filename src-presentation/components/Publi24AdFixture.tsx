import React from 'react';
import imageUrl from '../../misc/woman_in_dress.png';

type Publi24AdFixtureProps = {
  children: React.ReactNode;
  hideReason?: React.ReactNode;
  isHidden?: boolean;
  articleId?: string;
  imageTransform?: string;
  title?: string;
  description?: string;
  location?: string;
  date?: string;
};

const Publi24AdFixture: React.FC<Publi24AdFixtureProps> = ({
  children,
  hideReason,
  isHidden = false,
  articleId = '438EC272-3F57-4FE2-98A6-58D742A4C1B9',
  imageTransform,
  title = 'Anunț demonstrativ pentru testarea extensiei',
  description = 'Text fictiv folosit pentru a demonstra cum sunt afișate și filtrate informațiile într-o listare obișnuită.',
  location = 'Cluj-Napoca, Cluj',
  date = 'azi 21:20',
}) => {
  return (
    <article
      className="article-item"
      data-articleid={articleId}
      data-phencrypted="demo-phone"
      data-ww-registered="1"
    >
      <div
        className="article-txt-wrap"
        style={{opacity: isHidden ? 0.5 : 1, mixBlendMode: isHidden ? 'luminosity' : 'initial'}}
      >
        <div className="article-txt">
          <div className="article-content-wrap">
            <div className="art-img">
              <a href="#demo-ad" aria-label="Deschide anunțul demonstrativ">
                <img
                  src={imageUrl}
                  alt="Portret demonstrativ"
                  width="200"
                  height="200"
                  style={imageTransform ? {transform: imageTransform} : undefined}
                />
              </a>
              <div className="article-img-count-wrap">
                <span className="article-img-count">
                  <i className="svg-icon svg-icon-article">
                    <svg viewBox="0 0 50 50" aria-hidden="true"><use href="#svg-icon-camera" /></svg>
                  </i>
                  <span className="article-img-count-number">3</span>
                </span>
              </div>
              <span className="article-favorite-icon favorites" data-id="demo-ad">
                <span className="favoriteIcon inactive">
                  <span className="heart-box">
                    <span className="svg-icon icon-heart-inactive">
                      <svg viewBox="0 0 50 50" aria-hidden="true"><use href="#svg-icon-heart" /></svg>
                    </span>
                    <span className="svg-icon icon-heart-active">
                      <svg viewBox="0 0 50 50" aria-hidden="true"><use href="#svg-icon-heart-full" /></svg>
                    </span>
                  </span>
                </span>
              </span>
            </div>

            <div className="article-content">
              <h2 className="article-title">
                <a href="#demo-ad">{title}</a>
              </h2>
              <p className="article-description">
                {description}
              </p>
              <p className="article-short-info article-lbl article-short-info-empty" data-id="demo-ad">
                <span className="article-lbl-txt" />
              </p>
              <p className="article-location">
                <i className="svg-icon svg-icon-article" aria-hidden="true"><svg viewBox="0 0 50 50"><use href="#svg-icon-location" /></svg></i>
                <span>{location}</span>
              </p>
              <p className="article-date">
                <i className="svg-icon svg-icon-article"><svg viewBox="0 0 50 50" aria-hidden="true"><use href="#svg-icon-calendar" /></svg></i>
                <span>{date}</span>
              </p>
              <div className="article-info">
                <a href="#repostare" className="article-lbl article-lbl-reposted">
                  <i className="svg-icon svg-icon-article"><svg viewBox="0 0 50 50" aria-hidden="true"><use href="#svg-icon-arrow-rotate" /></svg></i>
                  <span className="article-lbl-txt">Repostat la fiecare 6 ore</span>
                </a>
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
      <div data-wwid="hide-reason-container">{hideReason}</div>
    </article>
  );
};

export default Publi24AdFixture;
