export type VersionData = {
  version: string;
  releaseDate: string;
  changeNew?: string[];
  changeImprove?: string[];
  changeFix?: string[];
};

export const versionHistory: VersionData[] = [
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
