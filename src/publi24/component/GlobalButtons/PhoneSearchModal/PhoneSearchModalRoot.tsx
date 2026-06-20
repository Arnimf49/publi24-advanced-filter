import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdsModal from '../../Common/Partials/AdsModal/AdsModal';
import HideReasonRoot from '../../Common/Partials/HideReason/HideReasonRoot';
import { WWStorage, AdUuid } from '../../../core/storage';
import {AdData, adData} from '../../../core/adData';
import {PhoneIcon} from "../../Common/Icons/PhoneIcon";
import {misc} from "../../../core/misc";
import {inspectorEscorteApi} from '../../../core/inspectorEscorteApi';

type PhoneSearchRootProps = {
  onClose: () => void;
};

const DEBOUNCE_DELAY = 1500;

const PhoneSearchModalRoot: React.FC<PhoneSearchRootProps> = ({ onClose }) => {
  const [resultsData, setResultsData] = useState<AdData[] | null>(null);
  const [searchedPhone, setSearchedPhone] = useState<string | null>(null);
  const [associatedUuids, setAssociatedUuids] = useState<AdUuid[]>([]);
  const [showHideReason, setShowHideReason] = useState<boolean>(false);
  const [source, setSource] = useState<'inspector-escorte' | undefined>(undefined);

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performLocalSearch = useCallback(async (phoneToSearch: string) => {
    const uuids = WWStorage.getPhoneAds(phoneToSearch) || [];
    setAssociatedUuids(uuids);

    if (uuids.length > 0) {
      const items = await adData.loadInAdsData(
        uuids,
        (uuid: string) => WWStorage.removePhoneAd(phoneToSearch, uuid)
      );
      setResultsData(items);
    } else {
      setResultsData([]);
    }
  }, []);

  const performSearch = useCallback(async (phoneToSearch: string) => {
    setSearchedPhone(phoneToSearch);

    try {
      const enabled = await inspectorEscorteApi.isEnabledAndAvailable();

      if (enabled) {
        const items = await adData.loadInInspectorEscorteAdsData(phoneToSearch);
        setSource('inspector-escorte');

        const uuids = WWStorage.getPhoneAds(phoneToSearch) || [];
        setAssociatedUuids(uuids);
        setResultsData(items);

        return;
      }

      setSource(undefined);
      await performLocalSearch(phoneToSearch);
    } catch (error) {
      console.error('Failed to search phone ads.', error);
      setSource(undefined);
      setAssociatedUuids([]);
      setResultsData([]);
    }
  }, [performLocalSearch]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    setResultsData(null);
    setSearchedPhone(null);
    setAssociatedUuids([]);
    setSource(undefined);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (rawValue.trim()) {
      debounceTimeoutRef.current = setTimeout(() => {
        const cleanedPhone = rawValue.replace(/^\+?40/, '0').replace(/\s+/g, '');

        if (cleanedPhone) {
          performSearch(cleanedPhone);
        } else {
          setResultsData([]);
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

  return (
    <AdsModal
      {...({ source, sourcePhone: source === 'inspector-escorte' ? searchedPhone : undefined } as any)}
      close={onClose}
      adsData={resultsData}
      title={<><PhoneIcon fill={misc.getPubliTheme() === 'dark' ? '#bfbfbf' : '#fff'}/> Anunțuri</>}
      onHideAll={resultsData?.length ? triggerHideActions : undefined}
      onInputChange={handleInputChange}
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
