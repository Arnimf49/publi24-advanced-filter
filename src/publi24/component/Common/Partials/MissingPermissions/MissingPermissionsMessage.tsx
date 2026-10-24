import React, {useState} from 'react';
import styles from './MissingPermissionsMessage.module.scss';
import {hostPermissions} from '../../../../core/hostPermissions';
import MissingPermissionsHelp from '../../../AdPanel/Help/MissingPermissionsHelp';

type MissingPermissionsMessageProps = {
  dataWwid: string;
};

const MissingPermissionsMessage: React.FC<MissingPermissionsMessageProps> = ({dataWwid}) => {
  const [showHelp, setShowHelp] = useState(false);
  const permissionState = hostPermissions.get();

  return (
    <>
      <p className={`${styles.missingPermissions}`} data-wwid={dataWwid}>
        permisiuni lipsă,{' '}
        <button type="button" className={styles.permissionsDetailsLink} onClick={() => setShowHelp(true)}>
          vezi detalii
        </button>
      </p>
      {showHelp && (
        <MissingPermissionsHelp
          onClose={() => setShowHelp(false)}
          missingGoogle={!permissionState.google}
          missingLens={!permissionState.lens}
          missingInspectorEscorte={!permissionState.inspectorEscorte}
        />
      )}
    </>
  );
};

export default MissingPermissionsMessage;
