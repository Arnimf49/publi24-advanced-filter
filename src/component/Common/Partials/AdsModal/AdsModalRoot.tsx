import React, {MouseEventHandler, useCallback, useEffect, useState} from 'react';
import {adData, AdData} from "../../../../core/adData";
import AdsModal from "./AdsModal";
import {IS_MOBILE_VIEW} from "../../../../core/globals";
import {WWStorage} from "../../../../core/storage";
import HideReasonRoot from "../HideReason/HideReasonRoot";
import GlobalLoader from "../../GlobalLoader/GlobalLoader";

type AdsModalRootProps = {
  close: () => void;
  phone: string;
};

const AdsModalRoot: React.FC<AdsModalRootProps> = ({
  close,
  phone,
}) => {
  const [adsData, setAdsData] = useState<null | AdData[]>(null);
  const [showHideReason, setShowHideReason] = useState(false);

  const onHideAll: MouseEventHandler = useCallback((e) => {
    e.stopPropagation();

    const duplicateUuids = WWStorage.getPhoneAds(phone);
    duplicateUuids.forEach((adUuid) => {
      const parts = adData.uuidParts(adUuid);
      if (parts.length > 0) {
        WWStorage.setAdVisibility(parts[0], false);
      }
    });
    WWStorage.setPhoneHidden(phone);

    setShowHideReason(true);
  }, [])

  useEffect(() => {
    const duplicateUuids = WWStorage.getPhoneAds(phone);
    adData.loadInAdsData(
      duplicateUuids,
      (uuid: string) => WWStorage.removePhoneAd(phone, uuid)
    ).then(setAdsData);
  }, []);

  if (!adsData) {
    return <GlobalLoader message={"La 20+ de anunțuri durează mai mult sa încarce, din cauză la limitari de Publi24."}/>;
  }

  return (
    <AdsModal
      phone={phone}
      adsData={adsData}
      close={close}
      onHideAll={onHideAll}
      isMobileView={IS_MOBILE_VIEW}
      hideReasonSelector={showHideReason
        && <HideReasonRoot
          phone={phone}
          onReason={close}
        />}
    />
  );
};

export default AdsModalRoot;
