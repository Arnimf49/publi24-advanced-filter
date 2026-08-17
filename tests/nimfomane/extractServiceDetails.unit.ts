import {expect, test} from "@playwright/test";
import {readFileSync} from "node:fs";
import {escortInfoExtractor} from "../../src/nimfomane/core/escortInfoExtractor";
import type {ServiceDetails} from "../../src/nimfomane/core/escortInfoExtractor";

const readSample = (file: string): string => readFileSync(new URL(`./mocks/service-texts/${file}`, import.meta.url), "utf8");
const readFalseSample = (file: string): string => readSample(file).replace(/^#{3,4}[^\r\n]*(?:\r?\n){1,2}/, "");

const samples: Array<{file: string; expected: ServiceDetails}> = [
  {
    file: "sample1.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {
        op: true, on: true, np: true, fk: true,
        cim: true, cof: true, cob: true,
        ap: false, hj: true, '69': true, gfe: true,
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
        cim: false, cof: false, cob: false, massage: true, ap: false,
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
      schedule: [{start: "10:00", end: "20:30"}],
      services: {
        '69': true, op: true, on: true, np: true, deepthroat: true, fk: true,
        cim: true, cob: true, massage: true, ap: true, gfe: true,
        prostateMassage: true, pse: true, cuni: true, ani: true, '3some': true,
        domSoft: true,
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
        cim: true, cof: true, cob: true, massage: true, ap: false, '69': true, gfe: true, prostateMassage: true,
        pse: true, cuni: true, ani: true, '3some': true, couples: true,
        lesbyShow: true,
      },
    },
  },
  {
    file: "sample8.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 250, '1.5h': 350, '2h': 500},
      schedule: [{start: "11:00", end: "19:00", days: "luni-vineri"}],
      services: {
        '69': true, op: true, on: true, np: true, fk: true, cim: true,
        cob: true, gfe: true, cuni: true,
      },
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
      services: {op: true, on: true, np: true, nn: false, deepthroat: true, fk: true, cim: {extraCost: 50}, massage: true, ap: false, hj: true, '69': true, footfetish: true},
    },
  },
  {
    file: "sample11.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {op: true, on: true, np: true, deepthroat: true, fk: true, cob: true, massage: true, '69': true, cuni: true, ani: true, shower: true},
    },
  },
  {
    file: "sample12.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 250},
      services: {'69': true, op: true, on: true, np: true, fj: true, massage: true, footfetish: true},
    },
  },
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
       services: {op: true, on: true, np: true, fk: false, cim: false, cof: false, cob: true, massage: true, ap: true, hj: true, '69': true, cuni: true, ani: {extraCost: 50}, shower: {extraCost: 50}, facesitting: true, domination: false, uro: {extraCost: 100}, footfetish: true},
    },
  },
  {
    file: "sample16.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      services: {op: true, on: true, np: true, fk: false, cim: false, cof: false, cob: true, massage: true, ap: false, '69': true, shower: true, facesitting: true, domination: true, footfetish: true},
    },
  },
  {
    file: "sample17.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      schedule: [{days: 'luni-vineri', start: '10:00', end: '20:00'}],
      services: {op: true, on: true, np: true, fk: false, cim: false, cof: false, cob: true, massage: true, ap: false, '69': true, shower: true, facesitting: true, domination: {extraCost: 100}, footfetish: true},
    },
  },
  {
    file: "sample18.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400, '1.5h': 550},
      schedule: [{start: "11:00", end: "21:00", days: "luni-duminica"}],
      services: {'69': true, op: true, on: true, np: true, facesitting: true, cim: {extraCost: 100}, cob: true},
    },
  },
  {
    file: "sample19.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      outcallRates: {'1h': 800, '2h': 1300},
      services: {
        '69': true, op: true, on: true, np: true, fk: {extraCost: 100}, fj: true,
        cim: false, cof: false, cob: true, massage: true, uro: {extraCost: 100},
        ap: false, hj: true, gfe: true, pse: true, cuni: true, ani: true, footfetish: true,
      },
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
      baseRates: {'30m': 300, '1h': 500},
      outcallRates: {'1h': 1000},
      schedule: [{start: "09:30", end: "22:30"}],
      services: {
        '69': true, ap: false, cim: false, cob: true, cof: false, couples: true,
        cuni: true, deepthroat: true, fingering: false, fk: {extraCost: 50},
        footfetish: {extraCost: 50}, gfe: true, hj: true, massage: true, np: true,
        on: true, op: true, pse: false, shower: {extraCost: 50}, showerSex: true,
      },
    },
  },
  {
    file: "sample22.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      services: {'69': true, op: true, on: true, np: true, fk: {extraCost: 100}, fj: true, cob: true, massage: true, gfe: true, cuni: true, ani: true, couples: true, footfetish: true},
    },
  },
  {
    file: "sample23.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 550},
      outcallRates: {'2h': 2500},
      services: {op: true, on: true, np: true, fk: true, cof: true, cob: true, massage: true, ap: true, gfe: true, cuni: true, ani: true, domSoft: true},
    },
  },
  {
    file: "sample24.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {cim: {extraCost: 50}, ap: {extraCost: 100}, cuni: false, fk: false},
    },
  },
  {
    file: "sample25.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {cim: {extraCost: 50}, ap: {extraCost: 100}, cuni: false, fk: false},
    },
  },
  {
    file: "sample26.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {on: {extraCost: 50}, cim: false, cof: false, ap: false, facesitting: true, '69': true},
    },
  },
  {
    file: "sample27.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {'69': true, op: {extraCost: 50}, on: {extraCost: 50}, np: true, fj: true, hj: true, cuni: true, ani: true},
    },
  },
  {
    file: "sample28.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400},
      outcallRates: {'1h': 800},
      services: {op: true, on: true, np: true, deepthroat: true, fk: true, fj: true, cim: {extraCost: 50}, cof: {extraCost: 50}, cob: true, rolePlay: true, ap: {extraCost: 100}, hj: true, gfe: true, couples: true, lesbyShow: true, footfetish: true},
    },
  },
  {
    file: "sample29.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400},
      outcallRates: {'1h': 800},
      services: {op: true, on: true, np: true, deepthroat: true, fk: true, fj: true, cim: {extraCost: 50}, cof: {extraCost: 50}, cob: true, massage: true, rolePlay: true, ap: {extraCost: 100}, hj: true, gfe: true, couples: true, footfetish: true},
    },
  },
  {
    file: "sample30.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300, '1.5h': 400, '2h': 500},
      outcallRates: {'1h': 450},
      schedule: [{start: "17:00", end: "07:00", days: "zilnic"}, {start: "07:00", end: "11:00"}],
      services: {
        op: true, on: true, np: true, showerSex: true, deepthroat: false, facesitting: true,
        facefuck: false, fk: true, fj: true, cim: true, cof: {extraCost: 100}, cob: true,
        uro: false, ap: true, hj: true, gfe: true, cuni: true, ani: true,
        '3some': true, couples: true, domination: false, footfetish: true, swallow: {extraCost: 50},
      },
    },
  },
  {
    file: "sample31.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
        services: {op: true, on: true, np: true, deepthroat: true, fk: {extraCost: 50}, cim: false, cof: false, cob: true, ap: false, '69': false, gfe: true, uro: false, footfetish: true},
    },
  },
  {
    file: "sample32.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, deepthroat: true, fj: true,
        cim: {extraCost: 50}, cof: {extraCost: 50}, massage: true, hj: true,
        domSoft: true, domHard: true, footfetish: true,
      },
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
      schedule: [{start: "10:00", end: "00:00"}],
      services: {
        '69': true, op: true, on: true, np: true, cim: {extraCost: 100}, cof: {extraCost: 50},
        cob: true, massage: true, uro: {extraCost: 50}, domSoft: {extraCost: 100}, domHard: {extraCost: 100},
      },
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
      baseRates: {'30m': 250, '1h': 500},
      outcallRates: {'1h': 700},
      services: {'69': true, op: true, on: true, np: true, cob: true, massage: true, uro: {extraCost: 50}, squirt: {extraCost: 150}, domination: {extraCost: 100}},
    },
  },
  {
    file: "sample38.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300},
      outcallRates: {'1h': 500},
      services: {'69': true, op: true, on: true, np: true, fj: true, cob: true, massage: true, uro: {extraCost: 50}, gfe: true},
    },
  },
  {
    file: "sample40.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 450, '1.5h': 600, '2h': 750},
      outcallRates: {'1h': 700},
      services: {'69': true, op: true, on: true, np: true, fk: true, cim: true, cof: true, cob: true, uro: true, ani: true, footfetish: true},
    },
  },
  {
    file: "sample41.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400, '1.5h': 600, '2h': 800},
      services: {op: true, on: true, np: true, facesitting: true, fk: {extraCost: 50}, cim: {extraCost: 100}, cob: true, massage: true, uro: {extraCost: 100}, hj: true, gfe: true, prostateMassage: true},
    },
  },
  {
    file: "sample42.txt",
    expected: {
      baseRates: {'30m': 700, '1h': 1000},
      services: {'69': true, op: true, on: true, np: true, deepthroat: true, facefuck: true, fk: true, fj: true, cim: true, cof: true, cob: true, massage: true, ap: false, gfe: true, pse: true, cuni: true, ani: true, '3some': true, couples: true, footfetish: true},
    },
  },
  {
    file: "sample43.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, nn: false,
        facefuck: false, cim: {extraCost: 50}, cof: {extraCost: 50},
        cob: true, massage: true, ap: false, footfetish: {extraCost: 50}, swallow: false,
      },
    },
  },
  {
    file: "sample44.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      schedule: [{start: "09:30", end: "19:30", days: "luni-vineri"}],
      services: {'69': true, op: true, on: true, np: true, fk: true, cim: true, massage: true, gfe: true, cuni: true, footfetish: true},
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
      services: {
        '69': true, op: true, on: true, np: true, fk: true, cob: true,
        massage: true, gfe: true, cuni: true, ani: true, footfetish: true,
      },
    },
  },
  {
    file: "sample48.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400},
      outcallRates: {'1h': 600},
      services: {op: true, on: true, np: true, deepthroat: true, fk: true, cim: {extraCost: 50}, cof: {extraCost: 50}, cob: true, massage: true, hj: true, couples: true, footfetish: true},
    },
  },
  {
    file: "sample49.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {ap: {extraCost: 100}, cim: {extraCost: 50}, fk: false, cuni: false},
    },
  },
  {
    file: "sample50.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300, '1.5h': 400, '2h': 500},
      outcallRates: {'1h': 450},
      schedule: [{start: "17:00", end: "07:00", days: "zilnic"}, {start: "07:00", end: "11:00"}],
      services: {op: true, on: true, np: true, showerSex: true, deepthroat: false, facesitting: true, facefuck: false, fk: true, fj: true, cim: true, cof: {extraCost: 100}, cob: true, uro: false, ap: true, hj: true, gfe: true, cuni: true, ani: true, '3some': true, couples: true, domination: false, footfetish: true, swallow: {extraCost: 50}},
    },
  },
  {
    file: "sample51.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      schedule: [
        {start: '12:00', end: '21:00', days: 'luni-sambata'},
        {start: '12:00', end: '18:00', days: 'duminica'},
      ],
      services: {
        ap: {extraCost: 100}, ani: true, cim: {extraCost: 100}, cob: true, cof: {extraCost: 100}, cuni: true,
        deepthroat: true, domSoft: true, facefuck: {extraCost: 100}, fj: true, footfetish: true,
        gfe: true, hardSex: false, hj: true, massage: true, np: true, on: true, op: true,
        prostateMassage: true, shower: {extraCost: 100}, showerSex: {extraCost: 100}, spitting: true,
        strapOn: true, uro: {extraCost: 100},
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
      services: {
        '69': true, op: true, on: true, np: true, cob: {extraCost: 50},
        massage: true, domSoft: true, domHard: true,
      },
    },
  },
  {
    file: "sample54.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 450},
      schedule: [{start: "11:00", end: "21:00"}],
      services: {'69': true, op: true, on: true, np: true, deepthroat: true, fk: {extraCost: 50}, cim: {extraCost: 50}, cob: true, massage: true, gfe: true, cuni: true, ani: true},
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
      services: {op: true, on: true, np: true, deepthroat: true, facefuck: {extraCost: 50}, fk: {extraCost: 50}, cob: true, shower: true, domination: {extraCost: 100}, fingering: {extraCost: 100}},
    },
  },
  {
    file: "sample57.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      services: {
        '69': true, op: true, on: true, np: true, facesitting: true,
        fk: {extraCost: 100}, cim: false, cof: false, cob: true,
        massage: true, ap: false, hj: true, gfe: true, footfetish: true,
      },
    },
  },
  {
    file: "sample58.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {'69': true, op: true, on: true, np: true, fk: true, fj: true, cob: true, massage: true, uro: true, hj: true, gfe: true, prostateMassage: true, cuni: true, ani: true, domSoft: true, domHard: true, verbalHum: true, whipping: true, spitting: true, strapOn: true, fisting: true, goldenShower: true, footfetish: true, facesitting: true},
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
        op: true, on: true, np: true, facesitting: true,
        fk: {extraCost: 100}, cim: {extraCost: 100}, cob: true,
        massage: true, hj: true, cuni: true, footfetish: true,
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
        massage: true, uro: {extraCost: 100}, ap: false, fisting: true,
        verbalHum: true, whipping: true, dirtyTalk: true, spitting: true,
        domination: true, footfetish: true,
      },
    },
  },
  {
    file: "sample64.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
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
  {
    file: "sample66.txt",
    expected: {
      baseRates: {'30m': 100, '1h': 200},
      services: {
        op: true, on: true, np: true, cim: true, cob: true,
      },
    },
  },
  {
    file: "sample67.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      services: {
        '69': true, op: true, on: true, np: true, deepthroat: true, facesitting: true,
        fk: true, fj: true, cim: {extraCost: 100}, cob: true, massage: true,
        uro: {extraCost: 50}, ap: false, hj: true, gfe: true, ani: true, couples: true,
        fingering: false,
      },
    },
  },
  {
    file: "sample68.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 450},
      outcallRates: {'1h': 800},
      services: {
        '69': true, op: true, np: true, facesitting: true, cim: false,
        cof: false, cob: true, massage: {extraCost: 50}, hj: true,
        cuni: true, ani: true, footfetish: true,
      },
    },
  },
  {
    file: "sample69.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      rateOverrides: [{after: "22:00", rates: {'30m': 250, '1h': 450}}],
      schedule: [{start: "10:00", end: "00:00"}],
      services: {
        '69': true, op: true, on: true, np: true, cim: {extraCost: 100},
        cof: {extraCost: 50}, cob: true, massage: true, uro: {extraCost: 50},
        domSoft: {extraCost: 100}, domHard: {extraCost: 100},
      },
    },
  },
  {
    file: "sample70.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      schedule: [{start: "11:00", end: "21:00"}],
      services: {
        '69': true, np: true, cob: {extraCost: 50}, cuni: true, ani: true,
        fingering: true,
      },
    },
  },
  {
    file: "sample71.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, np: true, cob: {extraCost: 50}, massage: true, cuni: true,
        ani: true, shower: true, fingering: true,
      },
    },
  },
  {
    file: "sample72.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      schedule: [{start: "08:00", end: "16:00"}],
      services: {
        '69': false, op: true, on: true, np: true, fk: false, hardSex: false,
        cim: false, cof: false, cob: false, massage: true, cuni: false, ani: false,
        fingering: false,
      },
    },
  },
  {
    file: "sample73.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      services: {
        op: true, on: true, np: true, fk: {extraCost: 50},
        cim: {extraCost: 50}, cof: {extraCost: 50}, cob: true, massage: true,
      },
    },
  },
  {
    file: "sample74.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      rateOverrides: [{after: "22:00", rates: {'30m': 250, '1h': 450}}],
      schedule: [{start: "10:00", end: "00:00"}],
      services: {
        op: true, on: true, np: true, cim: {extraCost: 100}, cof: {extraCost: 50},
        cob: true, massage: true, uro: {extraCost: 100},
        domSoft: {extraCost: 100}, domHard: {extraCost: 100},
      },
    },
  },
  {
    file: "sample75.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      schedule: [
        {start: "14:00", end: "21:00", days: "marti"},
        {start: "09:00", end: "21:00", days: "miercuri"},
        {start: "09:00", end: "19:00", days: "joi"},
      ],
      services: {
        op: true, on: true, np: true, massage: true,
        goldenShower: {extraCost: 50}, footfetish: {extraCost: 50},
      },
    },
  },
  {
    file: "sample76.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      services: {
        '69': true, op: true, on: true, np: true, fj: {extraCost: 50},
        cim: {extraCost: 100}, cob: true, massage: true, uro: {extraCost: 50},
        rolePlay: true, cuni: true,
      },
    },
  },
  {
    file: "sample77.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, cob: true, facesitting: true, fk: {extraCost: 50},
        massage: true, cuni: true, footfetish: true,
      },
    },
  },
  {
    file: "sample78.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500, '1.5h': 700},
      services: {
        '69': true, op: false, on: false, np: true,
        showerSex: {extraCost: 50}, facesitting: true, fk: {extraCost: 50},
        cim: false, cof: false, massage: true, ap: false, hj: true,
        footfetish: {extraCost: 50},
      },
    },
  },
  {
    file: "sample79.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      rateOverrides: [{after: "22:00", rates: {'30m': 250, '1h': 500}}],
      services: {
        op: true, on: true, np: true, fk: true, cim: false, cof: false,
        massage: {extraCost: 100}, ap: false, cob: true, gfe: true,
      },
    },
  },
  {
    file: "sample80.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      schedule: [{start: "10:00", end: "20:00"}],
      services: {'69': true, op: true, on: true, fk: true, massage: true, gfe: true},
    },
  },
  {
    file: "sample81.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350},
      services: {
        '69': true, op: true, on: true, np: true, cim: false, cob: true,
        massage: true, ap: false, hj: true, gfe: true,
      },
    },
  },
  {
    file: "sample82.txt",
    expected: {
      baseRates: {'30m': 600, '1h': 1200},
      services: {
        gfe: true, pse: true, fk: true, deepthroat: true, cim: true,
        cof: true, cob: true, '69': true, massage: true, domination: true,
      },
    },
  },
  {
    file: "sample83.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      services: {
        '69': true, op: true, on: true, np: true, facesitting: true,
        fk: {extraCost: 100}, cim: {extraCost: 100}, cof: {extraCost: 100},
        cob: true, swallow: {extraCost: 100}, massage: true, uro: {extraCost: 100},
        prostateMassage: {extraCost: 100}, shower: {extraCost: 50},
      },
    },
  },
  {
    file: "sample84.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      services: {
        '69': true, op: true, on: true, np: true, facesitting: true,
        fk: {extraCost: 100}, cim: {extraCost: 100}, cof: {extraCost: 100},
        cob: true, swallow: {extraCost: 100}, massage: true, uro: {extraCost: 100},
        prostateMassage: {extraCost: 100}, shower: {extraCost: 50},
      },
    },
  },
  {
    file: "sample85.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      services: {
        op: true, on: true, np: true, cim: {extraCost: 100},
        cob: {extraCost: 50}, massage: true,
      },
    },
  },
  {
    file: "sample86.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        op: true, on: true, cim: false, cob: true,
        ap: false, hj: true, footfetish: true, fingering: false,
      },
    },
  },
  {
    file: "sample87.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350},
      services: {
        fk: true, cim: {extraCost: 50}, massage: true,
        uro: {extraCost: 50}, gfe: true,
        prostateMassage: {extraCost: 100},
      },
    },
  },
  {
    file: "sample88.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, deepthroat: true,
        fk: false, fj: true, cim: false, cof: false, cob: false,
        massage: true, ap: false, hj: true, footfetish: true,
        fingering: false,
      },
    },
  },
  {
    file: "sample89.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        cim: false, cof: false, ap: false, domination: false,
      },
    },
  },
  {
    file: "sample90.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350},
      services: {
        '69': true, op: false, on: false, np: true,
        fk: false, massage: true, ap: false,
      },
    },
  },
  {
    file: "sample91.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, facesitting: true,
        fk: {extraCost: 50}, cim: {extraCost: 100}, cob: true, massage: true, ap: false,
        hj: true, gfe: true, cuni: true, shower: {extraCost: 50}, footfetish: true,
      },
    },
  },
  {
    file: "sample92.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      rateOverrides: [{after: "22:00", rates: {'30m': 250, '1h': 500}}],
      services: {
        '69': true, op: true, on: {extraCost: 50}, np: true, fk: true,
        cim: false, cof: false, cob: {extraCost: 50}, massage: true,
        uro: {extraCost: 50}, ap: false, gfe: {extraCost: 50},
        cuni: true, shower: {extraCost: 50}, footfetish: true,
      },
    },
  },
  {
    file: "sample93.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300, '1.5h': 400},
      services: {
        facefuck: {extraCost: 50}, fk: {extraCost: 50},
        cim: {extraCost: 50}, cof: {extraCost: 50}, swallow: {extraCost: 50}, massage: true,
        uro: {extraCost: 50}, shower: true, ani: {extraCost: 50},
        domination: {extraCost: 50},
      },
    },
  },
  {
    file: "sample94.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300, '1.5h': 400},
      services: {
        '69': true, op: true, on: true, np: true, deepthroat: true,
        fk: {extraCost: 50}, cim: {extraCost: 50}, cof: {extraCost: 50},
        cob: true, swallow: {extraCost: 50}, massage: true, uro: true, ani: {extraCost: 50}, shower: true,
      },
    },
  },
  {
    file: "sample95.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      rateOverrides: [{after: "22:00", rates: {'30m': 350, '1h': 550}}],
      services: {
        '69': true, on: {extraCost: 50}, nn: false, fk: {extraCost: 50},
        cof: false, cob: {extraCost: 50}, massage: true, ap: false, fingering: false,
      },
    },
  },
  {
    file: "sample96.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      services: {
        op: true, on: {extraCost: 50}, massage: true, footfetish: true, '69': true,
        fk: {extraCost: 50}, uro: {extraCost: 50}, cob: {extraCost: 50},
      },
    },
  },
  {
    file: "sample97.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      services: {
        '69': true, on: true, np: true, deepthroat: true, facefuck: true, fk: true,
        cim: {extraCost: 100}, cof: {extraCost: 100}, massage: true,
        uro: {extraCost: 50}, rolePlay: true, domSoft: true, domHard: {extraCost: 100},
        footfetish: true,
      },
    },
  },
  {
    file: "sample98.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      outcallRates: {'1h': 600},
      services: {
        '69': true, op: true, on: true, np: true, facesitting: true, cob: true, massage: true,
        uro: {extraCost: 100}, ap: {extraCost: 100}, cuni: true, ani: true,
        spitting: true, domination: true, strapOn: true, footfetish: true,
      },
    },
  },
  {
    file: "sample99.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350},
      outcallRates: {'1h': 500},
      services: {
        '69': true, op: true, on: true, np: true, fk: {extraCost: 50},
        cuni: true, cob: {extraCost: 50}, fingering: {extraCost: 50},
      },
    },
  },
  {
    file: "sample100.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300},
      services: {
        '69': true, op: true, on: true, np: true, nn: false, fj: true,
        cim: false, cof: false, cob: {extraCost: 50}, massage: true,
        ap: false, hj: true, gfe: true, shower: {extraCost: 50}, domination: false,
      },
    },
  },
  {
    file: "sample101.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300},
      services: {
        '69': true, op: true, on: true, np: true, deepthroat: true,
        facefuck: {extraCost: 50}, fk: {extraCost: 50}, massage: true,
        uro: {extraCost: 50}, ap: {extraCost: 100}, gfe: true, shower: true,
      },
    },
  },
  {
    file: "sample102.txt",
    expected: {
      baseRates: {'30m': "100€", '1h': "200€"},
    },
  },
  {
    file: "sample103.txt",
    expected: {
      baseRates: {'1h': 550, '1.5h': 820, '2h': 1100},
      outcallRates: {'1h': 650},
      services: {
        '69': true, deepthroat: true, facesitting: true, fk: true, cim: true, cob: true,
        massage: true, uro: {extraCost: 50}, squirt: {extraCost: 50},
        ap: {extraCost: 100}, cuni: true, ani: false, shower: true,
        domination: false, fisting: {extraCost: 150}, footfetish: true,
      },
    },
  },
  {
    file: "sample104.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      schedule: [{start: "10:00", end: "22:00"}],
      services: {
        '69': true, op: true, on: true, np: true, fk: true, cim: false,
        cof: {extraCost: 100}, cob: true, massage: true, uro: {extraCost: 100},
        ap: false, gfe: true, prostateMassage: {extraCost: 100}, cuni: true,
        ani: true, shower: {extraCost: 100}, footfetish: true, fingering: false,
      },
    },
  },
  {
    file: "sample105.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      outcallRates: {'1h': 600},
      schedule: [{start: "10:30", end: "23:30"}],
      services: {
        op: true, on: {extraCost: 50}, np: true, showerSex: {extraCost: 100},
        fk: {extraCost: 100}, cob: {extraCost: 50}, uro: {extraCost: 100},
        ap: false, shower: true,
      },
    },
  },
  {
    file: "sample106.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 400, '1.5h': 750},
      services: {
        '69': true, on: {extraCost: 50}, facesitting: true, fk: true, cim: true,
        cof: false, cob: true, massage: true, uro: {extraCost: 50}, ap: true,
        gfe: true, prostateMassage: true, cuni: true, ani: true, domSoft: true,
        strapOn: {extraCost: 50}, footfetish: true,
      },
    },
  },
  {
    file: "sample107.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {
        '69': true, op: true, on: {extraCost: 200}, np: true, fk: false, hardSex: false,
        cim: {extraCost: 200}, cob: true, massage: true, hj: true, cuni: true,
        ani: false, fingering: true,
      },
    },
  },
  {
    file: "sample108.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450},
      outcallRates: {'1h': 650},
      services: {
        fk: {extraCost: 50}, cim: {extraCost: 100}, domination: true, strapOn: true,
      },
    },
  },
  {
    file: "sample109.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300},
      schedule: [{start: "10:00", end: "00:00"}],
      services: {
        '69': true, op: true, on: true, np: true, deepthroat: true, fk: true,
        fj: true, cim: true, cob: true, uro: true, ap: {extraCost: 100},
        hj: true, gfe: true, couples: false,
      },
    },
  },
  {
    file: "sample110.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, deepthroat: true,
        facesitting: true, cim: false, cof: false, cob: true,
        massage: true, ap: false, hj: true, cuni: true, ani: true,
        couples: true, footfetish: {extraCost: 50},
      },
    },
  },
  {
    file: "sample111.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, fk: {extraCost: 50},
        cim: {extraCost: 100}, massage: true, rolePlay: true, hj: true,
        footfetish: true,
      },
    },
  },
  {
    file: "sample112.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      services: {
        '69': true, on: false, showerSex: {extraCost: 100}, cim: false,
        cof: false, massage: true, uro: {extraCost: 50}, ap: false,
        shower: true, domSoft: {extraCost: 100}, domHard: {extraCost: 100},
        verbalHum: true, whipping: true, spitting: true, strapOn: true,
        footfetish: {extraCost: 50},
      },
    },
  },
  {
    file: "sample113.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      dominationRates: {'1h': 600},
      services: {
        '69': true, np: true, massage: true, hj: true, domination: true,
      },
    },
  },
  {
    file: "sample114.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      services: {
        '69': true, op: true, on: true, np: true, fk: true, fj: true,
        cim: true, cof: true, cob: true, massage: true, uro: true,
        hj: true, gfe: true, cuni: true, ani: true, shower: true,
      },
    },
  },
  {
    file: "sample115.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400, '1.5h': 600, '2h': 800},
      services: {
        '69': true, op: true, on: true, np: true, ani: true,
        facesitting: true, cim: {extraCost: 50}, fk: false,
        domination: false, fingering: false,
      },
    },
  },
  {
    file: "sample116.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300, '1.5h': 450},
      services: {
        '69': false, op: true, on: true, np: true, cob: true,
        ap: false, cuni: false, ani: {extraCost: 50}, swallow: {extraCost: 100},
      },
    },
  },
  {
    file: "sample117.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300, '1.5h': 450},
      services: {
        '69': false, op: true, on: true, np: true, facefuck: true, fk: true,
        cob: true, ap: false, ani: {extraCost: 50}, swallow: {extraCost: 100},
      },
    },
  },
  {
    file: "sample118.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      outcallRates: {'1h': 600},
      dominationRates: {'1h': 500},
      services: {
        op: true, on: true, np: true, fk: false, cim: false, cof: false,
        cob: {extraCost: 50}, massage: true, uro: {extraCost: 100},
        ap: false, domination: true, footfetish: {extraCost: 50},
      },
    },
  },
  {
    file: "sample119.txt",
    expected: {
      baseRates: {'1h': 400, '1.5h': 650},
      services: {
        '69': true, op: true, on: true, cim: false, cof: false, cob: true,
        massage: true, uro: false, ap: false, couples: true,
      },
    },
  },
  {
    file: "sample120.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300},
      services: {
        '69': true, op: true, on: true, np: true, nn: false, cob: true,
        massage: true, ap: false, hj: true, cuni: true, footfetish: true,
        domination: false,
      },
    },
  },
  {
    file: "sample121.txt",
    expected: {
      baseRates: {'30m': 200},
      schedule: [{start: "08:00", end: "22:00"}],
      services: {
        '69': {extraCost: 50}, op: true, on: {extraCost: 100}, np: true,
        massage: true, ap: false, cuni: {extraCost: 50},
      },
    },
  },
  {
    file: "sample122.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      outcallRates: {'1h': 600},
      services: {
        op: true, on: true, np: true, fk: {extraCost: 50},
        cim: {extraCost: 50}, cof: true, ani: {extraCost: 50},
        couples: true, lesbyShow: true,
      },
    },
  },
  {
    file: "sample123.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300},
      services: {
        '69': true, op: true, on: true, np: true, fk: true, cim: false,
        cof: false, cob: true, massage: true, ap: {extraCost: 100},
        gfe: true, shower: true,
      },
    },
  },
  {
    file: "sample124.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300},
      services: {
        '69': true, op: true, on: true, np: true, nn: false, fj: true,
        cim: false, cof: {extraCost: 100}, cob: {extraCost: 50},
        massage: true, ap: false, hj: true, cuni: true, ani: true,
        shower: {extraCost: 50}, domination: false,
      },
    },
  },
  {
    file: "sample125.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      rateOverrides: [{after: "22:00", rates: {'30m': 250, '1h': 500}}],
      services: {
        '69': true, op: true, on: true, np: true, facesitting: true,
        facefuck: false, fk: {extraCost: 100}, hardSex: false,
        cim: {extraCost: 50}, cob: true, massage: true, hj: true,
      },
    },
  },
  {
    file: "sample126.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350},
      services: {
        '69': true, facesitting: true, cim: {extraCost: 50}, cob: true,
        massage: true, squirt: {extraCost: 100}, ap: {extraCost: 100},
        cuni: true, ani: true, shower: true,
      },
    },
  },
  {
    file: "sample127.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      services: {
        '69': true, op: true, on: true, np: true, fk: {extraCost: 50}, fj: true,
        cim: {extraCost: 50}, cof: {extraCost: 50}, cob: true, swallow: {extraCost: 100}, massage: true,
        gfe: true, '3some': true, couples: true, shower: true,
      },
    },
  },
  {
    file: "sample128.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      services: {
        '69': true, op: true, on: true, np: true, fk: {extraCost: 50},
        fj: true, cim: {extraCost: 50}, cof: {extraCost: 50}, cob: true,
        swallow: {extraCost: 100}, massage: true, gfe: true, '3some': true,
        couples: true, shower: true,
      },
    },
  },
  {
    file: "sample129.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        op: true, on: true, np: true, massage: true, uro: {extraCost: 50},
        gfe: true, cuni: true, ani: true, footfetish: true,
      },
    },
  },
  {
    file: "sample130.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        op: true, on: true, np: true, facesitting: true, hardSex: true,
        fk: {extraCost: 50}, cob: true, massage: true, gfe: true, pse: true,
        cuni: true, footfetish: true,
      },
    },
  },
  {
    file: "sample131.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      schedule: [{start: "09:00", end: "19:00"}],
      services: {
        '69': true, op: true, on: true, facesitting: true, fk: false, fj: true,
        cim: false, cof: false, cob: false, massage: true, uro: {extraCost: 50},
        hj: true, cuni: true, ani: true, domSoft: true, domHard: true,
        footfetish: true, ap: {extraCost: 100},
      },
    },
  },
  {
    file: "sample132.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400},
      schedule: [{start: "10:00", end: "22:00", days: "luni-sambata"}],
      services: {
        '69': true, op: true, on: true, np: true, fk: {extraCost: 50},
        cim: {extraCost: 50}, cof: {extraCost: 50}, cob: true, gfe: true,
        pse: true, cuni: true, ani: true, ap: false,
      },
    },
  },
  {
    file: "sample133.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350, '1.5h': 500},
      services: {
        '69': true, op: true, on: true, np: true, fj: true, hardSex: false,
        cim: {extraCost: 100}, cof: {extraCost: 50}, massage: true, hj: true,
        gfe: true,
      },
    },
  },
  {
    file: "sample134.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350, '1.5h': 500},
      services: {
        '69': false, op: true, on: true, np: true, fk: {extraCost: 100},
        fj: false, cim: {extraCost: 100}, cof: {extraCost: 50}, cob: true,
        massage: false, hj: false, ani: true, shower: true,
      },
    },
  },
  {
    file: "sample135.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, fj: true,
        cob: {extraCost: 50}, massage: true, prostateMassage: true,
        cuni: true, domSoft: true,
      },
    },
  },
  {
    file: "sample136.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      outcallRates: {'1h': 800},
      services: {
        '69': true, op: true, on: true, np: true, fj: true, fk: true, cim: true, cof: true,
        cob: true, massage: true, uro: {extraCost: 50}, hj: true, cuni: true,
        ani: true, couples: true, shower: true, footfetish: true, ap: false,
      },
    },
  },
  {
    file: "sample137.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      dominationRates: {'30m': 250, '1h': 500},
      services: {
        '69': true, op: true, on: true, np: true, facesitting: true,
        cim: {extraCost: 50}, massage: true, uro: {extraCost: 50},
        prostateMassage: {extraCost: 50}, cuni: true, ani: true,
        domination: true, fisting: true, footfetish: true,
      },
    },
  },
  {
    file: "sample138.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, cob: true, massage: true,
      },
    },
  },
  {
    file: "sample139.txt",
    expected: {
      baseRates: {'30m': 200},
      services: {
        '69': true, op: true, np: true, facesitting: true,
        cob: {extraCost: 50}, massage: true,
      },
    },
  },
  {
    file: "sample140.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, fk: false, fj: true,
        cim: false, cof: false, cob: true, massage: true, hj: true,
        gfe: true, ap: false,
      },
    },
  },
  {
    file: "sample141.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, fk: false, fj: true,
        cim: false, cof: false, cob: true, massage: true, hj: true,
        gfe: true, ap: false,
      },
    },
  },
  {
    file: "sample142.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, fk: true,
        cim: {extraCost: 100}, cof: {extraCost: 50}, cob: true,
        massage: true, gfe: true,
      },
    },
  },
  {
    file: "sample143.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      dominationRates: {'30m': 300, '1h': 500},
      services: {
        '69': true, op: true, np: true, facesitting: true, fj: true,
        cob: {extraCost: 50}, massage: true, uro: {extraCost: 50}, hj: true,
        prostateMassage: true, cuni: true, shower: {extraCost: 50},
        domination: true, footfetish: {extraCost: 50}, ap: false,
      },
    },
  },
  {
    file: "sample144.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400, '1.5h': 600, '2h': 800},
      outcallRates: {'1h': 600},
      services: {
        op: true, on: {extraCost: 100}, np: true, deepthroat: true,
        facesitting: true, facefuck: true, fk: true, hardSex: false, cim: true,
        cof: true, cob: true, swallow: false, massage: true, uro: true,
        squirt: true, ap: true, hj: true, gfe: true, prostateMassage: true,
        ani: {extraCost: 800}, couples: true, verbalHum: true, whipping: true,
        spitting: true, domination: true, strapOn: {extraCost: 100},
        fisting: true, footfetish: true, fingering: false,
      },
    },
  },
  {
    file: "sample145.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 600},
      outcallRates: {'1h': 1000},
      services: {
        '69': true, op: true, on: true, fk: true, cob: true,
        massage: true, shower: true, footfetish: true,
      },
    },
  },
  {
    file: "sample146.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 600},
      services: {
        '69': true, op: true, on: true, deepthroat: true, facesitting: true,
        facefuck: true, fk: true, cim: true, cof: true, cob: true,
        swallow: true, pse: true, ani: {extraCost: 50}, dirtyTalk: true,
        domination: false, fingering: true,
      },
    },
  },
  {
    file: "sample147.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, cim: {extraCost: 50},
        swallow: false, massage: {extraCost: 100}, uro: {extraCost: 50},
        hj: true, gfe: true, cuni: true, ani: true,
        domSoft: {extraCost: 50}, domHard: {extraCost: 100},
        fingering: false, ap: false,
      },
    },
  },
  {
    file: "sample148.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        op: true, on: true, np: true,
        domSoft: {extraCost: 50}, domHard: {extraCost: 100},
        uro: {extraCost: 50},
      },
    },
  },
  {
    file: "sample149.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      schedule: [{start: "08:00", end: "20:00", days: "luni-vineri"}],
      services: {
        '69': true, op: true, on: true, np: true, fk: {extraCost: 50},
        cim: true, cof: {extraCost: 50}, cob: true, massage: true,
        uro: {extraCost: 50}, gfe: true, cuni: true, domSoft: true,
        ap: true, hardSex: false,
      },
    },
  },
  {
    file: "sample150.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400, '1.5h': 600},
      services: {
        op: true, on: true, np: true, fk: {extraCost: 50},
        cim: {extraCost: 50}, cob: true, massage: true, gfe: true,
        pse: true, ap: {extraCost: 100},
      },
    },
  },
  {
    file: "sample151.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, cob: true,
        massage: true,
      },
    },
  },
  {
    file: "sample152.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, fj: true,
        footfetish: {extraCost: 50}, cob: {extraCost: 50},
        massage: true, hj: true, ani: true,
      },
    },
  },
  {
    file: "sample153.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 500},
      schedule: [{start: "10:00", end: "22:00"}],
      services: {
        fk: true, gfe: {extraCost: 50}, cim: {extraCost: 100},
      },
    },
  },
  {
    file: "sample154.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      services: {
        '69': true, op: true, on: true, np: true, cim: true,
        squirt: {extraCost: 100}, gfe: true, '3some': true,
      },
    },
  },
  {
    file: "sample155.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: true, np: true, deepthroat: true,
        fk: false, fj: true, cim: false, cof: false, cob: true,
        massage: true, cuni: true, ani: true, shower: true,
        footfetish: true, fingering: false, ap: false,
      },
    },
  },
  {
    file: "sample156.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, np: true, deepthroat: true, fk: false, cim: false, cof: false,
        cob: true, massage: true, cuni: true, ani: true, shower: true,
        footfetish: true, fingering: false, ap: false,
      },
    },
  },
  {
    file: "sample157.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      outcallRates: {'1h': 600},
      services: {
        op: true, on: true, np: true, fk: true,
        cim: {extraCost: 50}, cob: true, massage: true,
        gfe: true, cuni: true, deepthroat: true,
      },
    },
  },
  {
    file: "sample158.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: {extraCost: 50}, on: {extraCost: 50},
        np: true, facesitting: true, cim: false, cof: false, cob: true,
        massage: true, uro: {extraCost: 100}, ani: true,
        domSoft: {extraCost: 50}, footfetish: true, ap: false,
      },
    },
  },
  {
    file: "sample159.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500, '2h': 900},
      outcallRates: {'1h': 600, '2h': 1100},
      services: {
        '69': true, op: true, on: true, np: true, nn: false,
        showerSex: true, deepthroat: true, facesitting: true, fk: true,
        fj: true, cob: true, massage: true, uro: {extraCost: 50},
        hj: true, gfe: true, '3some': true, couples: true,
        lesbyShow: true, footfetish: true, ap: false,
      },
    },
  },
  {
    file: "sample160.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': false, op: true, on: true, np: true, cim: false,
        cof: false, cob: {extraCost: 50}, massage: true, hj: false,
        cuni: true, ani: true, domSoft: true, ap: false,
      },
    },
  },
  {
    file: "sample161.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {
        op: true, on: true, np: true, facesitting: true,
        fk: {extraCost: 50}, massage: true, uro: {extraCost: 100},
        rolePlay: true, gfe: true, cuni: true, shower: true,
        footfetish: true, '69': true,
      },
    },
  },
  {
    file: "sample162.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      outcallRates: {'1h': 700},
      services: {
        '69': true, op: true, on: true, np: true, fj: true,
        cim: true, cob: true, massage: true, footfetish: true,
      },
    },
  },
  {
    file: "sample163.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      schedule: [{start: "03:00", end: "04:00", days: "vineri"}],
      services: {
        '69': true, op: true, on: true, np: true, deepthroat: true,
        fk: false, cob: true, massage: true, uro: false, hj: true,
        domSoft: true, footfetish: true, ap: false,
      },
    },
  },
  {
    file: "sample164.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      outcallRates: {'1h': 500},
      services: {
        '69': true, op: true, on: true, np: true, fk: {extraCost: 50},
      },
    },
  },
  {
    file: "sample165.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 300},
      services: {
        '69': true, op: true, on: true, np: true, fk: true,
        cob: true, massage: true,
      },
    },
  },
  {
    file: "sample166.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      outcallRates: {'1h': 700},
      dominationRates: {'1h': 500},
      services: {
        op: true, on: {extraCost: 50}, np: true, fk: false,
        cim: false, cof: false, massage: true, uro: {extraCost: 50},
        domination: true, footfetish: {extraCost: 50}, ap: false,
      },
    },
  },
  {
    file: "sample167.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      schedule: [{start: "14:00", end: "21:00"}],
      services: {
        '69': true, op: true, np: true, fk: true, massage: true,
        gfe: {extraCost: 100}, shower: true, squirt: {extraCost: 100},
        ap: false,
      },
    },
  },
  {
    file: "sample168.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350},
      services: {
        '69': true, op: true, on: true, np: true, cim: true, cof: true,
        cob: true, pse: true, massage: true, hj: true, cuni: true, ani: true,
      },
    },
  },
  {
    file: "sample169.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      outcallRates: {'1h': 600},
      rateOverrides: [{after: "22:00", rates: {'30m': 250, '1h': 500}}],
      services: {
        '69': true, on: {extraCost: 50}, np: true, deepthroat: true,
        facesitting: true, facefuck: {extraCost: 50}, fk: {extraCost: 100},
        cob: true, massage: true, uro: {extraCost: 100}, rolePlay: true,
        hj: true, cuni: true, shower: true, domSoft: true, domHard: true,
        dirtyTalk: true, footfetish: true,
      },
    },
  },
  {
    file: "sample170.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300},
      services: {
        op: true, on: true, np: true, nn: false, cob: true,
        '69': true, massage: true, hj: true,
      },
    },
  },
  {
    file: "sample171.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        deepthroat: true, facefuck: true, fk: {extraCost: 100},
        cim: {extraCost: 100}, cof: {extraCost: 100}, cob: {extraCost: 50},
        uro: true, dirtyTalk: true, domination: true,
      },
    },
  },
  {
    file: "sample172.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        np: true, op: true, on: true, '69': true, ani: true,
        massage: true, domination: true, cob: true,
      },
    },
  },
  {
    file: "sample173.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        op: {extraCost: 50}, on: {extraCost: 50}, np: true,
        cim: {extraCost: 100}, cob: {extraCost: 50}, massage: true,
        uro: {extraCost: 50}, prostateMassage: {extraCost: 50},
      },
    },
  },
  {
    file: "sample174.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        on: {extraCost: 50}, np: true, '69': true, cob: true,
        massage: true, footfetish: true, fk: false,
      },
    },
  },
  {
    file: "sample175.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      outcallRates: {'1h': 700},
      services: {
        '69': true, op: true, on: true, np: true, hj: true, fj: true,
        footfetish: true, shower: true, massage: true, fk: true,
        cob: {extraCost: 100},
      },
    },
  },
  {
    file: "sample176.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      outcallRates: {'1h': 600},
      services: {
        op: true, on: true, np: true, '69': true, hj: true, fj: true,
        massage: true, gfe: true, cim: {extraCost: 50},
      },
    },
  },
  {
    file: "sample177.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        op: true, on: true, np: true, '69': true, cob: true,
        massage: true, footfetish: true, deepthroat: true,
        cuni: true, ani: true, ap: false, cim: false, fk: false,
      },
    },
  },
  {
    file: "sample178.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350, '1.5h': 550, '2h': 700},
      schedule: [{start: "11:00", end: "23:00", days: "joi"}],
      services: {
        fk: true, gfe: true, pse: true, dirtyTalk: true, op: true, on: true,
        deepthroat: true, facefuck: true, np: true, cob: true,
        cuni: true, ani: true, facesitting: true, massage: true,
        hardSex: true, swallow: true, ap: true, cim: false,
      },
    },
  },
  {
    file: "sample179.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300},
      schedule: [{start: "08:00", end: "17:00", days: "luni-vineri"}],
      services: {
        op: true, on: true, np: true, cim: true,
      },
    },
  },
  {
    file: "sample180.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      services: {
        '69': true, op: true, on: {extraCost: 50}, np: true,
        fj: true, hj: true, cuni: true, ani: true,
      },
    },
  },
  {
    file: "sample181.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400, '1.5h': 550},
      outcallRates: {'1h': 700},
      services: {
        '69': true, op: true, on: true, np: true,
        cim: {extraCost: 100}, cob: {extraCost: 100},
        massage: true, uro: {extraCost: 100}, cuni: true,
        domination: {extraCost: 100},
      },
    },
  },
  {
    file: "sample182.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 450, '1.5h': 650, '2h': 850},
      services: {
        op: true, on: true, np: true, fk: {extraCost: 50},
        massage: true, gfe: true,
      },
    },
  },
  {
    file: "sample183.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400},
      services: {
        np: true, cim: false, cob: true, cuni: true, ani: true,
        domination: false, ap: false,
      },
    },
  },
  {
    file: "sample184.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 700},
      rateOverrides: [{after: "cuplu", rates: {'1h': 1000}}],
      services: {
        '69': true, op: true, on: true, np: true, fk: true,
        cim: true, cob: true, gfe: true, couples: true,
      },
    },
  },
  {
    file: "sample185.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 450, '1.5h': 650},
      outcallRates: {'1h': 700},
      services: {
        op: true, on: true, np: true, fk: false, fj: true,
        cim: {extraCost: 100}, cob: true, massage: true, hj: true,
      },
    },
  },
  {
    file: "sample186.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 300},
      services: {
        '69': true, op: true, on: true, np: true,
        cim: {extraCost: 50},
      },
    },
  },
  {
    file: "sample187.txt",
    expected: {
      baseRates: {'30m': 150, '1h': 250},
      services: {op: true, on: true},
    },
  },
  {
    file: "sample188.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      schedule: [{start: "10:00", end: "00:00", days: "zilnic"}],
      services: {
        '69': true, op: true, on: true, np: true,
        fk: {extraCost: 50}, fj: true, cim: {extraCost: 100}, cob: true,
        massage: true, uro: {extraCost: 100}, hj: true, gfe: true,
        cuni: true, shower: true, ap: true,
      },
    },
  },
  {
    file: "sample189.txt",
    expected: {
      baseRates: {},
      outcallRates: {'30m': 750, '1h': 1000},
    },
  },
  {
    file: "sample190.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 400},
      rateOverrides: [{after: "22:00", rates: {'30m': 300, '1h': 500}}],
      schedule: [{start: "10:00", end: "24:00"}],
      services: {
        '69': true, op: true, on: true, np: true, deepthroat: true,
        fk: true, cim: {extraCost: 50}, cob: true, massage: true, cuni: true,
      },
    },
  },
  {
    file: "sample191.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      schedule: [{start: "14:00", end: "02:00"}],
      services: {
        '69': true, op: {extraCost: 100}, on: {extraCost: 100}, np: true,
        cob: true, massage: {extraCost: 50}, rolePlay: {extraCost: 50},
        hj: true, gfe: {extraCost: 400}, cuni: true, ani: true,
        domination: {extraCost: 150}, footfetish: {extraCost: 50},
      },
    },
  },
  {
    file: "sample192.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      services: {
        '69': true, op: {extraCost: 100}, on: {extraCost: 100}, np: true,
        cob: true, massage: {extraCost: 50}, rolePlay: {extraCost: 50},
        hj: true, gfe: {extraCost: 400}, cuni: true, ani: true,
        domination: {extraCost: 150}, footfetish: {extraCost: 50},
      },
    },
  },
  {
    file: "sample193.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 400},
      services: {
        op: true, on: true, np: true, fk: true,
        showerSex: true, massage: true, gfe: true,
      },
    },
  },
  {
    file: "sample194.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350},
      outcallRates: {'1h': 600},
      rateOverrides: [{after: "23:00", rates: {'30m': 200, '1h': 400}}],
      services: {
        np: true, gfe: true, massage: true, cuni: true, ani: true,
        domination: true, '69': true, cim: false, cof: false,
      },
    },
  },
  {
    file: "sample195.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350, '1.5h': 500},
      services: {
        op: true, on: true, np: true, deepthroat: true, cuni: true,
        cob: true, squirt: true, fk: {extraCost: 50}, ap: {extraCost: 150},
        cim: false, massage: false, gfe: false,
      },
    },
  },
  {
    file: "sample196.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      services: {
        '69': true, op: true, on: true, np: true, cob: true, massage: true,
        fk: {extraCost: 100}, cim: {extraCost: 100},
      },
    },
  },
  {
    file: "sample197.txt",
    expected: {
      baseRates: {'30m': 250, '1h': 500},
      schedule: [{start: "12:00", end: "21:00", days: "luni-sambata"}],
      services: {
        on: true, np: true, ap: true,
      },
    },
  },
  {
    file: "sample198.txt",
    expected: {
      baseRates: {'30m': 300, '1h': 500},
      outcallRates: {'1h': "150€"},
      services: {
        op: true, on: true, cob: true, uro: true, shower: true,
        domSoft: true, dirtyTalk: true,
      },
    },
  },
  {
    file: "sample199.txt",
    expected: {
      baseRates: {'30m': 200, '1h': 350},
      outcallRates: {'1h': 500},
      services: {
        op: true, on: true, np: true, cuni: true, ani: true, '69': true,
        massage: true, cob: true, shower: {extraCost: 50},
        gfe: false, fk: false, ap: false,
      },
    },
  },
];

for (const sample of samples) {
  test(`extracts service details from ${sample.file}`, () => {
    expect(escortInfoExtractor.extractServiceDetails(readSample(sample.file))).toEqual(sample.expected);
  });
}

for (const file of ["false-sample1.txt", "false-sample2.txt", "false-sample3.txt", "false-sample4.txt", "false-sample5.txt", "false-sample6.txt", "false-sample7.txt", "false-sample8.txt", "false-sample9.txt", "false-sample10.txt", "false-sample11.txt", "false-sample12.txt", "false-sample13.txt", "false-sample14.txt", "false-sample15.txt", "false-sample16.txt", "false-sample17.txt", "false-sample18.txt", "false-sample19.txt", "false-sample20.txt", "false-sample21.txt", "false-sample22.txt", "false-sample23.txt", "false-positive10.txt"]) {
  test(`does not extract service details from ${file}`, () => {
    expect(escortInfoExtractor.extractServiceDetails(readFalseSample(file))).toBeNull();
  });
}
