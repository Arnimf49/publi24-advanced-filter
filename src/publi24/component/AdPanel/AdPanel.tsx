import React, {MouseEventHandler, ReactElement} from 'react';
import styles from './AdPanel.module.scss';
import {VisibilityIcon} from "../Common/Icons/VisibilityIcon";
import {StarIcon} from "../Common/Icons/StarIcon";
import {PhoneIcon} from "../Common/Icons/PhoneIcon";
import {ImageIcon} from "../Common/Icons/ImageIcon";
import {NimfomaneIcon} from "./NimfomaneIcon";
import {DdcIcon} from "./DdcIcon";
import {Loader} from "../../../common/components/Loader/Loader";

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
  ddcLink?: string | null;
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
    ddcLink,
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

  const loading = !hasNoPhone && !phone;
  const hasPhone = !hasNoPhone && phone;

  return (
    <div data-wwphone={phone} data-wwid="control-panel" data-wwhidden={visible ? 'false' : 'true'}>
      <hr className={styles.hr} />

      <div className={styles.buttons}>
        <button
          title={!visible ? "Ma-m razgândit" : "Ascunde"}
          type="button"
          className={`${styles.button} ${visible ? styles.visibilityButtonVisible : styles.visibilityButtonInvisible} radius`}
          data-wwid="toggle-hidden"
          onClick={onVisibilityClick}
        >
          <VisibilityIcon visible={visible}/>
        </button>

        {hasPhone && (
          <button
            title={isFav ? "Șterge din favorite" : "Adaugă la favorite"}
            className={`${styles.button} ${isFav ? styles.favButtonOn : styles.favButtonOff} `}
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
        )}

        {hasPhone && (
          <button
            title="Analiza telefon"
            type="button"
            className={`${styles.button} ${styles.mainBgRadius} ${styles.investigateButton} mainbg radius`}
            data-wwid="investigate"
            onClick={onInvestigateClick}
          >
            <PhoneIcon/>
          </button>
        )}
        <button
          title="Analiza poze"
          type="button"
          className={`${styles.button} ${styles.mainBgRadius} ${styles.investigateImgButton} mainbg radius`}
          data-wwid="investigate_img"
          onClick={onInvestigateImgClick}
        >
          <ImageIcon/>
        </button>

        {nimfomaneLink && (
          <a
            title='Nimfomane topic'
            href={nimfomaneLink}
            target='_blank'
            rel="noopener noreferrer"
            data-wwid="nimfomane-btn"
            className={styles.forumLink}
          >
            <NimfomaneIcon/>
          </a>
        )}

        {ddcLink && (
          <a
            title='Ddc forum topic'
            href={ddcLink}
            target='_blank'
            rel="noopener noreferrer"
            data-wwid="ddc-btn"
            className={`${styles.forumLink} ${styles.ddcLink}`}
          >
            <DdcIcon/>
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
        <p className={styles.message} style={{ color: 'rgb(34, 34, 34)' }} data-wwid="no-phone-message">
          anunțul nu are nr telefon
        </p>
      )}

      <div className={styles.results}>
        {hasPhone && phoneAndTags}

        {hasPhone && showDuplicates && hasDuplicateAdsWithSamePhone && (
          <p data-wwid="duplicates-container" className={styles.duplicatesContainer}>
            <strong data-wwid="duplicates-count">{numberOfAdsWithSamePhone}</strong> anunțuri cu acest telefon <a data-wwid="duplicates" onClick={onViewDuplicatesClick}>(vizualizează)</a>
          </p>
        )}

        {visible && (
          <>
            {hasPhone && (
              <>
                <h5 className={styles.resultsHeader}>
                  Rezultate după telefon
                  {phoneInvestigatedSinceDays && (
                    <span
                      className={`${styles.investigationStatus} ${phoneInvestigateStale ? styles.stale : styles.fresh}`}>
                  &nbsp;({phoneInvestigatedSinceDays})
                </span>
                  )}
                </h5>
                <div data-wwid="search-results">
                  {searchLinks === undefined ? (
                    <p className={`${styles.noResults} ${styles.noResultsYet}`}>nerulat</p>
                  ) : (
                    <>
                      {filteredSearchLinks.length === 0 ? (
                        <p className={`${styles.noResults} ${styles.noResultsFound}`}>nu au fost găsite linkuri
                          relevante</p>
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
              </>
            )}

            {!loading && (
              <>
                <h5 className={styles.resultsHeader}>
                  Rezultate după imagine
                  {imageInvestigatedSinceDays && (
                    <span
                      className={`${styles.investigationStatus} ${imageInvestigateStale ? styles.stale : styles.fresh}`}>
                  &nbsp;({imageInvestigatedSinceDays})
                </span>
                  )}
                </h5>
                <div data-wwid="image-results">
                  {imageSearchDomains === undefined ? (
                    <p className={`${styles.noResults} ${styles.noResultsYet}`}>nerulat</p>
                  ) : (
                    <>
                      {imageSearchDomains.length === 0 ? (
                        <p className={`${styles.noResults} ${styles.noResultsFound}`}>nu au fost găsite linkuri
                          relevante</p>
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
          </>
        )}
      </div>

      {loading && (
        <div className={styles.results}>
          <Loader classes={styles.loader} color={'#17b'}/>
        </div>
      )}
    </div>
  );
};

export default AdPanel;
