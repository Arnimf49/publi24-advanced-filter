import type {
  EscortServiceName,
  EscortRates,
  ServiceDetails,
  ServiceAvailability,
} from '../../core/escortInfoExtractor';

export type DisplayedRateRow = {
  key: keyof EscortRates;
  label: string;
  values: string[];
};

export type DisplayedService = {
  service: EscortServiceName;
  label: string;
  isNotIncluded: boolean;
  extraCost?: number;
};

export type ServiceDisplayGroup = {
  label: string;
  services: DisplayedService[];
};

const RATE_ROWS: Array<{key: keyof EscortRates; label: string}> = [
  {key: '30m', label: '30 minute'},
  {key: '1h', label: '1 oră'},
  {key: '1.5h', label: '1,5 ore'},
  {key: '2h', label: '2 ore'},
];

const SERVICE_LABELS: Record<EscortServiceName, string> = {
  op: 'OP',
  on: 'ON',
  np: 'NP',
  nn: 'NN',
  showerSex: 'sex la duș',
  deepthroat: 'deepthroat',
  facesitting: 'facesitting',
  facefuck: 'facefuck',
  fk: 'FK',
  fj: 'FJ',
  hardSex: 'hard',
  cim: 'CIM',
  cof: 'COF',
  cob: 'COB',
  swallow: 'swallow',
  massage: 'masaj',
  uro: 'URO',
  squirt: 'squirt',
  rolePlay: 'role play',
  ap: 'AP',
  anal: 'AP',
  hj: 'HJ',
  '69': '69',
  gfe: 'GFE',
  prostateMassage: 'masaj prostatic',
  pse: 'PSE',
  cuni: 'cunnilingus',
  ani: 'anilingus',
  '3some': 'în 3',
  couples: 'cupluri',
  lesbyShow: 'show lesbian',
  shower: 'duș împreună',
  dom: 'dominare nespecifică',
  domSoft: 'dominare soft',
  domHard: 'dominare hard',
  domination: 'dominare nespecifică',
  verbalHum: 'umilire verbală',
  dirtyTalk: 'dirty talk',
  whipping: 'biciuire',
  spitting: 'scuipat',
  strapOn: 'strap-on',
  fisting: 'fisting',
  goldenShower: 'golden shower',
  footfetish: 'foot fetish',
  fingering: 'degete',
};

const SERVICE_GROUPS: Array<{label: string; services: EscortServiceName[]}> = [
  {label: 'Sex', services: ['np', 'nn', 'showerSex', 'hardSex']},
  {label: 'Oral', services: ['op', 'on', 'deepthroat', 'facefuck']},
  {label: 'Limbi', services: ['fk', 'cuni', 'ani', 'facesitting', '69']},
  {label: 'Finalizare', services: ['cim', 'cob', 'cof', 'swallow']},
  {label: 'Anal', services: ['ap', 'anal']},
  {label: 'Comportament', services: ['gfe', 'pse', 'rolePlay']},
  {label: 'Masaj', services: ['massage', 'prostateMassage']},
  {label: 'Domniare', services: ['dom', 'domSoft', 'domHard', 'domination', 'verbalHum', 'dirtyTalk', 'whipping', 'spitting', 'strapOn']},
  {label: 'Altele', services: ['hj', 'fj', '3some', 'couples', 'lesbyShow', 'shower', 'footfetish', 'fingering', 'uro', 'goldenShower', 'fisting', 'squirt']},
];

function formatService(service: EscortServiceName, value: ServiceAvailability): DisplayedService {
  if (value === true) {
    return {service, label: SERVICE_LABELS[service], isNotIncluded: false};
  }
  if (value === false) {
    return {service, label: `${SERVICE_LABELS[service]} (nu)`, isNotIncluded: true};
  }

  return {
    service,
    label: SERVICE_LABELS[service],
    isNotIncluded: false,
    extraCost: value.extraCost,
  };
}

function formatRate(rate: number | string): string {
  return typeof rate === 'string' ? rate : `${rate} lei`;
}

function getRateRows(details: ServiceDetails): DisplayedRateRow[] {
  return RATE_ROWS.flatMap(row => {
    const values: string[] = [];

    if (details.baseRates[row.key] !== undefined) {
      values.push(formatRate(details.baseRates[row.key]!));
    }
    if (details.dominationRates?.[row.key] !== undefined) {
      values.push(`dominare: ${formatRate(details.dominationRates[row.key]!)}`);
    }
    details.rateOverrides?.forEach(override => {
      const rate = override.rates?.[row.key];
      if (rate !== undefined) {
        const label = override.after === 'cuplu' ? 'cuplu' : `după ${override.after}`;
        values.push(`${label}: ${formatRate(rate)}`);
      }
    });
    if (details.outcallRates?.[row.key] !== undefined) {
      values.push(`deplasare: ${formatRate(details.outcallRates[row.key]!)}`);
    }

    if (!values.length) {
      return [];
    }

    return [{key: row.key, label: row.label, values}];
  });
}

function getServiceGroups(services?: Partial<Record<EscortServiceName, ServiceAvailability>>): ServiceDisplayGroup[] {
  if (!services || !Object.keys(services).length) {
    return [];
  }

  return SERVICE_GROUPS.flatMap(group => {
    const serviceNames = group.services.filter(service => {
      if (group.label === 'Anal' && service === 'anal') {
        return false;
      }
      if (service === 'dom'
        && (services.domSoft !== undefined || services.domHard !== undefined)) {
        return false;
      }
      if (service === 'domination'
        && (services.domSoft !== undefined || services.domHard !== undefined)) {
        return false;
      }

      return services[service] !== undefined;
    });

    if (!serviceNames.length) {
      return [];
    }

    const displayedServices = serviceNames.flatMap(service => {
      const value = services[service]!;
      return [formatService(service, value)];
    });
    if (!displayedServices.length) {
      return [];
    }

    return [{
      label: group.label,
      services: displayedServices,
    }];
  });
}

export const serviceDisplay = {
  getServiceGroups,
  getRateRows,
};
