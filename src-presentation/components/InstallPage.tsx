import React, {useState} from 'react';
import styles from './InstallPage.module.scss';

type Device = 'desktop' | 'android' | 'iphone';
type Browser = 'chrome' | 'firefox' | 'opera' | 'edge' | 'brave' | 'yandex' | 'orion';

interface DeviceOption {
  id: Device;
  label: string;
  description: string;
  icon: string;
}

interface BrowserOption {
  id: Browser;
  label: string;
  recommended?: boolean;
}

interface InstallStep {
  title: React.ReactNode;
  detail?: React.ReactNode;
}

interface ActionLabelProps {
  english: string;
  romanian: string;
}

const DEVICES: DeviceOption[] = [
  {
    id: 'desktop',
    label: 'Desktop',
    description: 'Windows, macOS sau Linux',
    icon: '🖥️',
  },
  {
    id: 'android',
    label: 'Android',
    description: 'Telefon sau tabletă',
    icon: '📱',
  },
  {
    id: 'iphone',
    label: 'iPhone',
    description: 'iPhone sau iPad',
    icon: '🍎',
  },
];

const BROWSERS: Record<Device, BrowserOption[]> = {
  desktop: [
    {id: 'chrome', label: 'Chrome', recommended: true},
    {id: 'firefox', label: 'Firefox'},
    {id: 'opera', label: 'Opera'},
    {id: 'edge', label: 'Edge'},
    {id: 'brave', label: 'Brave'},
  ],
  android: [
    {id: 'yandex', label: 'Yandex Browser', recommended: true},
    {id: 'firefox', label: 'Firefox'},
  ],
  iphone: [
    {id: 'orion', label: 'Orion Browser', recommended: true},
  ],
};

const STORE_LINKS = {
  chrome: 'https://chromewebstore.google.com/detail/publi24-filtru-avansat/pigkjfndnpblohnmphgbmecaelefaedn?hl=ro',
  firefox: 'https://addons.mozilla.org/ro/firefox/addon/publi24-filtru-avansat/',
};

const getInitialDevice = (): Device => {
  if (typeof navigator === 'undefined') {
    return 'desktop';
  }

  const isAppleTouchDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isAppleTouchDevice) {
    return 'iphone';
  }

  if (/Android/.test(navigator.userAgent)) {
    return 'android';
  }

  return 'desktop';
};

const ActionLabel: React.FC<ActionLabelProps> = ({english, romanian}) => (
  <span className={styles.actionGroup}>
    <span className={styles.action}>{english}</span>
    <span aria-hidden="true">/</span>
    <span className={styles.action}>{romanian}</span>
  </span>
);

const InstallPage: React.FC = () => {
  const [device, setDevice] = useState<Device>(getInitialDevice);
  const [browser, setBrowser] = useState<Browser>(() => BROWSERS[getInitialDevice()][0].id);
  const browserOptions = BROWSERS[device];
  const selectedBrowser = browserOptions.find((option) => option.id === browser) ?? browserOptions[0];
  const isFirefox = selectedBrowser.id === 'firefox';
  const storeLink = isFirefox ? STORE_LINKS.firefox : STORE_LINKS.chrome;
  const storeName = isFirefox ? 'Firefox Add-ons' : 'Chrome Web Store';

  const handleDeviceChange = (nextDevice: Device) => {
    setDevice(nextDevice);
    setBrowser(BROWSERS[nextDevice][0].id);
  };

  const getSteps = (): InstallStep[] => {
    if (device === 'iphone') {
      return [
        {title: <>Descarcă <code>Orion Browser</code> din App Store</>},
        {
          title: <>Activează extensiile <code>Chrome</code> în <code>Orion</code></>,
          detail: <>Apasă pe meniul cu trei puncte, mergi la <code>Setări → Avansat</code> și activează <code>Chrome Extensions</code>.</>,
        },
        {
          title: <>Deschide pagina extensiei în <code>Orion</code></>,
          detail: <>Caută pe Google <code>publi24 filtru avansat chrome</code> și deschide rezultatul din <code>Chrome Web Store</code>.</>,
        },
        {
          title: <>Apasă pe <ActionLabel english="Add to Orion" romanian="Adaugă în Orion" /></>,
          detail: <>Dacă butonul nu apare, deschide meniul din stânga barei de URL și alege <code>Request Desktop Website</code>.</>,
        },
        {title: <>Accesează <code>Publi24</code> în <code>Orion</code> și folosește funcționalitățile noi</>},
      ];
    }

    if (device === 'android' && selectedBrowser.id === 'firefox') {
      return [
        {title: <>Descarcă <code>Firefox</code> din Google Play</>},
        {
          title: <>Deschide pagina extensiei în <code>Firefox</code></>,
          detail: <>Caută <code>publi filtru avansat firefox</code> și deschide rezultatul din <code>Firefox Add-ons</code>.</>,
        },
        {title: <>Apasă pe <ActionLabel english="Add to Firefox" romanian="Adăugați la Firefox" /></>},
        {title: <>Accesează <code>Publi24</code> în <code>Firefox</code> și folosește funcționalitățile noi</>},
      ];
    }

    if (device === 'android') {
      return [
        {title: <>Descarcă <code>Yandex Browser</code> din Google Play</>},
        {
          title: <>Deschide pagina extensiei în <code>Yandex Browser</code></>,
          detail: <>Caută <code>publi24 filtru avansat chrome</code> și deschide rezultatul din <code>Chrome Web Store</code>.</>,
        },
        {
          title: <>Apasă pe <ActionLabel english="Add to Chrome" romanian="Adaugă în Chrome" /></>,
          detail: <>Butonul este în partea dreaptă. Dacă nu îl vezi, micșorează pagina cu zoom out.</>,
        },
        {title: <>Accesează <code>Publi24</code> în <code>Yandex Browser</code> și folosește funcționalitățile noi</>},
      ];
    }

    if (isFirefox) {
      return [
        {title: <>Deschide <a className={styles.inlineLink} href={storeLink} target="_blank" rel="noreferrer">{storeName}</a> în browser-ul <code>Firefox</code></>},
        {title: <>Apasă pe <ActionLabel english="Add to Firefox" romanian="Adăugați la Firefox" /></>},
        {title: <>Accesează <code>Publi24</code> și folosește funcționalitățile noi</>},
      ];
    }

    return [
      {title: <>Deschide <a className={styles.inlineLink} href={storeLink} target="_blank" rel="noreferrer">{storeName}</a> în browser-ul <code>{selectedBrowser.label}</code></>},
      {title: <>Apasă pe <ActionLabel english="Add to Chrome" romanian="Adaugă în Chrome" /></>},
      ...(selectedBrowser.id === 'opera' ? [{
        title: 'Permite acces la Google',
        detail: <>După instalare, deschide setările extensiei în <code>Opera</code>, găsește extensia <code>Publi24 filtru avansat</code> și activează setarea <code>Allow access to search page results</code>.</>,
      }] : []),
      {title: <>Accesează <code>Publi24</code> în <code>{selectedBrowser.label}</code> și folosește funcționalitățile noi</>},
    ];
  };

  const steps = getSteps();

  return (
    <section className={styles.page} aria-labelledby="install-page-title">
      <div className={styles.intro}>
        <p className={styles.kicker}>✦ Instalare ✦</p>
        <h1 id="install-page-title">Alege cum vrei sa folosesti extensia.</h1>
        <p className={styles.lede}>
          Alege dispozitivul și browserul în care vrei să folosești extensia și vei primi instrucțiuni exacte.
        </p>
      </div>

      <div className={styles.selectionGrid}>
        <div className={styles.selectorBlock}>
          <p className={styles.selectorLabel}>1 / Dispozitiv</p>
          <div className={styles.deviceOptions} role="group" aria-label="Alege dispozitivul">
            {DEVICES.map((option) => (
              <button
                className={`${styles.deviceOption}${device === option.id ? ` ${styles.selected}` : ''}`}
                key={option.id}
                type="button"
                aria-pressed={device === option.id}
                onClick={() => handleDeviceChange(option.id)}
              >
                <span className={styles.deviceIcon} aria-hidden="true">{option.icon}</span>
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        {browserOptions.length > 1 && (
          <div className={styles.selectorBlock}>
            <p className={styles.selectorLabel}>2 / Browser</p>
            <div className={styles.browserOptions} role="group" aria-label="Alege browserul">
              {browserOptions.map((option) => (
                <button
                  className={`${styles.browserOption}${selectedBrowser.id === option.id ? ` ${styles.selected}` : ''}`}
                  key={option.id}
                  type="button"
                  aria-pressed={selectedBrowser.id === option.id}
                  onClick={() => setBrowser(option.id)}
                >
                  {option.label}
                  {option.recommended && <span className={styles.recommended}>recomandat</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.instructions}>
        <div className={styles.instructionsHeader}>
          <div>
            <p className={styles.selectorLabel}>Pașii tăi</p>
            <h2>Instalează în {selectedBrowser.label}.</h2>
          </div>
        </div>

        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li className={styles.step} key={index}>
              <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{step.title}</strong>
                {step.detail && <p>{step.detail}</p>}
              </div>
            </li>
          ))}
        </ol>

      </div>
    </section>
  );
};

export default InstallPage;
