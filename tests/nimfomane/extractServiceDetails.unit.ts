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
         cuni: true, domination: false, footfetish: true,
      },
    },
  },
  {file: "sample2.txt", expected: {baseRates: {'30m': 300, '1h': 500}}},
  {
    file: "sample3.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400, '1.5h': 650, '2h': 800},
      rateOverrides: [{after: "21:00", rates: {'1h': 500}}],
      schedule: [{start: '10:00', end: '21:00'}],
      services: {
        op: true, on: true, np: true, cim: {extraCost: 50}, cob: true, massage: true,
        hj: true, '69': true, '3some': true, couples: true, rolePlay: true,
         shower: true, domination: {extraCost: 100}, uro: {extraCost: 100}, footfetish: true,
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
         cuni: true, ani: true, shower: {extraCost: 100}, footfetish: {extraCost: 100},
      },
    },
  },
  {
    file: "sample5.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300, '1.5h': 500},
      schedule: [{days: 'luni-sambata', start: '12:00', end: '20:00'}],
      services: {op: true, on: true, np: true, cim: true, cob: true, massage: true, '3some': true},
    },
  },
  {
    file: "sample6.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      schedule: [{start: '10:00', end: '20:30'}],
      services: {
        op: true, on: true, np: true, deepthroat: true, fk: true,
        massage: true, cim: true, cob: true, ap: true, anal: true, '69': true, gfe: true,
        prostateMassage: true, pse: true, cuni: true, ani: true,
        '3some': true, domination: true,
      },
    },
  },
  {
    file: "sample7.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 350},
      schedule: [
        {days: 'luni-joi', start: '10:00', end: '20:30'},
        {days: 'vineri', start: '10:00', end: '16:00'},
      ],
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
      schedule: [{days: 'luni-vineri', start: '11:00', end: '19:00'}],
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
      services: {op: true, on: true, np: true, nn: false, deepthroat: true, fk: true, cim: {extraCost: 50}, massage: true, anal: false, hj: true, '69': true, footfetish: true},
    },
  },
  {
    file: "sample11.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {op: true, on: true, np: true, deepthroat: true, fk: true, cob: true, massage: true, '69': true, cuni: true, ani: true, shower: true},
    },
  },
  {file: "sample12.txt", expected: {baseRates: {'30m': 150, '1h': 250}, services: {op: true, on: true, np: true, massage: true, '69': true, footfetish: true}}},
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
       services: {op: true, on: true, np: true, fk: false, cim: false, cof: false, cob: true, massage: true, anal: true, hj: true, '69': true, cuni: true, ani: {extraCost: 50}, shower: {extraCost: 50}, facesitting: true, domination: false, uro: {extraCost: 100}, footfetish: true},
    },
  },
  {
    file: "sample16.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      services: {op: true, on: true, np: true, fk: false, cim: false, cof: false, cob: true, massage: true, anal: false, '69': true, shower: true, facesitting: true, domination: true, footfetish: true},
    },
  },
  {
    file: "sample17.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      schedule: [{days: 'luni-vineri', start: '10:00', end: '20:00'}],
      services: {op: true, on: true, np: true, fk: false, cim: false, cof: false, cob: true, massage: true, anal: false, '69': true, shower: true, facesitting: true, domination: {extraCost: 100}, footfetish: true},
    },
  },
  {
    file: "sample18.txt",
      expected: {baseRates: {'30m': 200, '1h': 400, '1.5h': 550}, schedule: [{days: 'luni-duminica', start: '11:00', end: '21:00'}], services: {op: true, on: true, np: true, cim: {extraCost: 100}, cob: true, deepthroat: false, '69': true}},
  },
  {
    file: "sample19.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500}, outcallRates: {'1h': 800, '2h': 1300},
       services: {op: true, on: true, np: true, fk: {extraCost: 100}, cim: false, cof: false, cob: true, massage: true, anal: false, hj: true, '69': true, gfe: true, pse: true, cuni: true, ani: true, uro: {extraCost: 100}, footfetish: true},
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
      schedule: [{start: '09:30', end: '22:30'}],
      services: {
         op: true, on: true, np: true, deepthroat: true, fk: {extraCost: 50},
        cim: false, cof: false, cob: true, massage: true, anal: false, hj: true, '69': true, gfe: true, pse: false,
         cuni: true, couples: true, shower: {extraCost: 50}, fingering: false, footfetish: {extraCost: 50},
      },
    },
  },
  {
    file: "sample22.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      services: {
         op: true, on: true, np: true, fk: {extraCost: 100}, cob: true, massage: true, '69': true, gfe: true, cuni: true, ani: true, couples: true, footfetish: true,
      },
    },
  },
  {
    file: "sample23.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 550}, outcallRates: {'2h': 2500},
      services: {
        op: true, on: true, np: true, fk: true, cof: true, cob: true, massage: true, anal: true, gfe: true, cuni: true, ani: true, domination: true,
      },
    },
  },
  {
    file: "sample24.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {cim: {extraCost: 50}, anal: {extraCost: 100}, cuni: false, fk: false},
    },
  },
  {
    file: "sample25.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {cim: {extraCost: 50}, anal: {extraCost: 100}, cuni: false, fk: false},
    },
  },
  {
    file: "sample26.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {on: {extraCost: 50}, cim: false, cof: false, anal: false, facesitting: true, '69': true},
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
         op: true, on: true, np: true, deepthroat: true, fk: true, cim: {extraCost: 50}, cof: {extraCost: 50}, cob: true, anal: {extraCost: 100}, hj: true, gfe: true, couples: true, lesbyShow: true, rolePlay: true, footfetish: true,
      },
    },
  },
  {
    file: "sample29.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400}, outcallRates: {'1h': 800},
        services: {op: true, on: true, np: true, deepthroat: true, fk: true, cim: {extraCost: 50}, cof: {extraCost: 50}, cob: true, massage: true, anal: {extraCost: 100}, hj: true, gfe: true, couples: true, rolePlay: true, footfetish: true},
    },
  },
  {
    file: "sample30.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300, '1.5h': 400, '2h': 500}, outcallRates: {'1h': 450},
       schedule: [{days: 'zilnic', start: '17:00', end: '07:00'}, {start: '07:00', end: '11:00'}],
      services: {
         op: true, on: true, np: true, deepthroat: false, facesitting: true, facefuck: false, fk: true, cim: true, cof: {extraCost: 100}, cob: true, ap: true, anal: false, hj: true, gfe: true, cuni: true, ani: true, '3some': true, couples: true, domination: false, uro: false, footfetish: true,
      },
    },
  },
  {
    file: "sample31.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
        services: {op: true, on: true, np: true, deepthroat: true, fk: {extraCost: 50}, cim: false, cof: false, cob: true, anal: false, '69': false, gfe: true, uro: false, footfetish: true},
    },
  },
  {
    file: "sample32.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
       services: {op: true, on: true, np: true, cim: {extraCost: 50}, cof: {extraCost: 50}, facesitting: true, '69': true, massage: true, hj: true, domination: true, footfetish: true},
    },
  },
  {
    file: "sample33.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      rateOverrides: [{after: "22:00", rates: {'30m': 300, '1h': 500}}],
      schedule: [{start: '10:00', end: '24:00'}],
      services: {on: true, np: true, ani: true, cob: true, deepthroat: true, cim: {extraCost: 50}, massage: true, '69': true},
    },
  },
  {
    file: "sample34.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
       services: {op: true, on: true, np: true, '69': true, massage: true, cob: true, gfe: true, fk: true, cim: {extraCost: 50}, hj: true, footfetish: true},
    },
  },
  {
    file: "sample35.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      rateOverrides: [{after: "22:00", rates: {'30m': 250, '1h': 450}}],
      schedule: [{start: '10:00', end: '00:00'}],
       services: {np: true, cim: {extraCost: 100}, cof: {extraCost: 50}, cob: true, massage: true, domination: {extraCost: 100}, uro: {extraCost: 50}, '69': true},
    },
  },
  {
    file: "sample36.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
       services: {op: true, on: true, np: true, cob: true, massage: true, hj: true, '69': true, cuni: true, ani: true, facesitting: true, footfetish: true},
    },
  },
  {
    file: "sample37.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500}, outcallRates: {'1h': 700},
       services: {op: true, on: true, np: true, cob: true, massage: true, '69': true, squirt: true, uro: {extraCost: 50}, domination: {extraCost: 100}},
    },
  },
  {
    file: "sample38.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300}, outcallRates: {'1h': 500},
       services: {op: true, on: true, np: true, cob: true, massage: true, gfe: true, '69': true, uro: {extraCost: 50}},
    },
  },
  {
    file: "sample40.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 450, '1.5h': 600, '2h': 750}, outcallRates: {'1h': 700},
       services: {np: true, fk: true, cim: true, cof: true, cob: true, ani: true, '69': true, uro: true, footfetish: true},
    },
  },
  {
    file: "sample41.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400, '1.5h': 600, '2h': 800},
      services: {op: true, on: true, np: true, fk: {extraCost: 50}, cob: true, massage: true, hj: true, gfe: true, prostateMassage: true, cim: {extraCost: 100}, uro: true, deepthroat: true},
    },
  },
  {
    file: "sample42.txt",
    expected: {
      baseRates: {'30m': 700, '1h': 1000},
      services: {
        op: true, on: true, np: true, deepthroat: true, facefuck: true, fk: true, cim: true, cof: true, cob: true,
         massage: true, anal: false, '69': true, gfe: true, pse: true, cuni: true, ani: true, '3some': true, couples: true, footfetish: true,
      },
    },
  },
  {
    file: "sample43.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        op: true, on: true, np: true, deepthroat: false, cim: {extraCost: 50}, cof: {extraCost: 50}, anal: false, '69': true, cob: true, massage: true,
        facefuck: false, footfetish: {extraCost: 50},
      },
    },
  },
  {
    file: "sample44.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      schedule: [{days: 'luni-vineri', start: '09:30', end: '19:30'}],
      services: {on: true, np: true, fk: true, cim: true, cuni: true, '69': true, gfe: true, massage: true, footfetish: true},
    },
  },
  {
    file: "sample45.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350},
      outcallRates: {'1h': 500},
      services: {on: true, deepthroat: true, cof: true, cob: true, massage: true, '69': true, shower: true},
    },
  },
  {
    file: "sample46.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300, '1.5h': 500, '2h': 600},
      schedule: [{start: '11:00', end: '22:00'}],
      services: {
        op: true, on: true, np: true, cob: true, '69': true, shower: true,
        footfetish: true, hj: true, rolePlay: true, massage: true, uro: true, domination: {extraCost: 100},
      },
    },
  },
  {
    file: "sample47.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {np: true, on: true, gfe: true, fk: true, cob: true, cuni: true, ani: true, '69': true, massage: true, footfetish: true},
    },
  },
  {
    file: "sample48.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400},
      outcallRates: {'1h': 600},
      services: {
        np: true, op: true, on: true, deepthroat: true, cim: true, cof: {extraCost: 50}, cob: true,
        couples: true, massage: true, footfetish: true, hj: true, fk: true,
      },
    },
  },
  {
    file: "sample49.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {anal: {extraCost: 100}, cim: {extraCost: 50}, fk: false, cuni: false},
    },
  },
  {
    file: "sample50.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300, '1.5h': 400, '2h': 500},
      outcallRates: {'1h': 450},
      schedule: [
        {days: 'zilnic', start: '17:00', end: '07:00'},
        {start: '07:00', end: '11:00'},
      ],
      services: {
        op: true, on: true, np: true, deepthroat: false, facesitting: true, facefuck: false, fk: true, cim: true, cof: {extraCost: 100},
        cob: true, uro: false, ap: true, anal: false, hj: true, gfe: true, cuni: true, ani: true,
        '3some': true, couples: true, domination: false, footfetish: true,
      },
    },
  },
  {
    file: "sample51.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      schedule: [
        {days: 'luni-sambata', start: '12:00', end: '21:00'},
        {days: 'duminica', start: '12:00', end: '18:00'},
      ],
      services: {
        op: true, on: true, np: true, deepthroat: true, cim: true, cof: true, cob: true, massage: true,
        uro: true, anal: true, hj: true, prostateMassage: true, cuni: true, ani: true, shower: true,
        domination: true, gfe: true, facefuck: true, footfetish: true,
      },
    },
  },
  {
    file: "sample52.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      services: {on: true, np: true, fk: true, cim: true, massage: true},
    },
  },
  {
    file: "sample53.txt",
    expected: {
      baseRates: {'30m': 200, '2h': 400},
      rateOverrides: [{after: "22:00", rates: {'30m': 250, '2h': 450}}],
      services: {'69': true, cob: {extraCost: 50}, massage: true, domination: true},
    },
  },
  {
    file: "sample54.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 450},
      schedule: [{start: '11:00', end: '21:00'}],
      services: {
        on: true, np: true, deepthroat: true, fk: {extraCost: 50}, cim: {extraCost: 50},
        cob: true, massage: true, '69': true, gfe: true, cuni: true, ani: true,
      },
    },
  },
  {
    file: "sample55.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        op: true, on: true, np: true, '69': true, fk: true, cuni: true,
        cim: {extraCost: 100}, cof: {extraCost: 50},
      },
    },
  },
  {
    file: "sample56.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      outcallRates: {'1h': 700},
      services: {
        op: true, on: true, np: true, deepthroat: true, facefuck: {extraCost: 50}, fk: {extraCost: 50},
        cob: true, shower: true, domination: {extraCost: 100}, fingering: {extraCost: 100},
      },
    },
  },
  {
    file: "sample57.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      services: {
        op: true, on: true, np: true, deepthroat: true, fk: {extraCost: 100},
        massage: true, hj: true, '69': true, gfe: true, cob: true,
        cim: false, cof: false, anal: false, footfetish: true,
      },
    },
  },
  {
    file: "sample58.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {
        op: true, on: true, np: true, fk: true, '69': true, massage: true,
        cob: true, hj: true, footfetish: true, cuni: true, ani: true,
        domSoft: true, domHard: true, uro: true, goldenShower: true,
        strapOn: true, fisting: true, verbalHum: true, whipping: true, spitting: true,
        gfe: true, prostateMassage: true,
      },
    },
  },
  {
    file: "sample59.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300},
    },
  },
  {
    file: "sample60.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      rateOverrides: [{after: "22:00", rates: {'30m': 300, '1h': 500}}],
      schedule: [{start: '01:00', end: '02:00'}],
      services: {
        op: true, on: true, np: true, facesitting: true, facefuck: false,
        cob: true, massage: true, '69': true, fingering: false,
      },
    },
  },
  {
    file: "sample61.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350},
      services: {
        np: true, '69': true, footfetish: true, hj: true, cob: true, massage: true,
      },
    },
  },
  {
    file: "sample62.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      rateOverrides: [{after: "22:00", rates: {'30m': 250, '1h': 500}}],
      services: {
        op: true, on: true, deepthroat: true, fk: {extraCost: 100}, cim: {extraCost: 100},
        cob: true, massage: true, hj: true, cuni: true, footfetish: true,
      },
    },
  },
  {
    file: "sample63.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      outcallRates: {'1h': 500},
      dominationRates: {'30m': 350, '1h': 500},
      services: {
        op: true, on: true, np: true, '69': true, cuni: true, ani: true,
        deepthroat: true, facesitting: true, cim: false, cof: true, cob: {extraCost: 100},
        massage: true, uro: {extraCost: 100}, anal: false, fisting: true,
        verbalHum: true, whipping: true, dirtyTalk: true, spitting: true,
        domination: true, footfetish: true,
      },
    },
  },
  {
    file: "sample64.txt",
    expected: {
      baseRates: {'1h': 400},
      services: {
        op: true, on: true, np: true, '69': true, cob: true, massage: true,
      },
    },
  },
  {
    file: "sample65.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400, '1.5h': 550, '2h': 700},
      schedule: [{start: '11:30', end: '22:00'}],
      services: {
        op: true, on: true, np: true, fk: true, cob: true, cof: {extraCost: 50},
        cim: {extraCost: 50}, '69': true, ani: true, footfetish: true, uro: {extraCost: 50},
      },
    },
  },
];

for (const sample of samples) {
  test(`extracts service details from ${sample.file}`, () => {
    expect(escortInfoExtractor.extractServiceDetails(readSample(sample.file))).toEqual(sample.expected);
  });
}

for (const file of ["false-sample1.txt", "false-sample2.txt", "false-sample3.txt", "false-sample4.txt", "false-sample5.txt", "false-sample6.txt", "false-sample7.txt", "false-sample8.txt", "false-sample9.txt", "false-sample10.txt", "false-sample11.txt", "false-sample12.txt", "false-positive10.txt"]) {
  test(`does not extract service details from ${file}`, () => {
    expect(escortInfoExtractor.extractServiceDetails(readSample(file))).toBeNull();
  });
}
