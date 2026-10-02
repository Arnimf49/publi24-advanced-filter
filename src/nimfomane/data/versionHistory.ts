export type VersionData = {
  version: string;
  releaseDate: string;
  changeNew?: string[];
  changeImprove?: string[];
  changeFix?: string[];
};

export const versionHistory: VersionData[] = [
  {
    version: '3.11',
    releaseDate: '2 octombrie 2026',
    changeNew: [
      'Afișarea duratei șederii în orașele vizitate.',
    ],
    changeImprove: [
      'Escortele din favorite sunt grupate per oraș curent.',
      'Afișarea mai bună a orașelor vizitate și a detaliilor escortei.',
    ],
    changeFix: []
  },
  {
    version: '3.10',
    releaseDate: '26 septembrie 2026',
    changeNew: [
      'Orașe vizitate afișat în modalul de detalii escortă.',
      'În favorite se afișează detaliile personale și ratele principale ale escortei dacă informația există.',
      'Export si import de date în setări, plus procentul de stocare folosit.'
    ],
    changeImprove: [
      'Detectare mai bună a locației curente în favorite.',
      'Stil de afiș în favorite și in detalii escortă.',
      'Afiș imbunătățit pe modalul cu poze pentru Yandex mobil.',
    ],
    changeFix: [
      'Poza principală a topicului se schimba incorect la încărcarea a mai multor poze în modalul de poze.',
    ]
  },
  {
    version: '3.9',
    releaseDate: '19 septembrie 2026',
    changeNew: [
      'Se afișează secțiunea de forum în care a fost publicat poza in modalul de poze lângă data acesteia.',
    ],
    changeImprove: [
      'Când se atinge limita de pagini analizate pentru detalii escortă, se mai face o încercare între primele postări a escortei.',
      'Tratare mai bună la afișarea modalului cu poze pe mobil.',
      'Cazuri adiționale în care lista de servicii nu se extrăgeau corect.',
    ],
    changeFix: [
      'Poza principală a topicului se schimba incorect la încărcarea a mai multor poze în modalul de poze.',
    ]
  },
  {
    version: '3.8.3',
    releaseDate: '13 septembrie 2026',
    changeNew: [],
    changeImprove: [],
    changeFix: [
      'Poza de profil nu se apăsa la partea de jos cănd topicul era ascuns pe mobil',
      'Inconsistență între alegerea pozei principale de profil și cele afișate in modalul cu poze',
      'Pozele postate în secțiunea de \'Servicii adiacente\' nu erau incluse',
      'Cazuri adiționale în care lista de servicii nu se extrăgeau corect.',
    ]
  },
  {
    version: '3.8.2',
    releaseDate: '29 august 2026',
    changeNew: [],
    changeImprove: [],
    changeFix: [
      'Butonul browserului mobil pentru revenire sus se suprapunea peste butonul de închidere al modalului de poze.',
    ]
  },
  {
    version: '3.8.1',
    releaseDate: '21 august 2026',
    changeNew: [],
    changeImprove: [],
    changeFix: [
      'Modalul de poze se nu adapta corect când bara browserului mobil se restrângea.',
    ]
  },
  {
    version: '3.8',
    releaseDate: '21 august 2026',
    changeNew: [],
    changeImprove: [
      'Afiș îmbunătățit pe modalul de detalii escortă.',
      'Poza din modalul de detalii escortă la click acum deschide modalul de poze.',
    ],
    changeFix: [
      'Butoanele din modalul de poze săreau la scroll pe Firefox mobil.',
    ]
  },
  {
    version: '3.7.2',
    releaseDate: '18 august 2026',
    changeNew: [],
    changeImprove: [],
    changeFix: [
      'Și mai multe cazuri în care detaliile de servicii pentru escortă se afișau incorect.',
      'Link sursă incorectă pentru detaliile de escortă cănd este utilzator autentificat.',
    ]
  },
  {
    version: '3.7.1',
    releaseDate: '17 august 2026',
    changeNew: [],
    changeImprove: [],
    changeFix: [
      'Cazuri multiple în care detaliile de servicii pentru escortă se afișau incorect.',
      'Link sursă incorectă pentru detaliile de escortă.',
    ]
  },
  {
    version: '3.7',
    releaseDate: '17 august 2026',
    changeNew: [
      'Extragere și afișare date personale și date despre servicii, pentru profile de escortă.',
      'Categorizare profile active și inactive în favorite.'
    ],
    changeImprove: [
      'Animație pe butonul global cel închis, cănd este o versiune nouă.'
    ],
    changeFix: [
      'Poziționare greșită a meniului pe anumite ecrane, cu poziția nouă a butoanelor globale.',
      'Pe profile \'neverificate\' nu se afișa panoul de butoane.'
    ]
  },
  {
    version: '3.6',
    releaseDate: '11 august 2026',
    changeNew: [
      'Posibilitatea de a închide butoanele globale.',
    ],
    changeImprove: [
      'Repoziționat butoanele globale pe desktop.',
    ],
    changeFix: []
  },
  {
    version: '3.2.2',
    releaseDate: '29 aprilie 2026',
    changeNew: [],
    changeImprove: [],
    changeFix: [
      'Unele poze în modal aveau link incorect către topic și replică cu acea poză.',
    ]
  },
  {
    version: '3.2.1',
    releaseDate: '25 aprilie 2026',
    changeNew: [],
    changeImprove: [],
    changeFix: [
      'Număr topice ascunse incorect la navigare pe paginile de listare.',
    ]
  },
  {
    version: '3.2',
    releaseDate: '20 aprilie 2026',
    changeNew: [
      'Setare mod focus.',
    ],
    changeImprove: [
      'Încărcare mai rapidă a extensiei.',
      'Viteză de încărcare și afiș mai bun pe favorite.',
    ],
    changeFix: [
      'Stil pe modalul istoric de verziuni.',
      'Afiș loader și eroare deodată în anumite cazuri pe poză.',
    ]
  },
  {
    version: '3.1',
    releaseDate: '7 aprilie 2026',
    changeNew: [
      'Buton whatsapp, favorit și ascundere pe pagina de profil a escortei.',
      'Formular de \'Feedback\'.',
    ],
    changeImprove: [
      'Modalul cu poze încarcă numai din secțiunile principale pozele.',
      'Pozele au link către topic și replică în care au fost încărcate.',
      'Pozele în modal se încarcă mult mai rapid.',
    ],
  },
  {
    version: '3.0.2',
    releaseDate: '18 martie 2026',
    changeImprove: [
      'Ordinea butoanelor de acțiuni de pe topice.',
    ],
    changeFix: [
      'Performanță degradată pe mobil de la afișul \'ascuns\' al topicelor.',
    ],
  },
  {
    version: '3.0.1',
    releaseDate: '16 martie 2026',
    changeFix: [
      'Performanță degradată pe mobil de la modul de afiș al pozei principale.',
    ]
  },
  {
    version: '3.0',
    releaseDate: '16 martie 2026',
    changeImprove: [
      'Pozele vechi acum se afișează la mărimea corectă în modal.'
    ],
    changeNew: [
      'Button whatsapp.',
      'Categorizare topice tip \'publi24\': poză cu logo, La click se deschide anunțul.',
      'Ascundere escortă și topicele acesteia, opțional cu motivare.',
      'Escorte favorite. În modal se arată statistici, ca și locația curentă.',
      'Modal istoric de verziuni.',
    ],
  },
];
