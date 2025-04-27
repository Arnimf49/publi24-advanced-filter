import React, {useEffect, useRef} from 'react';
import styles from './AdsList.module.scss';
import {AdData} from "../../../../core/adData";
import {renderer} from "../../../../core/renderer";
import {IS_MOBILE_VIEW} from "../../../../core/globals";

type AdsListProps = {
  adsData: AdData[];
  emptyText?: string;
  showDuplicates?: boolean;
};

const CalendarIcon = ({ isHighlighted }: { isHighlighted?: boolean }) => (
  <svg
    className={isHighlighted ? styles.highlightIcon : ''}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
  >
    <path
      d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"></path>
  </svg>
);

const LocationIcon = ({isHighlighted}: { isHighlighted?: boolean }) => (
  <svg
    className={isHighlighted ? styles.highlightIcon : ''}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
  >
    <path
      d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"></path>
  </svg>
);


const AdsList: React.FC<AdsListProps> = ({
  adsData,
  emptyText = 'Niciun anunț găsit pentru acest număr.',
  showDuplicates = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleItemClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (ref.current) {
      renderer.registerAdsInContext(ref.current, {renderOptions: {showDuplicates}});
    }
  }, [showDuplicates]);

  if (!adsData || adsData.length === 0) {
    return <p className={styles.emptyMessage}>{emptyText}</p>;
  }

  return (
    <div ref={ref}>
      {adsData.map((item, index) => (
        <div
          key={item.id}
          className={`${styles.articleItem} article-item`}
          data-articleid={item.id}
          onClick={() => handleItemClick(item.url)}
        >
          <div className={`${styles.articleIndex} ww-article-index`}>
            <span className={styles.indexText}>
              <span className={styles.hash}>#</span>{index + 1}
            </span>
          </div>
          <div className={`${styles.articleTxtWrap} article-txt-wrap`}>
            <div className={`${styles.articleTxt} article-txt`}>
              <div className={`${styles.articleContentWrap} article-content-wrap`}>
                <div className={`${styles.artImg} art-img`}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <img
                      src={item.image || 'https://s3.publi24.ro/vertical-ro-f646bd5a/no_img.gif'}
                      alt={item.title || 'Article image'}
                      width="200"
                      height="200"
                    />
                  </a>
                </div>

                <div className={`${styles.articleContent} article-content`}>
                  <h2 className={`${styles.articleTitle} article-title`}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.title}
                    </a>
                  </h2>
                  <p
                    className={`${styles.articleDescription} article-description`}
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />

                  <div className={`${styles.locationDateContainer} location-date-container`}>
                    <p className={`${styles.articleLocation} article-location`}>
                      <i className={`${styles.svgIconArticle} svg-icon svg-icon-article`}>
                        <LocationIcon isHighlighted={item.isLocationDifferent} />
                      </i>
                      &nbsp;
                      <span className={item.isLocationDifferent ? styles.highlightText : ''}>
                          {item.location}
                        </span>
                    </p>

                    <p className={`${styles.articleDate} article-date`}>
                      <i className={`${styles.svgIconArticle} svg-icon svg-icon-article`}>
                        <CalendarIcon isHighlighted={item.isDateOld} />
                      </i>
                      &nbsp;
                      <span className={item.isDateOld ? styles.highlightText : ''}>
                          {item.date}
                        </span>
                    </p>
                  </div>

                  {!IS_MOBILE_VIEW && item.qrCode && (
                    <div className={`${styles.qrCode}`}>
                      <img
                        src={item.qrCode}
                        title="scaneaza pt telefon"
                        alt="QR Code for mobile"
                        width="85"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdsList;
