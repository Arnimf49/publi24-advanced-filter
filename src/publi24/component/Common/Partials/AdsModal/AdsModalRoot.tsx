import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {adData, AdData} from "../../../../core/adData";
import AdsModal from "./AdsModal";
import {AdUuid, WWStorage} from "../../../../core/storage";
import GlobalLoader from "../../GlobalLoader/GlobalLoader";
import {modalState} from "../../../../../common/modalState";
import {inspectorEscorteApi, InspectorAd} from "../../../../core/inspectorEscorteApi";
import AdsList from "../AdList/AdsList";
import {renderer} from "../../../../core/renderer";
import {IS_MOBILE_VIEW} from "../../../../../common/globals";

const PAGE_SIZE = 15;

const registerAds = (context: HTMLElement, showDuplicates: boolean) => {
  renderer.registerAdsInContext(context, {renderOptions: {showDuplicates}});
};

type AdsModalRootProps = {
  close: () => void;
  phone: string;
  source?: 'inspector-escorte';
  inspectorAds?: InspectorAd[];
};

const AdsModalRoot: React.FC<AdsModalRootProps> = ({
  close,
  phone,
  source,
  inspectorAds,
}) => {
  const [listState, setListState] = useState<{ads: AdData[], breaks: number[], errors: string[]} | null>(null);
  const [removedNow, setRemovedNow] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pendingUuidsRef = useRef<AdUuid[]>([]);
  const pendingInspectorAdsRef = useRef<InspectorAd[]>([]);
  const totalCountRef = useRef<number>(0);
  const savedScrollRef = useRef<{el: HTMLElement, top: number} | null>(null);

  const clean = useCallback((uuid: string) => {
    WWStorage.removePhoneAd(phone, uuid);
    setRemovedNow((n) => n + 1);
  }, [phone]);

  const loadNextPage = useCallback(async () => {
    const el = document.querySelector('[data-wwid="ads-modal"]') as HTMLElement | null;
    if (el) {
      savedScrollRef.current = {el, top: el.scrollTop};
    }

    setIsLoadingMore(true);
    try {
      let result: {ads: AdData[], errors: string[]};

      if (pendingInspectorAdsRef.current.length > 0) {
        const batch = pendingInspectorAdsRef.current.splice(0, PAGE_SIZE);
        result = await adData.loadInInspectorAdsData(batch, phone, clean);
      } else {
        const batch = pendingUuidsRef.current.splice(0, PAGE_SIZE);
        if (batch.length === 0) {
          return;
        }
        result = await adData.loadInAdsData(batch, clean);
      }

      setListState((prev) => {
        const prevAds = prev?.ads ?? [];
        return {
          ads: [...prevAds, ...result.ads],
          breaks: [...(prev?.breaks ?? []), prevAds.length],
          errors: [...(prev?.errors ?? []), ...result.errors],
        };
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [phone, clean]);

  useEffect(() => {
    const load = async () => {
      const localAds = WWStorage.getPhoneAds(phone);

      if (source === 'inspector-escorte') {
        const allInspectorAds = inspectorAds ?? await adData.fetchInspectorEscorteAds(phone);
        const mergedSources = inspectorEscorteApi.mergeDuplicateSources(allInspectorAds, localAds);

        totalCountRef.current = mergedSources.inspectorAds.length + mergedSources.localOnlyAds.length;
        pendingInspectorAdsRef.current = mergedSources.inspectorAds.slice(PAGE_SIZE);
        pendingUuidsRef.current = mergedSources.localOnlyAds;

        const firstBatch = mergedSources.inspectorAds.slice(0, PAGE_SIZE);
        const {ads: items, errors} = await adData.loadInInspectorAdsData(firstBatch, phone, clean);
        setListState({ads: items, breaks: [], errors});
      } else {
        pendingInspectorAdsRef.current = [];
        pendingUuidsRef.current = localAds.slice(PAGE_SIZE);

        totalCountRef.current = localAds.length;
        const firstBatch = localAds.slice(0, PAGE_SIZE);
        const {ads: items, errors} = await adData.loadInAdsData(firstBatch, clean);
        setListState({ads: items, breaks: [], errors});
      }
    };

    load();
  }, []);

  const cleanupUrl = () => {
    modalState.revertOpen();
  };
  useEffect(() => {
    modalState.pushOpen('ads', {phone});
  }, [phone]);

  const hasPendingMore = pendingInspectorAdsRef.current.length > 0 || pendingUuidsRef.current.length > 0;

  useLayoutEffect(() => {
    if (savedScrollRef.current) {
      const {el, top} = savedScrollRef.current;
      el.scrollTop = top;
      savedScrollRef.current = null;
    }
  }, [listState]);

  const renderAds = useCallback((ads: AdData[], sectionBreaks?: number[]) => (
    <AdsList
      adsData={ads}
      sectionBreaks={sectionBreaks}
      isMobile={IS_MOBILE_VIEW}
      onRegister={registerAds}
    />
  ), []);

  if (listState === null) {
    return <GlobalLoader message={"La 15+ de anunțuri durează mai mult sa încarce, din cauză la limitari de Publi24."}/>;
  }

  return (
    <AdsModal
      phone={phone}
      adsData={listState.ads}
      errors={listState.errors}
      removed={removedNow}
      close={close}
      onCleanup={cleanupUrl}
      source={source}
      totalCount={totalCountRef.current}
      hasMore={hasPendingMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadNextPage}
      sectionBreaks={listState.breaks}
      renderAds={renderAds}
    />
  );
};

export default AdsModalRoot;
