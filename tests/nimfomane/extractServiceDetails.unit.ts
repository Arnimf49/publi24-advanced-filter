import {expect, test} from "@playwright/test";
import {readFileSync} from "node:fs";
import {escortInfoExtractor} from "../../src/nimfomane/core/escortInfoExtractor";
import type {ServiceDetails} from "../../src/nimfomane/core/escortInfoExtractor";

const readSample = (file: string): string => readFileSync(new URL(`./mocks/service-texts/${file}`, import.meta.url), "utf8");

const samples: Array<{file: string; expected: ServiceDetails}> = [
  {
    file: "sample1.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {
        op: true, on: true, np: true, fk: true,
        cim: true, cof: true, cob: true,
        anal: false, hj: true, '69': true, gfe: true,
        cuni: true, bdsm: false,
      },
    },
  },
  {file: "sample2.txt", expected: {baseRates: {'30m': 300, '1h': 500}}},
  {
    file: "sample3.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400, '1.5h': 650, '2h': 800},
      rateOverrides: [{after: "21:00", rates: {'1h': 500}}],
      services: {
        op: true, on: true, np: true, cim: {extraCost: 50}, cob: true, massage: true,
        hj: true, '69': true, '3some': true, couples: true,
        shower: true, bdsm: {extraCost: 100},
      },
    },
  },
  {
    file: "sample4.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500}, outcallRates: {'1h': 800},
      services: {
        op: true, on: true, np: true, fk: {extraCost: 150},
        cim: false, cof: false, cob: false, massage: true, anal: false,
        hj: true, '69': true, gfe: true, pse: true,
        cuni: true, ani: true, shower: {extraCost: 100},
      },
    },
  },
  {
    file: "sample5.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300, '1.5h': 500},
      services: {op: true, on: true, np: true, cim: true, cob: true, massage: true, '3some': true},
    },
  },
  {
    file: "sample6.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      services: {
        op: true, on: true, np: true, deepthroat: true, fk: true,
        massage: true, cim: true, cob: true, ap: true, anal: true, '69': true, gfe: true,
        prostateMassage: true, pse: true, cuni: true, ani: true,
        '3some': true, bdsm: true,
      },
    },
  },
  {
    file: "sample7.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 350},
      services: {
        op: true, on: true, np: true, deepthroat: true, fk: true,
        cim: true, cof: true, cob: true, massage: true, anal: false, '69': true, gfe: true, prostateMassage: true,
        pse: true, cuni: true, ani: true, '3some': true, couples: true,
        lesbyShow: true,
      },
    },
  },
  {
    file: "sample8.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 250, '1.5h': 350, '2h': 500},
      services: {on: true, np: true, fk: true, cim: true, cob: true, '69': true, gfe: true, cuni: true},
    },
  },
  {
    file: "sample9.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 250, '1.5h': 350, '2h': 500},
      services: {op: true, on: true, np: true, fk: true, cim: true, cob: true, '69': true, cuni: true},
    },
  },
  {
    file: "sample10.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {op: true, on: true, np: true, nn: false, deepthroat: true, fk: true, cim: {extraCost: 50}, massage: true, anal: false, hj: true, '69': true},
    },
  },
  {
    file: "sample11.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {op: true, on: true, np: true, deepthroat: true, fk: true, cob: true, massage: true, '69': true, cuni: true, ani: true, shower: true},
    },
  },
  {file: "sample12.txt", expected: {baseRates: {'30m': 150, '1h': 250}, services: {op: true, on: true, np: true, massage: true, '69': true}}},
  {file: "sample13.txt", expected: {baseRates: {'30m': 150, '1h': 250}, services: {op: true, on: true, np: true, massage: true, '69': true}}},
  {
    file: "sample14.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {op: true, on: true, np: true, deepthroat: {extraCost: 50}, fk: true, cim: {extraCost: 50}, cob: true, massage: true, gfe: true},
    },
  },
  {
    file: "sample15.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      rateOverrides: [{after: "20:00", rates: {'30m': 300, '1h': 500}}],
      services: {op: true, on: true, np: true, fk: false, cim: false, cof: false, cob: true, massage: true, anal: true, hj: true, '69': true, cuni: true, ani: {extraCost: 50}, shower: {extraCost: 50}, bdsm: false},
    },
  },
  {
    file: "sample16.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      services: {op: true, on: true, np: true, fk: false, cim: false, cof: false, cob: true, massage: true, anal: false, '69': true, shower: true, bdsm: true},
    },
  },
  {
    file: "sample17.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      services: {op: true, on: true, np: true, fk: false, cim: false, cof: false, cob: true, massage: true, anal: false, '69': true, shower: true, bdsm: {extraCost: 100}},
    },
  },
  {
    file: "sample18.txt",
      expected: {baseRates: {'30m': 200, '1h': 400, '1.5h': 550}, services: {op: true, on: true, np: true, cim: {extraCost: 100}, cob: true, '69': true}},
  },
  {
    file: "sample19.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500}, outcallRates: {'1h': 800, '2h': 1300},
      services: {op: true, on: true, np: true, fk: {extraCost: 100}, cim: false, cof: false, cob: true, massage: true, anal: false, hj: true, '69': true, gfe: true, pse: true, cuni: true, ani: true},
    },
  },
  {
    file: "sample20.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500}, outcallRates: {'1h': 1000},
      services: {fk: {extraCost: 50}},
    },
  },
  {
    file: "sample21.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500}, outcallRates: {'1h': 1000},
      services: {
        op: true, on: true, np: true, deepthroat: true, fk: {extraCost: 50},
        cim: false, cof: false, cob: true, massage: true, anal: false, hj: true, '69': true, gfe: true, pse: false,
        cuni: true, couples: true, shower: {extraCost: 50},
      },
    },
  },
  {
    file: "sample22.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      services: {
        op: true, on: true, np: true, fk: {extraCost: 100}, cob: true, massage: true, '69': true, gfe: true, cuni: true, ani: true, couples: true,
      },
    },
  },
  {
    file: "sample23.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 550}, outcallRates: {'2h': 2500},
      services: {
        op: true, on: true, np: true, fk: true, cof: true, cob: true, massage: true, anal: true, gfe: true, cuni: true, ani: true, bdsm: true,
      },
    },
  },
  {
    file: "sample24.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {cim: {extraCost: 50}, anal: {extraCost: 100}, cuni: false},
    },
  },
  {
    file: "sample25.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {cim: {extraCost: 50}, anal: {extraCost: 100}, cuni: false},
    },
  },
  {
    file: "sample26.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {on: {extraCost: 50}, cim: false, cof: false, anal: false, '69': true},
    },
  },
  {
    file: "sample27.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {op: {extraCost: 50}, on: {extraCost: 50}, np: true, hj: true, '69': true, cuni: true, ani: true},
    },
  },
  {
    file: "sample28.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400}, outcallRates: {'1h': 800},
      services: {
        op: true, on: true, np: true, deepthroat: true, fk: true, cim: {extraCost: 50}, cof: {extraCost: 50}, cob: true, anal: {extraCost: 100}, hj: true, gfe: true, couples: true, lesbyShow: true,
      },
    },
  },
  {
    file: "sample29.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400}, outcallRates: {'1h': 800},
      services: {op: true, on: true, np: true, deepthroat: true, fk: true, cim: {extraCost: 50}, cof: {extraCost: 50}, cob: true, massage: true, anal: {extraCost: 100}, hj: true, gfe: true, couples: true},
    },
  },
  {
    file: "sample30.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300, '1.5h': 400, '2h': 500}, outcallRates: {'1h': 450},
      services: {
        op: true, on: true, np: true, deepthroat: false, fk: true, cim: true, cof: {extraCost: 100}, cob: true, ap: true, anal: false, hj: true, gfe: true, cuni: true, ani: true, '3some': true, couples: true, bdsm: false,
      },
    },
  },
  {
    file: "sample31.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {op: true, on: true, np: true, deepthroat: true, fk: {extraCost: 50}, cim: false, cof: false, cob: true, anal: false, '69': false, gfe: true},
    },
  },
  {
    file: "sample32.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {op: true, on: true, np: true, cim: {extraCost: 50}, cof: {extraCost: 50}, deepthroat: true, '69': true, massage: true, hj: true, bdsm: true},
    },
  },
  {
    file: "sample33.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      rateOverrides: [{after: "22:00", rates: {'30m': 300, '1h': 500}}],
      services: {on: true, np: true, ani: true, cob: true, deepthroat: true, cim: {extraCost: 50}, massage: true, '69': true},
    },
  },
  {
    file: "sample34.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {op: true, on: true, np: true, '69': true, massage: true, cob: true, gfe: true, fk: true, cim: {extraCost: 50}, hj: true},
    },
  },
  {
    file: "sample35.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      rateOverrides: [{after: "22:00", rates: {'30m': 250, '1h': 450}}],
      services: {np: true, cim: {extraCost: 100}, cof: {extraCost: 50}, cob: true, massage: true, bdsm: {extraCost: 100}, '69': true},
    },
  },
  {
    file: "sample36.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {op: true, on: true, np: true, cob: true, massage: true, hj: true, '69': true, cuni: true, ani: true},
    },
  },
  {
    file: "sample37.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500}, outcallRates: {'1h': 700},
      services: {op: true, on: true, np: true, cob: true, massage: true, '69': true, bdsm: {extraCost: 100}},
    },
  },
  {
    file: "sample38.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300}, outcallRates: {'1h': 500},
      services: {op: true, on: true, np: true, cob: true, massage: true, gfe: true, '69': true},
    },
  },
  {
    file: "sample39.txt",
    expected: {
      baseRates: {},
      services: {op: true, on: true, np: true, fk: true, cim: true, cob: true, anal: false, '69': true, deepthroat: true, cuni: true, ani: true},
    },
  },
  {
    file: "sample40.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 450, '1.5h': 600, '2h': 750}, outcallRates: {'1h': 700},
      services: {np: true, fk: true, cim: true, cof: true, cob: true, ani: true, '69': true},
    },
  },
  {
    file: "sample41.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400, '1.5h': 600, '2h': 800},
      services: {op: true, on: true, np: true, fk: {extraCost: 50}, cob: true, massage: true, hj: true, gfe: true, prostateMassage: true, cim: {extraCost: 100}},
    },
  },
];

for (const sample of samples) {
  test(`extracts service details from ${sample.file}`, () => {
    expect(escortInfoExtractor.extractServiceDetails(readSample(sample.file))).toEqual(sample.expected);
  });
}

for (const file of ["false-sample1.txt", "false-sample2.txt", "false-sample3.txt", "false-sample4.txt", "false-sample5.txt"]) {
  test(`does not extract service details from ${file}`, () => {
    expect(escortInfoExtractor.extractServiceDetails(readSample(file))).toBeNull();
  });
}
