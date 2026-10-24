import React from 'react';
import GeneralModal from '../../../../common/components/Modal/GeneralModal';
import InfoIcon from '../../Common/Icons/InfoIcon';
import Code from '../../Common/Code/Code';
import {hostPermissions} from '../../../core/hostPermissions';
import {IS_MOBILE_VIEW} from '../../../../common/globals';
import {misc} from '../../../core/misc';

type MissingPermissionsHelpProps = {
  onClose: () => void;
  missingGoogle: boolean;
  missingLens: boolean;
  missingInspectorEscorte: boolean;
};

const MissingPermissionsHelp: React.FC<MissingPermissionsHelpProps> = ({
  onClose,
  missingGoogle,
  missingLens,
  missingInspectorEscorte,
}) => {
  const missingImageOrigins = [
    ...(missingGoogle ? [hostPermissions.origins.google] : []),
    ...(missingLens ? [hostPermissions.origins.lens] : []),
  ];
  const missingInspectorOrigins = missingInspectorEscorte ? [hostPermissions.origins.inspectorEscorte] : [];
  const missingOrigins = Array.from(new Set([...missingImageOrigins, ...missingInspectorOrigins]));
  const headerColor = misc.getPubliTheme() === 'dark' ? '#7a3030' : '#9a3f3f';

  return (
    <GeneralModal
      title={<>{!IS_MOBILE_VIEW && <InfoIcon size={15} />} Permisiuni lipsă</>}
      onClose={onClose}
      maxWidth={840}
      dataWwid="permissions-help-modal"
      color={headerColor}
    >
      <p>Următoarele permisiuni nu au fost acordate, ceea ce cauzează funcționarea parțială a extensiei.</p>

      {missingGoogle && (
        <>
          <h3>Analiză telefon</h3>
          <p>
            Permisiune necesară: acces la site <Code>{hostPermissions.origins.google}</Code>
          </p>
          <p>
            Fără această permisiune, la căutarea numărului de telefon pe Google, extensia nu are acces la
            rezultate. Cu această permisiune, extensia poate să stocheze și să afișeze rezultatele sub anunț,
            să închidă eventual pagina de Google automat, să analizeze și să filtreze rezultatele irelevante
            și să persiste căutarea în timp.
          </p>
        </>
      )}

      {(missingGoogle || missingLens) && (
        <>
          <h3>Analiză poze</h3>
          <p>
            Permisiuni necesare: acces la site{' '}
            {missingImageOrigins.map((origin, index) => (
              <React.Fragment key={origin}>
                {index > 0 && ', '}
                <Code>{origin}</Code>
              </React.Fragment>
            ))}
          </p>
          <p>
            Fără aceste permisiuni, la căutarea după poze, extensia nu are acces la rezultate. Cu aceste
            permisiuni, rezultatele vor fi filtrate, analizate, persistate în timp și afișate frumos sub anunț.
            Analiza include marcarea fiecărui site după un grad, depinzând dacă este de pe Publi24 din aceeași
            locație sau din alte locații și depinzând dacă este de pe alt site cunoscut sau necunoscut, cu
            marcaj al țării de proveniență.
          </p>
        </>
      )}

      {missingInspectorEscorte && (
        <>
          <h3>Anunțuri inspector escorte</h3>
          <p>
            Permisiune necesară: acces la site{' '}
            <Code>{hostPermissions.origins.inspectorEscorte}</Code>
          </p>
          <p>
            Fără această permisiune extensia nu poate arăta duplicatele de la inspector escorte. Cu această
            permisiune vezi mai repede și mai larg ce anunțuri mai are titulara, din moment ce altfel se pot
            calcula numai anunțurile care le-ai văzut tu specific. De exemplu, anunțuri din alte orașe cel mai
            probabil nu se vor arăta fără această permisiune.
          </p>
        </>
      )}

      <h3>Cum să adaugi aceste permisiuni</h3>
      <p>
        Intră la setările browserului și/sau extensiei din browser, iar la accese pe site-uri dă permisiune la:
      </p>
      <ul>
        {missingOrigins.map((origin) => (
          <li key={origin}><Code>{origin}</Code></li>
        ))}
      </ul>
    </GeneralModal>
  );
};

export default MissingPermissionsHelp;
