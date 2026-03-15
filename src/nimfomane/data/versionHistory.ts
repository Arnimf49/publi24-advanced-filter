export type VersionData = {
  version: string;
  releaseDate: string;
  changeNew?: string[];
  changeImprove?: string[];
  changeFix?: string[];
};

export const versionHistory: VersionData[] = [
  {
    version: '3.0',
    releaseDate: 'TBD',
    changeNew: [
      'Test'
    ],
    changeImprove: [],
    changeFix: [
      'Test'
    ],
  },
];
