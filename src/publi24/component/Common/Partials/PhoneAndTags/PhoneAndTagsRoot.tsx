import React from 'react';
import {WWStorage} from "../../../../core/storage";
import PhoneAndTags from "./PhoneAndTags";

type PhoneAndTagsRoot = {
  adId?: string,
  phone: string;
  noPadding?: boolean;
};

const PhoneAndTagsRoot: React.FC<PhoneAndTagsRoot> = ({
 adId,
 phone,
 noPadding = false,
}) => {
  const age = (adId && WWStorage.getAdAge(adId)) || WWStorage.getPhoneAge(phone);
  const height = (adId && WWStorage.getAdHeight(adId)) || WWStorage.getPhoneHeight(phone);
  const weight = (adId && WWStorage.getAdWeight(adId)) || WWStorage.getPhoneWeight(phone);
  const bmi = height && weight
    ? Math.round(weight / Math.pow(height / 100, 2) * 10) / 10
    : undefined;
  const bmiWarn = bmi ? bmi <= 17 || bmi >= 23 : false;
  const ageWarn = age ? age > 35 : false;

  return (
    <PhoneAndTags
      noPadding={noPadding}
      phone={phone}
      age={age}
      ageWarn={ageWarn}
      bmi={bmi}
      bmiWarn={bmiWarn}
      height={height}
      weight={weight}
    />
  );
};

export default PhoneAndTagsRoot;
