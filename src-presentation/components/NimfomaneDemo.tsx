import React, {useEffect, useRef, useState} from 'react';
import type {Image} from '../../src/nimfomane/core/escortActions';
import type {EscortItem} from '../../src/nimfomane/core/storage';
import {Panel} from '../../src/nimfomane/component/Panel/Panel';
import GlobalButtons from '../../src/nimfomane/component/GlobalButtons/GlobalButtons';
import NimfomaneFavoritesModal from '../../src/nimfomane/component/GlobalButtons/FavoritesModal/FavoritesModal';
import {EscortCard} from '../../src/nimfomane/component/GlobalButtons/FavoritesModal/EscortCard';
import {TopicImage} from '../../src/nimfomane/component/TopicImage/TopicImage';
import Modal from '../../src/common/components/Modal/Modal';
import {escortDetailsModal} from '../../src/nimfomane/component/EscortDetailsModal/EscortDetailsModal';
import {EscortImages} from '../../src/nimfomane/component/TopicImage/EscortImages/EscortImages';
import HideReasonRoot from '../../src/nimfomane/component/Panel/HideReason/HideReasonRoot';
import AnimationStatusBar from './AnimationStatusBar';
import DemoMouse from './DemoMouse';
import useDemoVisibility from './useDemoVisibility';
import {presentationAsset} from '../presentationAsset';
import styles from './NimfomaneDemo.module.scss';

export type NimfomaneDemoMode = 'extension' | 'hide' | 'details' | 'images' | 'favorites';

const BIKINI_LINE_ART_IMAGE = presentationAsset.getUrl('nimfomane-demo-bikini-line-art.jpg');
const WOMAN_SILHOUETTE_IMAGE = presentationAsset.getUrl('nimfomane-demo-woman-silhouette.jpg');
const BIKINI_LINE_ART_ALT_IMAGE = presentationAsset.getUrl('nimfomane-demo-bikini-line-art-alt.jpg');
const WOMAN_PORTRAIT_IMAGE = presentationAsset.getUrl('nimfomane-demo-woman-portrait.jpg');
const FORUM_URL = 'https://nimfomane.com/forum/forum/35-escorte-din-cluj/';
const MOCK_ESCORT_DETAILS: EscortItem = {
  profileLink: '#nimfomane-demo-profile',
  phone: '0759961330',
  optimizedProfileImage: WOMAN_SILHOUETTE_IMAGE,
  personalDetails: {age: 27, height: 168, weight: 58},
  personalDetailsSourceUrl: '#nimfomane-demo-source',
  serviceDetails: {
    baseRates: {'30m': 150, '1h': 250, '2h': 450},
    schedule: [{days: 'Luni - Sâmbătă', start: '10:00', end: '22:00'}],
    services: {
      op: true,
      np: true,
      massage: true,
      gfe: {extraCost: 50},
      deepthroat: {extraCost: 100},
      anal: false,
      cim: false,
      cof: true,
      cob: false,
      squirt: true,
      rolePlay: {extraCost: 75},
      couples: false,
      shower: true,
      domination: false,
      dirtyTalk: true,
      goldenShower: false,
    },
  },
  serviceDetailsSourceUrl: '#nimfomane-demo-source',
  escortDetailsTime: Date.now(),
};

type NimfomaneDemoProps = {
  mode: NimfomaneDemoMode;
};

type TopicFixture = {
  id: string;
  rowId: string;
  topicUrl: string;
  titleLinkId: string;
  topicPaginationId: string;
  topicPages: number[];
  topicLastPage?: number;
  user: string;
  authorProfileUrl: string;
  authorHoverTarget: string;
  authorLinkId: string;
  authorStyle: 'struck' | 'highlighted';
  title: string;
  date: string;
  dateTime: string;
  replies: string;
  views: string;
  lastPoster: string;
  lastPosterProfileUrl: string;
  lastPosterHoverTarget: string;
  lastPosterLinkId?: string;
  lastPosterDateTime: string;
  lastPosterDateTitle: string;
  lastPosterDateShort: string;
  lastPosterStyle: 'plain' | 'highlighted';
  isEscort: boolean;
  phone: string;
  image: string;
};

const TOPICS: TopicFixture[] = [
  {
    id: 'nimfomane-demo-dayana',
    rowId: '238561',
    topicUrl: 'https://nimfomane.com/forum/topic/238561-dayana-watzap-0759961330/',
    titleLinkId: 'ips_uid_4209_4',
    topicPaginationId: 'elPagination_235a62d7bbfd38c9365980f9066df992',
    topicPages: [1, 2, 3, 4],
    topicLastPage: 21,
    user: 'daiyana',
    authorProfileUrl: 'https://nimfomane.com/forum/profile/394758-maxanonimus1/',
    authorHoverTarget: 'https://nimfomane.com/forum/profile/394758-maxanonimus1/?do=hovercard&referrer=https%253A%252F%252Fnimfomane.com%252Fforum%252Fforum%252F35-escorte-din-cluj%252F',
    authorLinkId: 'ips_uid_4209_5',
    authorStyle: 'struck',
    title: 'Dayana watzap 0759961330',
    date: '18 noiembrie 2025',
    dateTime: '2025-11-18T19:58:58Z',
    replies: '505',
    views: '279.7k',
    lastPoster: 'daiyana',
    lastPosterProfileUrl: 'https://nimfomane.com/forum/profile/426642-daiyana/',
    lastPosterHoverTarget: 'https://nimfomane.com/forum/profile/426642-daiyana/?do=hovercard',
    lastPosterLinkId: 'ips_uid_4209_7',
    lastPosterDateTime: '2026-08-11T04:24:36Z',
    lastPosterDateTitle: '08/11/2026 07:24  AM',
    lastPosterDateShort: '5 hr',
    lastPosterStyle: 'highlighted',
    isEscort: true,
    phone: '0759961330',
    image: BIKINI_LINE_ART_IMAGE,
  },
  {
    id: 'nimfomane-demo-daria',
    rowId: '231737',
    topicUrl: 'https://nimfomane.com/forum/topic/231737-%F0%9F%92%990734758435-%F0%9F%A9%B5daria%F0%9F%92%9C/',
    titleLinkId: 'ips_uid_4209_9',
    topicPaginationId: 'elPagination_a0b0beaa5d96698359d35a69e3e2f5cd',
    topicPages: [1, 2, 3],
    user: 'escorta17',
    authorProfileUrl: 'https://nimfomane.com/forum/profile/412374-escorta17/',
    authorHoverTarget: 'https://nimfomane.com/forum/profile/412374-escorta17/?do=hovercard&referrer=https%253A%252F%252Fnimfomane.com%252Fforum%252Fforum%252F35-escorte-din-cluj%252F',
    authorLinkId: 'ips_uid_4209_8',
    authorStyle: 'highlighted',
    title: '0734758435 Daria',
    date: '19 martie 2025',
    dateTime: '2025-03-19T17:45:56Z',
    replies: '68',
    views: '106.8k',
    lastPoster: 'inkafan',
    lastPosterProfileUrl: 'https://nimfomane.com/forum/profile/105759-inkafan/',
    lastPosterHoverTarget: 'https://nimfomane.com/forum/profile/105759-inkafan/?do=hovercard',
    lastPosterDateTime: '2026-08-06T08:32:51Z',
    lastPosterDateTitle: '08/06/2026 11:32  AM',
    lastPosterDateShort: '5 dy',
    lastPosterStyle: 'plain',
    isEscort: true,
    phone: '0734758435',
    image: WOMAN_SILHOUETTE_IMAGE,
  },
];

const MODAL_IMAGES: Image[] = [
  {url: WOMAN_SILHOUETTE_IMAGE, date: 'azi, 12:14', topicUrl: '#nimfomane-topic-1'},
  {url: BIKINI_LINE_ART_ALT_IMAGE, date: 'ieri, 18:42', topicUrl: '#nimfomane-topic-2'},
  {url: WOMAN_PORTRAIT_IMAGE, date: '12 august 2025', topicUrl: '#nimfomane-topic-3'},
];

const getTopicUrl = (topic: TopicFixture) => topic.topicUrl;

const DemoEscortCard: React.FC<{
  topic: TopicFixture;
  index: number;
  isFavorite: boolean;
  onFavorite: () => void;
  onDetails: () => void;
}> = ({topic, index, isFavorite, onFavorite, onDetails}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <EscortCard
      user={topic.user}
      index={index}
      profileUrl={getTopicUrl(topic)}
      containerRef={containerRef}
      imageUrl={topic.image}
      imageLoading={false}
      imageLoadError={null}
      profileStats={{
        posts: 72,
        lastVisited: '2026-08-11T04:24:36Z',
        reputation: 'activă',
        currentCity: {name: 'Cluj-Napoca', topicUrl: getTopicUrl(topic)},
      }}
      statsLoading={false}
      statsStale={false}
      lastVisitedLabel="acum 4 ore"
      panel={(
        <Panel
          phone={topic.phone}
          visible={true}
          isEscort={true}
          isFav={isFavorite}
          onHideClick={() => undefined}
          onFavClick={onFavorite}
          onEscortInfoClick={onDetails}
        />
      )}
    />
  );
};

const NimfomaneTopic: React.FC<{
  topic: TopicFixture;
  extensionEnabled: boolean;
  isMobile: boolean;
  visible: boolean;
  isFavorite: boolean;
  onHide: () => void;
  onFavorite: () => void;
  onDetails: () => void;
  onImageClick?: () => void;
  hideReasonOpen: boolean;
  onHideReasonClose: () => void;
  hiddenReason?: string;
  onHideReasonSelect: (reason: string) => void;
}> = ({topic, extensionEnabled, isMobile, visible, isFavorite, onHide, onFavorite, onDetails, onImageClick, hideReasonOpen, onHideReasonClose, hiddenReason, onHideReasonSelect}) => {
  const panel = extensionEnabled && (
    <div className={styles.extensionFeature}>
      <Panel
        phone={topic.phone}
        visible={visible}
        hiddenReason={hiddenReason}
        isEscort={topic.isEscort}
        isFav={isFavorite}
        onHideClick={onHide}
        onFavClick={topic.isEscort ? onFavorite : undefined}
        onEscortInfoClick={topic.isEscort ? onDetails : undefined}
      />
    </div>
  );

  return (
    <li
      className={`ipsDataItem ipsDataItem_responsivePhoto${extensionEnabled ? ' ww_topic_image_registered' : ''}`}
      data-rowid={topic.rowId}
      data-location=""
      data-controller="forums.front.forum.topicRow"
      data-wwtopic={topic.rowId}
      style={{position: 'relative', isolation: visible ? 'initial' : 'isolate', background: visible ? 'initial' : 'white'}}
    >
      {extensionEnabled && (
        <div className={styles.extensionFeature}>
          <div style={{opacity: visible ? 1 : 0.5, mixBlendMode: visible ? 'initial' : 'luminosity'}}>
            <TopicImage url={topic.image} user={topic.user} onClick={onImageClick} />
          </div>
        </div>
      )}
      <div className="ipsDataItem_main" style={{opacity: visible ? 1 : 0.5, mixBlendMode: visible ? 'initial' : 'luminosity'}}>
        <h4 className="ipsDataItem_title ipsContained_container">
        <span><span className="ipsBadge ipsBadge_icon ipsBadge_small ipsBadge_positive" data-ipstooltip="" title="Pinned"><i className="fa fa-thumb-tack" /></span></span>
        <span className="ipsType_break ipsContained">
          <a
            href={getTopicUrl(topic)}
            className=""
            title={`${topic.title} `}
            data-ipshover=""
            data-ipshover-target={`${getTopicUrl(topic)}?preview=1`}
            data-ipshover-timeout="1.5"
            id={topic.titleLinkId}
          >
            <span>{topic.title}</span>
          </a>
        </span>
        <span className="ipsPagination ipsPagination_mini" id={topic.topicPaginationId}>
          {topic.topicPages.map((page) => (
            <span className="ipsPagination_page" key={page}>
              <a data-ipstooltip="" title={`Go to page ${page}`}>{page}</a>
            </span>
          ))}
          {topic.topicLastPage !== undefined && (
            <span className="ipsPagination_last">
              <a data-ipstooltip="" title="Last page">
                {topic.topicLastPage} <i className="fa fa-caret-right" />
              </a>
            </span>
          )}
        </span>
        </h4>
        <span data-role="activeUsers" />
        <div className="ipsDataItem_meta ipsType_reset ipsType_light ipsType_blendLinks">
          <span>
            By{' '}
            <a
              href={topic.authorProfileUrl}
              rel="nofollow"
              data-ipshover=""
              data-ipshover-width="370"
              data-ipshover-target={topic.authorHoverTarget}
              title={`Go to ${topic.user}'s profile`}
              className="ipsType_break"
              id={topic.authorLinkId}
            >
              {topic.authorStyle === 'struck' ? <s>{topic.user}</s> : <b><span style={{color: '#FF0000', fontFamily: 'Tahoma'}}>{topic.user}</span></b>}
            </a>,
          </span>
          <time dateTime={topic.dateTime} title={topic.date} data-short={topic.date}>{topic.date}</time>
        </div>
        {!isMobile && panel}
      </div>
      <ul className="ipsDataItem_stats" style={{opacity: visible ? 1 : 0.5, mixBlendMode: visible ? 'initial' : 'luminosity'}}>
        <li data-stattype="forums_comments">
          <span className="ipsDataItem_stats_number">{topic.replies}</span>
          <span className="ipsDataItem_stats_type"> replies</span>
        </li>
        <li className="ipsType_light" data-stattype="num_views">
          <span className="ipsDataItem_stats_number">{topic.views}</span>
          <span className="ipsDataItem_stats_type"> views</span>
        </li>
      </ul>
      <ul className="ipsDataItem_lastPoster ipsDataItem_withPhoto ipsType_blendLinks" style={{opacity: visible ? 1 : 0.5, mixBlendMode: visible ? 'initial' : 'luminosity'}}>
        <li>
          <a
            href={topic.lastPosterProfileUrl}
            rel="nofollow"
            data-ipshover=""
            data-ipshover-width="370"
            data-ipshover-target={topic.lastPosterHoverTarget}
            className="ipsUserPhoto ipsUserPhoto_tiny"
            title={`Go to ${topic.lastPoster}'s profile`}
          >
            <img src={topic.image} alt={topic.lastPoster} loading="lazy" />
          </a>
        </li>
        <li>
          <a
            href={topic.lastPosterProfileUrl}
            rel="nofollow"
            data-ipshover=""
            data-ipshover-width="370"
            data-ipshover-target={`${topic.lastPosterHoverTarget}&referrer=${encodeURIComponent(encodeURIComponent(FORUM_URL))}`}
            title={`Go to ${topic.lastPoster}'s profile`}
            className="ipsType_break"
            id={topic.lastPosterLinkId}
          >
            {topic.lastPosterStyle === 'highlighted' ? <b><span style={{color: '#FF0000', fontFamily: 'Tahoma'}}>{topic.lastPoster}</span></b> : topic.lastPoster}
          </a>
        </li>
        <li className="ipsType_light"><time dateTime={topic.lastPosterDateTime} title={topic.lastPosterDateTitle} data-short={topic.lastPosterDateShort}>4 hours ago</time></li>
      </ul>
      <div data-wwid="hide-reason-container">
        {hideReasonOpen && (
          <HideReasonRoot
            onReasonSelect={onHideReasonSelect}
            onClose={onHideReasonClose}
          />
        )}
      </div>
      {isMobile && panel}
    </li>
  );
};

const NimfomaneSite: React.FC<{
  mode: NimfomaneDemoMode;
  extensionEnabled: boolean;
  visibleTopics: Record<string, boolean>;
  favoriteTopics: Record<string, boolean>;
  hideReasons: Record<string, string>;
  onHide: (id: string) => void;
  onFavorite: (id: string) => void;
  onHideReasonSelect: (id: string, reason: string) => void;
  onImageClick?: () => void;
  onDetails: () => void;
  favoritesOpen: boolean;
  isMobile: boolean;
  onFavoritesOpen: () => void;
  onFavoritesClose: () => void;
  hideReasonTopicId: string | null;
  onHideReasonClose: () => void;
}> = ({
  mode,
  extensionEnabled,
  visibleTopics,
  favoriteTopics,
  hideReasons,
  onHide,
  onFavorite,
  onHideReasonSelect,
  onImageClick,
  onDetails,
  favoritesOpen,
  isMobile,
  onFavoritesOpen,
  onFavoritesClose,
  hideReasonTopicId,
  onHideReasonClose,
}) => {
  const favoriteUsers = TOPICS.filter((topic) => favoriteTopics[topic.id]).map((topic) => topic.user);

  return (
    <div className={`${styles.site} ipsApp`} dir="ltr">
      <div className={styles.siteHeader}>
         <img className={styles.siteHeaderLogo} src={presentationAsset.getUrl('nimfomane-logo.png')} alt="nimfomane" />
        <span>demo</span>
      </div>
      <div className="ipsLayout_container">
        <div className="ipsLayout_mainArea">
          <div
            className="ipsBox ipsResponsive_pull"
            data-baseurl="https://nimfomane.com/forum/forum/35-escorte-din-cluj/"
            data-resort="listResort"
            data-tableid="topics"
            data-controller="core.global.core.table"
          >
            <h2 className="ipsType_sectionTitle ipsHide ipsType_medium ipsType_reset ipsClear">6,028 topics in this forum</h2>
            <div className="ipsButtonBar ipsPad_half ipsClearfix ipsClear">
               {!isMobile && (
                 <ul className="ipsButtonRow ipsPos_right ipsClearfix">
                   <li>
                     <a id={`elSortByMenu_${mode}`} data-role="sortButton" data-ipsmenu="" data-ipsmenu-activeclass="ipsButtonRow_active" data-ipsmenu-selectable="radio">
                       Sort By <i className="fa fa-caret-down" />
                     </a>
                     <ul className="ipsMenu ipsMenu_auto ipsMenu_withStem ipsMenu_selectable ipsHide" id={`elSortByMenu_${mode}_menu`}>
                       <li className="ipsMenu_item ipsMenu_itemChecked" data-ipsmenuvalue="last_post" data-sortdirection="desc"><a href={`${FORUM_URL}?sortby=last_post&sortdirection=desc`} rel="nofollow">Recently Updated</a></li>
                       <li className="ipsMenu_item" data-ipsmenuvalue="title" data-sortdirection="asc"><a href={`${FORUM_URL}?sortby=title&sortdirection=asc`} rel="nofollow">Title</a></li>
                       <li className="ipsMenu_item" data-ipsmenuvalue="start_date" data-sortdirection="desc"><a href={`${FORUM_URL}?sortby=start_date&sortdirection=desc`} rel="nofollow">Start Date</a></li>
                       <li className="ipsMenu_item" data-ipsmenuvalue="views" data-sortdirection="desc"><a href={`${FORUM_URL}?sortby=views&sortdirection=desc`} rel="nofollow">Most Viewed</a></li>
                       <li className="ipsMenu_item" data-ipsmenuvalue="posts" data-sortdirection="desc"><a href={`${FORUM_URL}?sortby=posts&sortdirection=desc`} rel="nofollow">Most Replies</a></li>
                       <li className="ipsMenu_item" data-noselect="true"><a href={`${FORUM_URL}?advancedSearchForm=1&sortby=forums_topics.last_post&sortdirection=DESC`} rel="nofollow" data-ipsdialog="" data-ipsdialog-title="Custom Sort">Custom</a></li>
                     </ul>
                   </li>
                 </ul>
               )}
              <div data-role="tablePagination">
                <ul className="ipsPagination" id={`elPagination_${mode}`} data-ipspagination-seopagination="true" data-pages="242" data-ipspagination="" data-ipspagination-pages="242" data-ipspagination-perpage="25">
                  <li className="ipsPagination_first ipsPagination_inactive"><a rel="first" data-page="1" data-ipstooltip="" title="First page"><i className="fa fa-angle-double-left" /></a></li>
                  <li className="ipsPagination_prev ipsPagination_inactive"><a rel="prev" data-page="0" data-ipstooltip="" title="Previous page">Prev</a></li>
                  <li className="ipsPagination_page ipsPagination_active"><a data-page="1">1</a></li>
                  <li className="ipsPagination_page"><a data-page="2">2</a></li>
                  <li className="ipsPagination_page"><a data-page="3">3</a></li>
                  <li className="ipsPagination_page"><a data-page="4">4</a></li>
                  <li className="ipsPagination_page"><a data-page="5">5</a></li>
                  <li className="ipsPagination_page"><a data-page="6">6</a></li>
                  <li className="ipsPagination_next"><a rel="next" data-page="2" data-ipstooltip="" title="Next page">Next</a></li>
                  <li className="ipsPagination_last"><a rel="last" data-page="242" data-ipstooltip="" title="Last page"><i className="fa fa-angle-double-right" /></a></li>
                  <li className="ipsPagination_pageJump">
                    <a data-ipsmenu="" data-ipsmenu-closeonclick="false" data-ipsmenu-appendto={`#elPagination_${mode}`} id={`elPagination_${mode}_jump`}>Page 1 of 242 &nbsp;<i className="fa fa-caret-down" /></a>
                    <div className="ipsMenu ipsMenu_narrow ipsPadding ipsHide" id={`elPagination_${mode}_jump_menu`}>
                      <form acceptCharset="utf-8" method="post" action={FORUM_URL} data-role="pageJump" data-baseurl="#">
                        <ul className="ipsForm ipsForm_horizontal">
                          <li className="ipsFieldRow">
                            <input type="number" min="1" max="242" placeholder="Page number" className="ipsField_fullWidth" name="page" />
                          </li>
                          <li className="ipsFieldRow ipsFieldRow_fullWidth">
                            <input type="submit" className="ipsButton_fullWidth ipsButton ipsButton_verySmall ipsButton_primary" value="Go" />
                          </li>
                        </ul>
                      </form>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <ol className="ipsClear ipsDataList cForumTopicTable cTopicList" id={`elTable_${mode}`} data-role="tableRows">
              {TOPICS.map((topic) => (
                <NimfomaneTopic
                  key={topic.id}
                   topic={topic}
                   extensionEnabled={extensionEnabled}
                   isMobile={isMobile}
                   visible={visibleTopics[topic.id] !== false}
                  isFavorite={favoriteTopics[topic.id] === true}
                   onHide={() => onHide(topic.id)}
                   onFavorite={() => onFavorite(topic.id)}
                   onDetails={onDetails}
                   onImageClick={onImageClick}
                   hideReasonOpen={hideReasonTopicId === topic.id}
                   onHideReasonClose={onHideReasonClose}
                   hiddenReason={visibleTopics[topic.id] === false ? hideReasons[topic.id] ?? 'nu mă interesează' : undefined}
                   onHideReasonSelect={(reason) => onHideReasonSelect(topic.id, reason)}
                 />
              ))}
            </ol>
          </div>
        </div>
      </div>
      {extensionEnabled && (
        <div className={`${styles.globalButtonsSlot} ${styles.extensionFeature}`}>
          <GlobalButtons
            favsCount={favoriteUsers.length}
            isMobile={isMobile}
            onLogoClick={() => undefined}
            onFavsClick={onFavoritesOpen}
            onSettingsClick={() => undefined}
            onVersionHistoryClick={() => undefined}
            onFeedbackClick={() => undefined}
            onMenuClick={() => undefined}
            isMenuOpen={false}
            onMenuClose={() => undefined}
            hasNewVersion={false}
            currentVersion="demo"
            isDemo={true}
          />
        </div>
      )}
      {favoritesOpen && (
        <NimfomaneFavoritesModal
          inline={true}
          onClose={onFavoritesClose}
          onClearFavorites={() => undefined}
          favorites={favoriteUsers}
          inLocationEscorts={favoriteUsers}
          otherLocationEscorts={[]}
          inactiveEscorts={[]}
          currentCity="Cluj-Napoca"
          renderEscort={(user, index) => {
            const topic = TOPICS.find((candidate) => candidate.user === user);
            return topic ? <DemoEscortCard topic={topic} index={index} isFavorite={true} onFavorite={() => onFavorite(topic.id)} onDetails={onDetails} /> : null;
          }}
        />
      )}
    </div>
  );
};

type DemoPhase = 'waiting' | 'entering' | 'hovering' | 'clicking' | 'waitingReason' | 'enteringReason' | 'hoveringReason' | 'clickingReason' | 'waitingSubcategory' | 'enteringSubcategory' | 'hoveringSubcategory' | 'clickingSubcategory' | 'waitingClose' | 'enteringClose' | 'hoveringClose' | 'clickingClose' | 'enteringGlobal' | 'hoveringGlobal' | 'clickingGlobal' | 'waitingDetailsScroll' | 'scrolling' | 'showing';

const FAVORITES_MODAL_DURATION = 10000;
const IMAGE_MODAL_SCROLL_OFFSET = 100;
const IMAGE_MODAL_SCROLL_SPEED = 207;
const IMAGE_MODAL_MIN_SCROLL_DURATION = 2200;
const IMAGE_MODAL_POST_SCROLL_DURATION = 3000;
const DETAILS_MODAL_SCROLL_OFFSET = 60;
const DETAILS_MODAL_SCROLL_SPEED = 115;
const DETAILS_MODAL_MIN_SCROLL_DURATION = 2200;

const ANIMATION_DURATION: Record<NimfomaneDemoMode, number> = {
  extension: 30000,
  hide: 11400,
  details: 7600,
  favorites: 14100,
  images: 7800,
};

const NimfomaneDemo: React.FC<NimfomaneDemoProps> = ({mode}) => {
  const [extensionEnabled, setExtensionEnabled] = useState(false);
  const [visibleTopics, setVisibleTopics] = useState<Record<string, boolean>>({});
  const [favoriteTopics, setFavoriteTopics] = useState<Record<string, boolean>>({});
  const [hideReasons, setHideReasons] = useState<Record<string, string>>({});
  const [hideReasonTopicId, setHideReasonTopicId] = useState<string | null>(null);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches);
  const [phase, setPhase] = useState<DemoPhase>('waiting');
  const [pointerPosition, setPointerPosition] = useState({x: -40, y: 100});
  const [animationCycle, setAnimationCycle] = useState(0);
  const [playRequested, setPlayRequested] = useState(false);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const isDemoActive = useDemoVisibility(stageRef, 3000, playRequested, () => {
    setExtensionEnabled(false);
    setVisibleTopics({});
    setFavoriteTopics({});
    setHideReasons({});
    setHideReasonTopicId(null);
    setFavoritesOpen(false);
    setImageModalOpen(false);
    setDetailsOpen(false);
    setDetailsLoading(false);
    setPointerPosition({x: -40, y: 100});
    setPhase('waiting');
    setAnimationCycle((current) => current + 1);
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 800px)');
    const handleViewportChange = () => setIsMobile(mediaQuery.matches);

    handleViewportChange();
    mediaQuery.addEventListener('change', handleViewportChange);

    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    let timeout: number | undefined;
    let animationFrame: number | undefined;

    if (!isDemoActive || isAnimationPaused || !stage) {
      return;
    }

    const findElement = (selector: string, text?: string) => {
      const elements = Array.from(stage.querySelectorAll<HTMLElement>(selector));
      return text ? elements.find((candidate) => candidate.textContent?.trim() === text) : elements[0];
    };
    const movePointerTo = (selector: string, text?: string) => {
      const element = findElement(selector, text);
      if (!element) {
        return false;
      }

      const stageBounds = stage.getBoundingClientRect();
      const elementBounds = element.getBoundingClientRect();
      setPointerPosition({
        x: elementBounds.left - stageBounds.left + elementBounds.width / 2,
        y: elementBounds.top - stageBounds.top + elementBounds.height / 2,
      });
      return true;
    };
    const clickElement = (selector: string, text?: string) => {
      const element = findElement(selector, text);
      if (!element) {
        return false;
      }

      element.setAttribute('data-demo-clicking', 'true');
      window.setTimeout(() => element.removeAttribute('data-demo-clicking'), 360);
      element.click();
      return true;
    };
    const restart = () => {
      setExtensionEnabled(false);
      setVisibleTopics({});
      setFavoriteTopics({});
      setHideReasons({});
      setHideReasonTopicId(null);
      setFavoritesOpen(false);
      setImageModalOpen(false);
      setDetailsOpen(false);
      setDetailsLoading(false);
      setPointerPosition({x: -40, y: 100});
      setAnimationCycle((current) => current + 1);
      setPhase('waiting');
    };

    switch (phase) {
      case 'waiting': {
        const selector = mode === 'extension'
          ? '[data-demo-state="enabled"]'
          : mode === 'images'
            ? '[data-wwid="topic-image"]'
            : mode === 'details'
              ? '[data-wwid="escort-info-button"]'
            : mode === 'favorites'
              ? '[data-wwid="fav-toggle"]'
              : '[data-wwid="toggle-hidden"]';
        timeout = window.setTimeout(() => {
          if (movePointerTo(selector)) {
            setPhase('entering');
          }
        }, mode === 'extension' ? 400 : 700);
        break;
      }
      case 'entering':
        timeout = window.setTimeout(() => setPhase('hovering'), mode === 'extension' ? 500 : 900);
        break;
      case 'hovering':
        timeout = window.setTimeout(() => setPhase('clicking'), mode === 'extension' ? 800 : 700);
        break;
      case 'clicking':
        timeout = window.setTimeout(() => {
          if (!clickElement(mode === 'extension' ? '[data-demo-state="enabled"]' : mode === 'images' ? '[data-wwid="topic-image"]' : mode === 'details' ? '[data-wwid="escort-info-button"]' : mode === 'favorites' ? '[data-wwid="fav-toggle"]' : '[data-wwid="toggle-hidden"]')) {
            return;
          }

          if (mode === 'extension') {
            setExtensionEnabled(true);
            setPhase('showing');
          }
          else if (mode === 'hide') {
            setVisibleTopics((current) => ({...current, [TOPICS[0].id]: false}));
            setHideReasonTopicId(TOPICS[0].id);
            setPhase('waitingReason');
          }
          else if (mode === 'favorites') {
            setFavoriteTopics((current) => ({...current, [TOPICS[0].id]: true}));
            setPhase('enteringGlobal');
          }
          else if (mode === 'details') {
            setDetailsOpen(true);
            setDetailsLoading(true);
            setPhase('showing');
          }
          else {
            setPhase('scrolling');
          }
        }, 300);
        break;
      case 'waitingReason':
        timeout = window.setTimeout(() => {
          if (movePointerTo('[data-wwid="reason"]', 'aspect')) {
            setPhase('enteringReason');
          }
        }, 150);
        break;
      case 'enteringReason':
        timeout = window.setTimeout(() => setPhase('hoveringReason'), 900);
        break;
      case 'hoveringReason':
        timeout = window.setTimeout(() => setPhase('clickingReason'), 750);
        break;
      case 'clickingReason':
        timeout = window.setTimeout(() => {
          if (clickElement('[data-wwid="reason"]', 'aspect')) {
            setPhase('waitingSubcategory');
          }
        }, 300);
        break;
      case 'waitingSubcategory':
        timeout = window.setTimeout(() => {
          if (movePointerTo('[data-wwid="subcategory"]', 'chip')) {
            setPhase('enteringSubcategory');
          }
        }, 150);
        break;
      case 'enteringSubcategory':
        timeout = window.setTimeout(() => setPhase('hoveringSubcategory'), 900);
        break;
      case 'hoveringSubcategory':
        timeout = window.setTimeout(() => setPhase('clickingSubcategory'), 750);
        break;
      case 'clickingSubcategory':
        timeout = window.setTimeout(() => {
          if (clickElement('[data-wwid="subcategory"]', 'chip')) {
            setPhase('waitingClose');
          }
        }, 300);
        break;
      case 'waitingClose':
        timeout = window.setTimeout(() => setPhase('enteringClose'), 1000);
        break;
      case 'enteringClose':
        timeout = window.setTimeout(() => {
          if (movePointerTo('[data-wwid="close-hide-reason"]')) {
            setPhase('hoveringClose');
          }
        }, 150);
        break;
      case 'hoveringClose':
        timeout = window.setTimeout(() => setPhase('clickingClose'), 750);
        break;
      case 'clickingClose':
        timeout = window.setTimeout(() => {
          if (clickElement('[data-wwid="close-hide-reason"]')) {
            setHideReasonTopicId(null);
            setPhase('showing');
          }
        }, 300);
        break;
      case 'enteringGlobal':
        timeout = window.setTimeout(() => {
          if (movePointerTo('[data-wwid="favs-button"]')) {
            setPhase('hoveringGlobal');
          }
        }, 500);
        break;
      case 'hoveringGlobal':
        timeout = window.setTimeout(() => setPhase('clickingGlobal'), 700);
        break;
      case 'clickingGlobal':
        timeout = window.setTimeout(() => {
          if (clickElement('[data-wwid="favs-button"]')) {
            setFavoritesOpen(true);
            setPhase('showing');
          }
        }, 300);
        break;
      case 'waitingDetailsScroll':
        timeout = window.setTimeout(() => setPhase('scrolling'), 2000);
        break;
      case 'scrolling': {
        const modal = findElement(mode === 'details'
          ? '[data-wwid="escort-details-modal"]'
          : '[data-wwid="escort-image-modal"]');
        if (!modal) {
          break;
        }

        const scrollOffset = mode === 'details' ? DETAILS_MODAL_SCROLL_OFFSET : IMAGE_MODAL_SCROLL_OFFSET;
        const scrollSpeed = mode === 'details' ? DETAILS_MODAL_SCROLL_SPEED : IMAGE_MODAL_SCROLL_SPEED;
        const minimumDuration = mode === 'details' ? DETAILS_MODAL_MIN_SCROLL_DURATION : IMAGE_MODAL_MIN_SCROLL_DURATION;
        const maxScroll = Math.max(0, modal.scrollHeight - modal.clientHeight - scrollOffset);
        if (maxScroll <= 0) {
          setPhase('showing');
          break;
        }

        modal.scrollTop = 0;
        const startedAt = performance.now();
        const duration = Math.max(minimumDuration, maxScroll / scrollSpeed * 1000);
        const animateScroll = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const easedProgress = progress * progress * (3 - 2 * progress);
          modal.scrollTop = maxScroll * easedProgress;

          if (progress >= 1) {
            animationFrame = undefined;
            setPhase('showing');
            return;
          }

          animationFrame = window.requestAnimationFrame(animateScroll);
        };

        animationFrame = window.requestAnimationFrame(animateScroll);
        break;
      }
      case 'showing':
        timeout = window.setTimeout(
          restart,
          mode === 'extension'
            ? 30000
            : mode === 'favorites'
              ? FAVORITES_MODAL_DURATION
              : mode === 'images'
                ? IMAGE_MODAL_POST_SCROLL_DURATION
                : mode === 'details'
                  ? 5000
                : 2400,
        );
        break;
    }

    return () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [mode, phase, animationCycle, extensionEnabled, isDemoActive, isAnimationPaused]);

  const reset = () => {
    setExtensionEnabled(false);
    setVisibleTopics({});
    setFavoriteTopics({});
    setHideReasons({});
    setHideReasonTopicId(null);
    setFavoritesOpen(false);
    setImageModalOpen(false);
    setPointerPosition({x: -40, y: 100});
    setPlayRequested(true);
    setIsAnimationPaused(false);
    setAnimationCycle((current) => current + 1);
    setPhase('waiting');
  };

  const pointerIsClicking = phase === 'clicking'
    || phase === 'clickingReason'
    || phase === 'clickingSubcategory'
    || phase === 'clickingClose'
    || phase === 'clickingGlobal';

  useEffect(() => {
    if (!detailsOpen || !detailsLoading) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setDetailsLoading(false);
      if (mode === 'details') {
        setPhase('waitingDetailsScroll');
      }
    }, 2500);
    return () => window.clearTimeout(timeout);
  }, [detailsOpen, detailsLoading, mode]);

  const openDetails = () => {
    setDetailsOpen(true);
    setDetailsLoading(true);
  };

  return (
    <div className={`${styles.demo}${isMobile ? ' onMobile' : ''}`} ref={stageRef}>
      {mode === 'extension' && (
        <div className={styles.stateSwitch} role="group" aria-label="Starea extensiei">
          <button type="button" className={!extensionEnabled ? styles.stateActive : ''} onClick={() => setExtensionEnabled(false)} aria-pressed={!extensionEnabled} data-demo-state="disabled">Normal</button>
          <button type="button" className={extensionEnabled ? styles.stateActive : ''} onClick={() => setExtensionEnabled(true)} aria-pressed={extensionEnabled} data-demo-state="enabled">Cu extensie</button>
        </div>
      )}
      <AnimationStatusBar
        duration={mode === 'extension' && !extensionEnabled ? 2000 : ANIMATION_DURATION[mode]}
        resetKey={`${mode}-${extensionEnabled ? 'enabled' : 'disabled'}-${animationCycle}`}
        isPaused={!isDemoActive}
        onPlay={() => {
          setPlayRequested(true);
          setIsAnimationPaused(false);
        }}
        onPauseChange={setIsAnimationPaused}
        onRestart={reset}
      />
      <div className={`${styles.viewport}${isDemoActive && !isAnimationPaused ? ` ${styles.mobileScrollThrough}` : ''}`}>
        <NimfomaneSite
          mode={mode}
           extensionEnabled={mode !== 'extension' || extensionEnabled}
           visibleTopics={visibleTopics}
           favoriteTopics={favoriteTopics}
           hideReasons={hideReasons}
           onHide={(id) => {
             setVisibleTopics((current) => ({...current, [id]: current[id] === false}));
             if (mode === 'hide') {
               setHideReasonTopicId(id);
             }
           }}
           onFavorite={(id) => setFavoriteTopics((current) => ({...current, [id]: !current[id]}))}
           onHideReasonSelect={(id, reason) => setHideReasons((current) => ({...current, [id]: reason}))}
          onImageClick={mode === 'images' ? () => setImageModalOpen(true) : undefined}
          onDetails={openDetails}
          favoritesOpen={favoritesOpen}
          isMobile={isMobile}
           onFavoritesOpen={() => setFavoritesOpen(true)}
           onFavoritesClose={() => setFavoritesOpen(false)}
           hideReasonTopicId={hideReasonTopicId}
           onHideReasonClose={() => setHideReasonTopicId(null)}
         />
        {imageModalOpen && (
          <Modal inline scroll={true} close={() => setImageModalOpen(false)} dataWwid="escort-image-modal">
            <EscortImages
              images={MODAL_IMAGES}
              loading={false}
              ended={true}
              error={null}
              onClose={() => setImageModalOpen(false)}
              onLogoClick={() => undefined}
              isMobile={isMobile}
            />
          </Modal>
        )}
        {detailsOpen && (() => {
          const {EscortDetailsModal} = escortDetailsModal;
          return (
            <EscortDetailsModal
              user={TOPICS[0].user}
              escort={detailsLoading
                ? {
                  ...MOCK_ESCORT_DETAILS,
                  personalDetails: undefined,
                  serviceDetails: undefined,
                  escortDetailsTime: undefined,
                }
                : MOCK_ESCORT_DETAILS}
              isLoading={detailsLoading}
              error={null}
              onRefresh={() => setDetailsLoading(true)}
              onClose={() => setDetailsOpen(false)}
              inline={true}
            />
          );
        })()}
      </div>
      {mode !== 'extension' && <DemoMouse x={pointerPosition.x} y={pointerPosition.y} isClicking={pointerIsClicking} />}
    </div>
  );
};

export default NimfomaneDemo;
