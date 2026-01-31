import React, {MouseEventHandler, useCallback, useEffect, useState} from 'react';
import {adData, AdData} from "../../../../core/adData";
import AdsModal from "./AdsModal";
import {WWStorage} from "../../../../core/storage";
import HideReasonRoot from "../HideReason/HideReasonRoot";
import GlobalLoader from "../../GlobalLoader/GlobalLoader";
import {modalState} from "../../../../../common/modalState";

type AdsModalRootProps = {
  close: () => void;
  phone: string;
};

const AdsModalRoot: React.FC<AdsModalRootProps> = ({
  close,
  phone,
}) => {
  const [adsData, setAdsData] = useState<null | AdData[]>(null);
  const [removedNow, setRemovedNow] = useState(0);
  const [showHideReason, setShowHideReason] = useState(false);

  const onHideAll: MouseEventHandler = useCallback((e) => {
    e.stopPropagation();

    const duplicateUuids = WWStorage.getPhoneAds(phone);
    duplicateUuids.forEach((adUuid) => {
      WWStorage.setAdVisibility(adUuid.id, false);
    });
    WWStorage.setPhoneHidden(phone);

    setShowHideReason(true);
  }, [])

  useEffect(() => {
    const duplicateUuids = WWStorage.getPhoneAds(phone);
    adData.loadInAdsData(
      duplicateUuids,
      (uuid: string) => {
        WWStorage.removePhoneAd(phone, uuid);
        setRemovedNow((n) => n + 1);
      }
    ).then(setAdsData);
  }, []);

  const cleanupUrl = () => {
    modalState.revertOpen();
  };
  useEffect(() => {
    modalState.pushOpen('ads', {phone});
  }, [phone]);

  if (!adsData) {
    return <GlobalLoader message={"La 20+ de anunțuri durează mai mult sa încarce, din cauză la limitari de Publi24."}/>;
  }

  return (
    <AdsModal
      phone={phone}
      adsData={adsData}
      removed={removedNow}
      close={close}
      onHideAll={onHideAll}
      onCleanup={cleanupUrl}
      hideReasonSelector={showHideReason
        && <HideReasonRoot
          phone={phone}
          onReason={close}
        />}
    />
  );
};

export default AdsModalRoot;
