import React from 'react';
import GeneralModal from '../../Common/Modal/GeneralModal';
import InfoIcon from '../../Common/Icons/InfoIcon';
import {PhoneIcon} from '../../Common/Icons/PhoneIcon';
import Code from '../../Common/Code/Code';
import {misc} from '../../../core/misc';

type PhoneSearchResultsHelpProps = {
  onClose: () => void;
};

const PhoneSearchResultsHelp: React.FC<PhoneSearchResultsHelpProps> = ({ onClose }) => {
  const isDark = misc.getPubliTheme() === 'dark';

  return (
    <GeneralModal
      title={
        <>
          <InfoIcon size={15} /> Rezultate <PhoneIcon fill="currentColor" size={18} />
        </>
      }
      onClose={onClose}
      maxWidth={840}
      dataWwid="phone-help-modal"
    >
      <h3>Explicații căutare și rezultate după telefon</h3>
      <p>
        <button
          type="button"
          style={{
            float: 'left',
            marginRight: '10px',
            marginBottom: '4px',
            padding: '9px',
            border: 'none',
            cursor: 'default',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '3px',
            background: isDark ? 'rgb(60 84 123)' : '#1177bb',
            pointerEvents: 'none'
          }}
        >
          <PhoneIcon fill={isDark ? '#9fc2fa' : '#ffffff'} size={19} />
        </button>
        Acest buton execută căutare pe Google a numărului de telefon și a ID-ului anunțului. Căutarea se întâmplă prin deschiderea unei pagini noi, prin care automat se încarcă Google cu termenii respectivi. Extensia procesează rezultatele și le salvează, după care închide pagina și te returnează la publi24. Există o opțiune la setări să nu inchidă automat pagina de Google, dacă dorești.
      </p>
      <p>Rezultatele sunt afișate sub anunț, dar sunt și filtrate. Următoarele sunt șterse pentru că nu au relevanță: linkuri care duc la același anunț ca și cel pe care se caută, site-uri varii care dau rezultate pentru orice număr de telefon dar nu ajută cu nicio informație relevantă. Lângă titlu se afișează când au fost rezultatele culese.</p>
      <h4>Semnificații speciale la partea de rezultate</h4>
      <ul>
        <li><Code>nerulat</Code> înseamnă că încă nu a fost rulat această căutare pentru anunț.</li>
        <li><Code>nu s-au găsit linkuri relevante</Code> înseamnă că ori nu s-a găsit nimic pe Google ori toate au fost filtrate.</li>
        <li><Code>date șterse, caută din nou</Code> înseamnă că s-a făcut căutare cândva dar s-au pierdut datele între timp.</li>
      </ul>
    </GeneralModal>
  );
};

export default PhoneSearchResultsHelp;
