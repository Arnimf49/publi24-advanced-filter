import React from 'react';
import {WWStorage} from "../../../../core/storage";
import PhoneAndTags from "./PhoneAndTags";
import {IS_MOBILE_VIEW} from "../../../../core/globals";

type PhoneAndTagsRoot = {
  phone: string;
  noPadding?: boolean;
};

const PhoneAndTagsRoot: React.FC<PhoneAndTagsRoot> = ({
 phone,
 noPadding = false,
}) => {
  const age = WWStorage.getPhoneAge(phone);
  const height = WWStorage.getPhoneHeight(phone);
  const weight = WWStorage.getPhoneWeight(phone);
  const bmi = height && weight
    ? Math.round(weight / Math.pow(height / 100, 2) * 10) / 10
    : undefined;
  const bmiWarn = bmi ? bmi <= 17 || bmi >= 23 : false;
  const ageWarn = age ? age > 35 : false;

  return (
    <PhoneAndTags
      isMobileView={IS_MOBILE_VIEW}
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
