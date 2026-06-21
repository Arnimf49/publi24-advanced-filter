import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import AdsModal from '../../Common/Partials/AdsModal/AdsModal';
import HideReasonRoot from '../../Common/Partials/HideReason/HideReasonRoot';
import { WWStorage, AdUuid } from '../../../core/storage';
import {AdData, adData} from '../../../core/adData';
import {PhoneIcon} from "../../Common/Icons/PhoneIcon";
import {misc} from "../../../core/misc";
import {inspectorEscorteApi, InspectorAd} from '../../../core/inspectorEscorteApi';

const PAGE_SIZE = 15;

type PhoneSearchRootProps = {
  onClose: () => void;
};

const DEBOUNCE_DELAY = 1500;

const PhoneSearchModalRoot: React.FC<PhoneSearchRootProps> = ({ onClose }) => {
  const [listState, setListState] = useState<{ads: AdData[], breaks: number[], errors: string[]} | null>(null);
  const [searchedPhone, setSearchedPhone] = useState<string | null>(null);
  const [associatedUuids, setAssociatedUuids] = useState<AdUuid[]>([]);
  const [showHideReason, setShowHideReason] = useState<boolean>(false);
  const [source, setSource] = useState<'inspector-escorte' | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pendingUuidsRef = useRef<AdUuid[]>([]);
  const pendingInspectorAdsRef = useRef<InspectorAd[]>([]);
  const totalCountRef = useRef<number>(0);
  const savedScrollRef = useRef<{el: HTMLElement, top: number} | null>(null);

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        result = await adData.loadInInspectorAdsData(batch, searchedPhone!);
      } else {
        const batch = pendingUuidsRef.current.splice(0, PAGE_SIZE);
        if (batch.length === 0) {
          return;
        }
        result = await adData.loadInAdsData(batch);
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
  }, [searchedPhone]);

  const performLocalSearch = useCallback(async (phoneToSearch: string) => {
    setIsLoading(true);
    try {
      const uuids = WWStorage.getPhoneAds(phoneToSearch) || [];
      setAssociatedUuids(uuids);

      totalCountRef.current = uuids.length;
      pendingUuidsRef.current = uuids.slice(PAGE_SIZE);
      const firstBatch = uuids.slice(0, PAGE_SIZE);

      if (firstBatch.length > 0) {
        const {ads: items, errors} = await adData.loadInAdsData(
          firstBatch,
          (uuid: string) => WWStorage.removePhoneAd(phoneToSearch, uuid)
        );
        setListState({ads: items, breaks: [], errors});
      } else {
        setListState({ads: [], breaks: [], errors: []});
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const performSearch = useCallback(async (phoneToSearch: string) => {
    setSearchedPhone(phoneToSearch);
    setIsLoading(true);

    try {
      const enabled = await inspectorEscorteApi.isEnabledAndAvailable();

      if (enabled) {
        const allInspectorAds = await adData.fetchInspectorEscorteAds(phoneToSearch);
        setSource('inspector-escorte');

        const uuids = WWStorage.getPhoneAds(phoneToSearch) || [];
        setAssociatedUuids(uuids);

        totalCountRef.current = allInspectorAds.length;
        pendingInspectorAdsRef.current = allInspectorAds.slice(PAGE_SIZE);
        const firstBatch = allInspectorAds.slice(0, PAGE_SIZE);
        const {ads: items, errors} = await adData.loadInInspectorAdsData(firstBatch, phoneToSearch);
        setListState({ads: items, breaks: [], errors});

        return;
      }

      setSource(undefined);
      await performLocalSearch(phoneToSearch);
    } catch (error) {
      console.error('Failed to search phone ads.', error);
      setSource(undefined);
      setAssociatedUuids([]);
      setListState({ads: [], breaks: [], errors: []});
    } finally {
      setIsLoading(false);
    }
  }, [performLocalSearch]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    setListState(null);
    setSearchedPhone(null);
    setAssociatedUuids([]);
    setSource(undefined);
    pendingUuidsRef.current = [];
    pendingInspectorAdsRef.current = [];
    totalCountRef.current = 0;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (rawValue.trim()) {
      debounceTimeoutRef.current = setTimeout(() => {
        const cleanedPhone = rawValue.replace(/^\+?40/, '0').replace(/\s+/g, '');

        if (cleanedPhone) {
          performSearch(cleanedPhone);
        } else {
          setListState({ads: [], breaks: [], errors: []});
        }
      }, DEBOUNCE_DELAY);
    }
  }, [performSearch]);

  const triggerHideActions = useCallback(() => {
    if (associatedUuids.length && searchedPhone) {
      associatedUuids.forEach((adUuid) => {
        WWStorage.setAdVisibility(adUuid.id, false);
      });
      WWStorage.setPhoneHidden(searchedPhone);
      setShowHideReason(true);
    }
  }, [associatedUuids, searchedPhone, onClose]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (savedScrollRef.current) {
      const {el, top} = savedScrollRef.current;
      el.scrollTop = top;
      savedScrollRef.current = null;
    }
  }, [listState]);

  return (
    <AdsModal
      {...({ source, sourcePhone: source === 'inspector-escorte' ? searchedPhone : undefined } as any)}
      close={onClose}
      adsData={listState?.ads ?? null}
      errors={listState?.errors}
      title={<><PhoneIcon fill={misc.getPubliTheme() === 'dark' ? '#bfbfbf' : '#fff'}/> Anunțuri</>}
      onHideAll={listState?.ads?.length ? triggerHideActions : undefined}
      onInputChange={handleInputChange}
      totalCount={totalCountRef.current || undefined}
      hasMore={pendingUuidsRef.current.length > 0 || pendingInspectorAdsRef.current.length > 0}
      isLoadingMore={isLoadingMore}
      isLoading={isLoading}
      onLoadMore={loadNextPage}
      sectionBreaks={listState?.breaks}
      hideReasonSelector={showHideReason && searchedPhone
        && <HideReasonRoot
          phone={searchedPhone}
          onReason={onClose}
        />
      }
    />
  );
};

export default PhoneSearchModalRoot;
