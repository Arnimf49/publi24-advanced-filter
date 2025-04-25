import React, {MouseEventHandler, ReactElement} from 'react';
import styles from './AdPanel.module.scss';
import {VisibilityIcon} from "../Common/Icons/VisibilityIcon";
import {StarIcon} from "../Common/Icons/StarIcon";
import {PhoneIcon} from "../Common/Icons/PhoneIcon";
import {ImageIcon} from "../Common/Icons/ImageIcon";

interface ImageLink {
  link: string;
  isDead?: boolean;
  isSafe?: boolean;
  isSuspicious?: boolean;
}

interface ImageSearchDomain {
  domain: string;
  links: ImageLink[];
}

interface AdPanelProps {
  visible: boolean;
  phone?: string | null;
  isFav: boolean;
  nimfomaneLink?: string | null;
  automaticHideReason?: boolean;
  dueToPhoneHidden?: boolean;
  hideReason?: string | null;
  hasNoPhone: boolean;
  phoneAndTags: ReactElement;
  showDuplicates: boolean;
  hasDuplicateAdsWithSamePhone: boolean;
  numberOfAdsWithSamePhone?: number | string;
  phoneInvestigatedSinceDays?: string | null;
  phoneInvestigateStale?: boolean;
  searchLinks?: string[];
  filteredSearchLinks?: string[];
  imageInvestigatedSinceDays?: string | null;
  imageInvestigateStale?: boolean;
  imageSearchDomains?: ImageSearchDomain[];
  hasImagesInOtherLocation?: boolean;

  onVisibilityClick?: MouseEventHandler;
  onFavClick?: MouseEventHandler;
  onInvestigateClick?: MouseEventHandler;
  onInvestigateImgClick?: MouseEventHandler;
  onViewDuplicatesClick?: MouseEventHandler;
}

const AdPanel: React.FC<AdPanelProps> = (props) => {
  const {
    visible,
    phone,
    isFav,
    nimfomaneLink,
    automaticHideReason,
    dueToPhoneHidden,
    hideReason,
    hasNoPhone,
    phoneAndTags,
    showDuplicates,
    hasDuplicateAdsWithSamePhone,
    numberOfAdsWithSamePhone,
    phoneInvestigatedSinceDays,
    phoneInvestigateStale,
    searchLinks,
    filteredSearchLinks = [],
    imageInvestigatedSinceDays,
    imageInvestigateStale,
    imageSearchDomains,
    hasImagesInOtherLocation,
    onVisibilityClick,
    onFavClick,
    onInvestigateClick,
    onInvestigateImgClick,
    onViewDuplicatesClick,
  } = props;

  const getImageLinkClassName = (link: ImageLink): string => {
    if (link.isDead) return styles.linkDead;
    if (link.isSafe) return styles.linkSafe;
    if (link.isSuspicious) return styles.linkSuspicious;
    return styles.linkUnsafe;
  };

  return (
    <div data-wwphone={phone} data-wwid="control-panel">
      <hr className={styles.hr} />

      <div className={styles.buttons}>
        <button
          title={!visible ? "Ma-m razgândit" : "Ascunde"}
          type="button"
          style={{ backgroundColor: !visible ? '#696969' : '#c59b2f' }}
          className={`${styles.button} ${styles.mainBgRadius} ${styles.toggleButton} mainbg radius`}
          data-wwid="toggle-hidden"
          onClick={onVisibilityClick}
        >
          <VisibilityIcon visible={visible}/>
        </button>

        {phone && (
          <>
            <button
              title={isFav ? "Șterge din favorite" : "Adaugă la favorite"}
              style={{ backgroundColor: isFav ? '#b34c4c' : '#e0dada' }}
              className={`${styles.button} ${styles.favButton} `}
              data-wwstate={isFav ? "on" : "off"}
              data-wwid="fav-toggle"
              onClick={onFavClick}
            >
              <StarIcon
                fill={isFav ? "#fefefe" : "none"}
                stroke={isFav ? "none" : "#333"}
                strokeWidth={2}
              />
            </button>

            <button
              title="Analiza telefon"
              type="button"
              className={`${styles.button} ${styles.mainBgRadius} ${styles.investigateButton} mainbg radius`}
              data-wwid="investigate"
              onClick={onInvestigateClick}
            >
              <PhoneIcon/>
            </button>
            <button
              title="Analiza poze"
              type="button"
              className={`${styles.button} ${styles.mainBgRadius} ${styles.investigateImgButton} mainbg radius`}
              data-wwid="investigate_img"
              onClick={onInvestigateImgClick}
            >
              <ImageIcon/>
            </button>
          </>
        )}

        {nimfomaneLink && (
          <a href={nimfomaneLink} target='_blank' rel="noopener noreferrer" data-wwid="nimfomane-btn" className={styles.nimfomaneLink}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
              <polygon points="2.67 7.63 5.46 10.41 13.33 2.54 14.85 4.06 5.46 13.46 1.15 9.15 2.67 7.63"/>
            </svg>
            <img alt="Nimfomane Logo" src='https://nimfomane.com/forum/uploads/monthly_2024_01/logo2.png.d461ead015b3eddf20bc0a9b70668583.png'/>
          </a>
        )}
      </div>

      {!visible && (
        <>
          {automaticHideReason && (
            <p className={styles.message} data-wwid="message">
              <b>ascuns automat</b> prin setări
            </p>
          )}
          {!automaticHideReason && dueToPhoneHidden && (
            <p className={styles.message} data-wwid="message">
              ai mai ascuns un anunț cu acceeași numar de telefon, <b>ascuns automat</b>
            </p>
          )}
          {hideReason && (
            <p className={styles.message} data-wwid="hide-reason">
              motiv ascundere: <b>{hideReason}</b>
            </p>
          )}
        </>
      )}

      {hasNoPhone && (
        <p className={styles.message} style={{ color: 'rgb(34, 34, 34)' }}>
          anuntul nu are nr telefon
        </p>
      )}

      {!hasNoPhone && phone && (
        <div className={styles.results}>
          {phoneAndTags}

          {showDuplicates && hasDuplicateAdsWithSamePhone && (
            <p data-wwid="duplicates-container" className={styles.duplicatesContainer}>
              <strong data-wwid="duplicates-count">{numberOfAdsWithSamePhone}</strong> anunțuri cu acest telefon <a data-wwid="duplicates" onClick={onViewDuplicatesClick}>(vizualizează)</a>
            </p>
          )}

          {visible && (
            <>
              {/* Phone Search Results */}
              <h5 className={styles.resultsHeader}>
                Rezultate după telefon
                {phoneInvestigatedSinceDays && (
                  <span className={`${styles.investigationStatus} ${phoneInvestigateStale ? styles.stale : styles.fresh}`}>
                    ({phoneInvestigatedSinceDays})
                  </span>
                )}
              </h5>
              <div data-wwid="search-results">
                {searchLinks === undefined ? (
                  <p className={`${styles.noResults} ${styles.noResultsYet}`}>nerulat</p>
                ) : (
                  <>
                    {filteredSearchLinks.length === 0 ? (
                      <p className={`${styles.noResults} ${styles.noResultsFound}`}>nu au fost găsite linkuri relevante</p>
                    ) : (
                      filteredSearchLinks.map((link, index) => (
                        <div key={index} className={styles.searchResultLinkContainer}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link}
                          </a>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>

              <h5 className={styles.resultsHeader}>
                Rezultate după imagine
                {imageInvestigatedSinceDays && (
                  <span className={`${styles.investigationStatus} ${imageInvestigateStale ? styles.stale : styles.fresh}`}>
                      ({imageInvestigatedSinceDays})
                  </span>
                )}
              </h5>
              <div data-wwid="image-results">
                {imageSearchDomains === undefined ? (
                  <p className={`${styles.noResults} ${styles.noResultsYet}`}>nerulat</p>
                ) : (
                  <>
                    {imageSearchDomains.length === 0 ? (
                      <p className={`${styles.noResults} ${styles.noResultsFound}`}>nu au fost găsite linkuri relevante</p>
                    ) : (
                      <>
                        {hasImagesInOtherLocation && (
                          <p className={styles.imagesWarning} data-wwid="images-warning">
                            anunțuri active găsite in alte locații !
                          </p>
                        )}
                        <div className={styles.imageResultsContainer}>
                          {imageSearchDomains.map((domainData) => (
                            <React.Fragment key={domainData.domain}>
                              {domainData.links.map((linkData, index) => (
                                <a
                                  key={`${domainData.domain}-${index}`}
                                  href={linkData.link}
                                  className={`${styles.imageResultLink} ${getImageLinkClassName(linkData)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {index === 0 ? (
                                    domainData.domain
                                  ) : (
                                    <><span className={styles.indexIndicator}>#</span>{index + 1}</>
                                  )}
                                </a>
                              ))}
                            </React.Fragment>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {!hasNoPhone && !phone && (
        <div className={styles.results}>
          <div className={styles.loader} data-wwid="loader"></div>
        </div>
      )}
    </div>
  );
};

export default AdPanel;
