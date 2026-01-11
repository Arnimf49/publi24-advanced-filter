import React from 'react';
import GeneralModal from '../../Common/Modal/GeneralModal';
import InfoIcon from '../../Common/Icons/InfoIcon';
import {ImageIcon} from '../../Common/Icons/ImageIcon';
import Code from "../../Common/Code/Code";
import {misc} from "../../../core/misc";

type ImageSearchResultsHelpProps = {
  onClose: () => void;
};

const ImageSearchResultsHelp: React.FC<ImageSearchResultsHelpProps> = ({ onClose }) => {
  const isDark = misc.getPubliTheme() === 'dark';

  return (
    <GeneralModal
      title={
        <>
          <InfoIcon size={15} /> Rezultate <ImageIcon fill="currentColor" size={18} />
        </>
      }
      onClose={onClose}
      maxWidth={840}
      dataWwid="image-help-modal"
    >
      <h3>Explicații căutare și rezultate după poze</h3>
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
          <ImageIcon fill={isDark ? '#9fc2fa' : '#ffffff'} size={19} />
        </button>
        Acest buton execută căutare pe Google Lens a pozelor anunțului. Pe Desktop căutarea se întâmplă prin deschiderea simultană a mai multor pagini noi, pentru fiecare poză una. Pe Mobil se deschide numai o singură pagină și se caută pe rând în aceeași pagină după toate pozele. Extensia procesează rezultatele și le salvează, după care închide pagina, sau avansează la următoarea poză, și te returnează la publi24. Există o opțiune la setări să nu închidă automat pagina de Google Lens, dacă dorești.
      </p>
      <p>Căutarea de Lens se face prin <b>Rezultate exacte</b>, din moment ce Similare ar da foarte multe rezultate care nu au nicio treabă cu pozele.</p>
      <p>Rezultatele sunt afișate sub anunț, de la toate pozele, dar sunt deduplicate și filtrate. Se poate da click pe fiecare rezultat în parte pentru a deschide sursa. Următoarele sunt șterse pentru că nu au relevanță: linkuri care duc la același anunț ca și cel pe care se caută. Lângă titlu se afișează când au fost rezultatele culese, dar și un cerc care semnifică prin culoare dacă rezultatele în ansamblu sunt considerate ok sau periculoase.</p>
      <h4>Semnificații speciale la partea de rezultate</h4>
      <ul>
        <li><Code>nerulat</Code> înseamnă că încă nu a fost rulat această căutare pentru anunț.</li>
        <li><Code>nu s-au găsit linkuri relevante</Code> înseamnă că ori nu s-a găsit nimic pe Google ori toate au fost filtrate.</li>
        <li><Code>ddate șterse, caută din nou</Code> înseamnă că s-a făcut căutare cândva dar s-au pierdut datele între timp.</li>
        <li><Code status="unsafe">anunțuri găsite în alte locații</Code> înseamnă că s-au găsit alte anunțuri din alte locații de pe publi24 cu aceleași poze.</li>
        <li>Culoarea unui rezultat semnifică dacă extensia vede acel rezultat unul <Code status="safe">sigur</Code>, <Code status="suspicious">suspicios</Code> sau <Code status="unsafe">periculos</Code>.</li>
        <li>Rezultatele care au culoarea <Code status="suspicious">galbenă</Code> sunt de la site-uri străine recunoscute de extensie. Acestea afișează și steagul țării din care provin.</li>
        <li>Rezultatele cu <Code>gri</Code> sunt linkuri moarte, care dă 404, de la publi24 Căndva exista ceva dar n mai este acolo.</li>
      </ul>
      <p>Căutarea și afișul de rezultate este făcut într-un fel de a ajuta accesul rapid la informații dar și de a da semnale ușor vizibile. Până la urmă concluzia finală pe baza rezultatelor este la latură ta.</p>
    </GeneralModal>
  );
};

export default ImageSearchResultsHelp;
