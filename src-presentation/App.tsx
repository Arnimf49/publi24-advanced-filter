import React, {useEffect, useState} from 'react';
import {P24faLogoLight} from '../src/common/components/Logo/P24faLogoLight';
import FavoritesFeatureDemo from './components/FavoritesFeatureDemo';
import HideFeatureDemo from './components/HideFeatureDemo';
import InstallPage from './components/InstallPage';
import Publi24Demo from './components/Publi24Demo';
import SearchFeatureDemo from './components/SearchFeatureDemo';
import DuplicateFeatureDemo from './components/DuplicateFeatureDemo';
import SettingsFeatureDemo from './components/SettingsFeatureDemo';
import styles from './App.module.scss';

const App: React.FC = () => {
  const [extensionEnabled, setExtensionEnabled] = useState(false);
  const [isInstallPage, setIsInstallPage] = useState(() => (
    typeof window !== 'undefined' && window.location.hash === '#instalare'
  ));

  useEffect(() => {
    const handleHashChange = () => {
      setIsInstallPage(window.location.hash === '#instalare');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <main>
      <header className={styles.header}>
        <a className={styles.brand} href="#" aria-label="Publi24 filtru avansat, pagina principală">
          <P24faLogoLight className={styles.logo} padding={false} />
          <b>Publi24 filtru avansat</b>
        </a>

        <a className={styles.installButton} href="#instalare">
          Instalare
        </a>
      </header>

      {isInstallPage ? <InstallPage /> : (
        <>
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Publi24 filtru avansat · extensie de browser</p>
              <h1 className={styles.heroTitle}>Mai multă claritate în lista de anunțuri.</h1>
              <p className={styles.heroDescription}>
                Extensia adaugă instrumentele de filtrare și investigare care lipsesc din experiența standard.
              </p>
            </div>
          </section>

          <section className={styles.featureBlock} aria-labelledby="feature-title">
            <div className={styles.featureCopy}>
              <p className={styles.sectionNumber}>01 / Extindere</p>
              <h2 id="feature-title">Extensie a funcționalităților</h2>
              <p>
                Îți oferă ție, ca client, ceea ce Publi24 nu oferă: filtrare, investigare, vizibilitate și grupare a anunțurilor.
              </p>
              <p className={styles.supportingCopy}>
                Comparația din dreapta arată aceeași listare înainte și după activarea extensiei.
              </p>
            </div>

            <Publi24Demo
              extensionEnabled={extensionEnabled}
              onExtensionChange={setExtensionEnabled}
            />
          </section>

          <section className={styles.featureBlock} aria-labelledby="hide-feature-title">
            <div className={styles.featureCopy}>
              <p className={styles.sectionNumber}>02 / Ascundere</p>
              <h2 id="hide-feature-title">Ascunde anunțuri</h2>
              <p>
                Ascunde ceea ce nu te interesează, pe baza telefonului.
              </p>
              <p>
                Restul anunțurilor de la același telefon se ascund automat. La ascundere, motivează-ți decizia. Nu mai uiți când revii pe site ce ai decis în trecut.
              </p>
              <p>
                Cu setări specifice poți ascunde chiar automat anunțuri pe baza unor criterii variate, cum ar fi înălțimea sau greutatea.
              </p>
            </div>

            <HideFeatureDemo />
          </section>

          <section className={styles.featureBlock} aria-labelledby="favorites-feature-title">
            <div className={styles.featureCopy}>
              <p className={styles.sectionNumber}>03 / Favorite</p>
              <h2 id="favorites-feature-title">Adaugă la favorite</h2>
              <p>
                Adaugă anunțuri ca și numere de telefon la favorite. Vizionează favoritele într-un modal, toate unul sub altul, grupate depinzând de locația curentă a anunțului.
              </p>
              <p>
                Numărul de telefon rămâne la favorite chiar și dacă toate anunțurile dispar. Pe viitor pot reapărea anunțuri sub același număr.
              </p>
            </div>

            <FavoritesFeatureDemo />
          </section>

          <section className={styles.featureBlock} aria-labelledby="phone-feature-title">
            <div className={styles.featureCopy}>
              <p className={styles.sectionNumber}>04 / Telefon</p>
              <h2 id="phone-feature-title">Verifică numărul de telefon</h2>
              <p>
                Caută după numărul de telefon pe Google, găsind astfel articole relevante, potențial recenzii legate.
              </p>
              <p>
                În cazul recenziilor existente găsite se afișează buton pentru a sări ușor pe aceste site-uri.
              </p>
            </div>

            <SearchFeatureDemo searchType="phone" />
          </section>

          <section className={styles.featureBlock} aria-labelledby="image-feature-title">
            <div className={styles.featureCopy}>
              <p className={styles.sectionNumber}>05 / Imagini</p>
              <h2 id="image-feature-title">Verifică pozele</h2>
              <p>
                Caută după toate pozele pe Google Lens, găsind astfel sursele în care acestea se mai găsesc.
              </p>
              <p>
                Primești un nivel de avertizare pe bază de culoare pe rezultate. Site-urile cunoscute primesc un steag al țării de proveniență, ca să știi repede cât mai mult.
              </p>
            </div>

            <SearchFeatureDemo searchType="image" />
          </section>

          <section className={styles.featureBlock} aria-labelledby="duplicates-feature-title">
            <div className={styles.featureCopy}>
              <p className={styles.sectionNumber}>06 / Duplicare</p>
              <h2 id="duplicates-feature-title">Verifică anunțurile duplicate</h2>
              <p>
                Află instant câte anunțuri există pentru același număr de telefon. Deschide-le pe toate într-un singur modal pentru a compara detaliile și mai ales pozele.
              </p>
            </div>

            <DuplicateFeatureDemo />
          </section>

          <section className={styles.featureBlock} aria-labelledby="settings-feature-title">
            <div className={styles.featureCopy}>
              <p className={styles.sectionNumber}>07 / Setări</p>
              <h2 id="settings-feature-title">Configurează-ți experiența</h2>
              <p>
                Alege din mai multe setări pentru a-ți configura experiența optimă pentru utilizarea extensiei și a Publi24. Așa afli și faci totul rapid.
              </p>
            </div>

            <SettingsFeatureDemo />
          </section>

          <section className={styles.installSection} id="instalare">
            <div>
              <p className={styles.sectionNumber}>Următorul pas</p>
              <h2>Încearcă extensia.</h2>
            </div>
            <a className={styles.installButton} href="#instalare">
              Deschide pagina de instalare
              <span aria-hidden="true">↗</span>
            </a>
          </section>
        </>
      )}
    </main>
  );
};

export default App;
