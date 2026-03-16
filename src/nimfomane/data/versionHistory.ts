export type VersionData = {
  version: string;
  releaseDate: string;
  changeNew?: string[];
  changeImprove?: string[];
  changeFix?: string[];
};

export const versionHistory: VersionData[] = [
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
