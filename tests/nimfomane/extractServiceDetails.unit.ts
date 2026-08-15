import {expect, test} from "@playwright/test";
import {readFileSync} from "node:fs";
import {escortInfoExtractor} from "../../src/nimfomane/core/escortInfoExtractor";
import type {ServiceDetails} from "../../src/nimfomane/core/escortInfoExtractor";

const readSample = (file: string): string => readFileSync(new URL(`./mocks/service-texts/${file}`, import.meta.url), "utf8");

const samples: Array<{file: string; expected: ServiceDetails}> = [
  {
    file: "sample1.txt",
    expected: {
      baseRates: {halfHour: 300, hour: 500},
      outcallRates: {},
      services: {
        op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, fk: {practiced: true},
        cim: {practiced: true}, cof: {practiced: true}, cob: {practiced: true},
        anal: {practiced: false}, handJob: {practiced: true}, sixtyNine: {practiced: true}, gfe: {practiced: true},
        cunnilingus: {practiced: true}, bdsm: {practiced: false},
      },
    },
  },
  {file: "sample2.txt", expected: {baseRates: {halfHour: 300, hour: 500}, outcallRates: {}, services: {}}},
  {
    file: "sample3.txt",
    expected: {
      baseRates: {halfHour: 250, hour: 400, hourAndHalf: 650, twoHours: 800},
      outcallRates: {},
      services: {
        op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, cim: {practiced: true, extraCost: 50}, cob: {practiced: true}, massage: {practiced: true},
        handJob: {practiced: true}, sixtyNine: {practiced: true}, threesome: {practiced: true}, couples: {practiced: true},
        dusImpreuna: {practiced: true}, bdsm: {practiced: true, extraCost: 100},
      },
    },
  },
  {
    file: "sample4.txt",
    expected: {
      baseRates: {halfHour: 300, hour: 500}, outcallRates: {hour: 800},
      services: {
        op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, fk: {practiced: true, extraCost: 150},
        cim: {practiced: false}, cof: {practiced: false}, cob: {practiced: false}, massage: {practiced: true}, anal: {practiced: false},
        handJob: {practiced: true}, sixtyNine: {practiced: true}, gfe: {practiced: true}, pse: {practiced: true},
        cunnilingus: {practiced: true}, anilingus: {practiced: true}, dusImpreuna: {practiced: true, extraCost: 100},
      },
    },
  },
  {
    file: "sample5.txt",
    expected: {
      baseRates: {halfHour: 200, hour: 300, hourAndHalf: 500}, outcallRates: {},
      services: {op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, cim: {practiced: true}, cob: {practiced: true}, massage: {practiced: true}, threesome: {practiced: true}},
    },
  },
  {
    file: "sample6.txt",
    expected: {
      baseRates: {halfHour: 200, hour: 300}, outcallRates: {},
      services: {
        op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, deepthroat: {practiced: true}, fk: {practiced: true},
        massage: {practiced: true}, cim: {practiced: true}, cob: {practiced: true}, ap: {practiced: true}, anal: {practiced: true}, sixtyNine: {practiced: true}, gfe: {practiced: true},
        prostateMassage: {practiced: true}, pse: {practiced: true}, cunnilingus: {practiced: true}, anilingus: {practiced: true},
        threesome: {practiced: true}, bdsm: {practiced: true},
      },
    },
  },
  {
    file: "sample7.txt",
    expected: {
      baseRates: {halfHour: 250, hour: 350}, outcallRates: {},
      services: {
        op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, deepthroat: {practiced: true}, fk: {practiced: true},
        cim: {practiced: true}, cof: {practiced: true}, cob: {practiced: true}, massage: {practiced: true}, anal: {practiced: false}, sixtyNine: {practiced: true}, gfe: {practiced: true}, prostateMassage: {practiced: true},
        pse: {practiced: true}, cunnilingus: {practiced: true}, anilingus: {practiced: true}, threesome: {practiced: true}, couples: {practiced: true},
        lesbyShow: {practiced: true},
      },
    },
  },
  {
    file: "sample8.txt",
    expected: {
      baseRates: {halfHour: 150, hour: 250, hourAndHalf: 350, twoHours: 500}, outcallRates: {},
      services: {on: {practiced: true}, normalProtected: {practiced: true}, fk: {practiced: true}, cim: {practiced: true}, cob: {practiced: true}, sixtyNine: {practiced: true}, gfe: {practiced: true}, cunnilingus: {practiced: true}},
    },
  },
  {
    file: "sample9.txt",
    expected: {
      baseRates: {halfHour: 150, hour: 250, hourAndHalf: 350, twoHours: 500}, outcallRates: {},
      services: {op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, fk: {practiced: true}, cim: {practiced: true}, cob: {practiced: true}, sixtyNine: {practiced: true}, cunnilingus: {practiced: true}},
    },
  },
  {
    file: "sample10.txt",
    expected: {
      baseRates: {halfHour: 200, hour: 400}, outcallRates: {},
      services: {op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, normalUnprotected: {practiced: false}, deepthroat: {practiced: true}, fk: {practiced: true}, cim: {practiced: true, extraCost: 50}, massage: {practiced: true}, anal: {practiced: false}, handJob: {practiced: true}, sixtyNine: {practiced: true}},
    },
  },
  {
    file: "sample11.txt",
    expected: {
      baseRates: {halfHour: 200, hour: 400}, outcallRates: {},
      services: {op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, deepthroat: {practiced: true}, fk: {practiced: true}, cob: {practiced: true}, massage: {practiced: true}, sixtyNine: {practiced: true}, cunnilingus: {practiced: true}, anilingus: {practiced: true}, dusImpreuna: {practiced: true}},
    },
  },
  {file: "sample12.txt", expected: {baseRates: {halfHour: 150, hour: 250}, outcallRates: {}, services: {op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, massage: {practiced: true}, sixtyNine: {practiced: true}}}},
  {file: "sample13.txt", expected: {baseRates: {halfHour: 150, hour: 250}, outcallRates: {}, services: {op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, massage: {practiced: true}, sixtyNine: {practiced: true}}}},
  {
    file: "sample14.txt",
    expected: {
      baseRates: {halfHour: 200, hour: 400}, outcallRates: {},
      services: {op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, deepthroat: {practiced: true, extraCost: 50}, fk: {practiced: true}, cim: {practiced: true, extraCost: 50}, cob: {practiced: true}, massage: {practiced: true}, gfe: {practiced: true}},
    },
  },
  {
    file: "sample15.txt",
    expected: {
      baseRates: {halfHour: 200, hour: 400}, outcallRates: {},
      services: {op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, fk: {practiced: false}, cim: {practiced: false}, cof: {practiced: false}, cob: {practiced: true}, massage: {practiced: true}, anal: {practiced: true}, handJob: {practiced: true}, sixtyNine: {practiced: true}, cunnilingus: {practiced: true}, anilingus: {practiced: true, extraCost: 50}, dusImpreuna: {practiced: true, extraCost: 50}, bdsm: {practiced: false}},
    },
  },
  {
    file: "sample16.txt",
    expected: {
      baseRates: {halfHour: 200, hour: 300}, outcallRates: {},
      services: {op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, fk: {practiced: false}, cim: {practiced: false}, cof: {practiced: false}, cob: {practiced: true}, massage: {practiced: true}, anal: {practiced: false}, sixtyNine: {practiced: true}, dusImpreuna: {practiced: true}, bdsm: {practiced: true}},
    },
  },
  {
    file: "sample17.txt",
    expected: {
      baseRates: {halfHour: 200, hour: 300}, outcallRates: {},
      services: {op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, fk: {practiced: false}, cim: {practiced: false}, cof: {practiced: false}, cob: {practiced: true}, massage: {practiced: true}, anal: {practiced: false}, sixtyNine: {practiced: true}, dusImpreuna: {practiced: true}, bdsm: {practiced: true, extraCost: 100}},
    },
  },
  {
    file: "sample18.txt",
      expected: {baseRates: {halfHour: 200, hour: 400, hourAndHalf: 550}, outcallRates: {}, services: {op: {practiced: true}, normalProtected: {practiced: true}, cim: {practiced: true, extraCost: 100}, cob: {practiced: true}, sixtyNine: {practiced: true}}},
  },
  {
    file: "sample19.txt",
    expected: {
      baseRates: {halfHour: 250, hour: 500}, outcallRates: {hour: 800, twoHours: 1300},
      services: {op: {practiced: true}, on: {practiced: true}, normalProtected: {practiced: true}, fk: {practiced: true, extraCost: 100}, cim: {practiced: false}, cof: {practiced: false}, cob: {practiced: true}, massage: {practiced: true}, anal: {practiced: false}, handJob: {practiced: true}, sixtyNine: {practiced: true}, gfe: {practiced: true}, pse: {practiced: true}, cunnilingus: {practiced: true}, anilingus: {practiced: true}},
    },
  },
];

for (const sample of samples) {
  test(`extracts service details from ${sample.file}`, () => {
    expect(escortInfoExtractor.extractServiceDetails(readSample(sample.file))).toEqual(sample.expected);
  });
}

for (const file of ["false-sample1.txt", "false-sample2.txt"]) {
  test(`does not extract service details from ${file}`, () => {
    expect(escortInfoExtractor.extractServiceDetails(readSample(file))).toBeNull();
  });
}
