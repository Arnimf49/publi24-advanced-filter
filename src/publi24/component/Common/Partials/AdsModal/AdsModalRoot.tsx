import React, {MouseEventHandler, useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {adData, AdData} from "../../../../core/adData";
import AdsModal from "./AdsModal";
import {AdUuid, WWStorage} from "../../../../core/storage";
import HideReasonRoot from "../HideReason/HideReasonRoot";
import GlobalLoader from "../../GlobalLoader/GlobalLoader";
import {modalState} from "../../../../../common/modalState";
import {InspectorAd} from "../../../../core/inspectorEscorteApi";

const PAGE_SIZE = 15;

type AdsModalRootProps = {
  close: () => void;
  phone: string;
  source?: 'inspector-escorte';
};

const AdsModalRoot: React.FC<AdsModalRootProps> = ({
  close,
  phone,
  source,
}) => {
  const [listState, setListState] = useState<{ads: AdData[], breaks: number[], errors: string[]} | null>(null);
  const [removedNow, setRemovedNow] = useState(0);
  const [showHideReason, setShowHideReason] = useState(false);
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

  const onHideAll: MouseEventHandler = useCallback((e) => {
    e.stopPropagation();

    const duplicateUuids = WWStorage.getPhoneAds(phone);
    duplicateUuids.forEach((adUuid) => {
      WWStorage.setAdVisibility(adUuid.id, false);
    });
    WWStorage.setPhoneHidden(phone);

    setShowHideReason(true);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (source === 'inspector-escorte') {
        const allInspectorAds = await adData.fetchInspectorEscorteAds(phone);

        totalCountRef.current = allInspectorAds.length;
        pendingInspectorAdsRef.current = allInspectorAds.slice(PAGE_SIZE);

        const firstBatch = allInspectorAds.slice(0, PAGE_SIZE);
        const {ads: items, errors} = await adData.loadInInspectorAdsData(firstBatch, phone, clean);
        setListState({ads: items, breaks: [], errors});
      } else {
        const allUuids = WWStorage.getPhoneAds(phone);

        totalCountRef.current = allUuids.length;
        pendingUuidsRef.current = allUuids.slice(PAGE_SIZE);

        const firstBatch = allUuids.slice(0, PAGE_SIZE);
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
      onHideAll={onHideAll}
      onCleanup={cleanupUrl}
      source={source}
      totalCount={totalCountRef.current}
      hasMore={hasPendingMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadNextPage}
      sectionBreaks={listState.breaks}
      hideReasonSelector={showHideReason
        && <HideReasonRoot
          phone={phone}
          onReason={close}
        />}
    />
  );
};

export default AdsModalRoot;
