import {expect, test} from "@playwright/test";
import {serviceDisplay} from "../../src/nimfomane/component/EscortDetailsModal/serviceDisplay";

test("groups available services and formats extra costs", () => {
  expect(serviceDisplay.getServiceGroups({
    op: true,
    cim: {extraCost: 50},
    ap: false,
  })).toEqual([
    {
      label: "Oral",
      services: [{service: "op", label: "OP", isNotIncluded: false}],
    },
    {
      label: "Finalizare",
      services: [{service: "cim", label: "CIM", isNotIncluded: false, extraCost: 50}],
    },
    {
      label: "Anal",
      services: [{service: "ap", label: "AP (nu)", isNotIncluded: true}],
    },
  ]);
});

test("displays deepthroat by its identifier", () => {
  expect(serviceDisplay.getServiceGroups({deepthroat: true})).toEqual([
    {
      label: "Oral",
      services: [{service: "deepthroat", label: "deepthroat", isNotIncluded: false}],
    },
  ]);
});

test("displays merged AP availability entries under one key", () => {
  expect(serviceDisplay.getServiceGroups({
    ap: {extraCost: 100},
  })).toEqual([
    {
      label: "Anal",
      services: [
        {service: "ap", label: "AP", isNotIncluded: false, extraCost: 100},
      ],
    },
  ]);
});

test("hides the generic dom service when specific variants are present", () => {
  expect(serviceDisplay.getServiceGroups({
    domination: true,
    domSoft: false,
    domHard: {extraCost: 100},
  })).toEqual([
    {
      label: "Domniare",
      services: [
        {service: "domSoft", label: "dominare soft (nu)", isNotIncluded: true},
        {service: "domHard", label: "dominare hard", isNotIncluded: false, extraCost: 100},
      ],
    },
  ]);
});

test("shows hard sex in the Sex group", () => {
  expect(serviceDisplay.getServiceGroups({hardSex: false})).toEqual([
    {
      label: "Sex",
      services: [{service: "hardSex", label: "hard (nu)", isNotIncluded: true}],
    },
  ]);
});

test("formats all applicable rate sources in display order", () => {
  expect(serviceDisplay.getRateRows({
    baseRates: {"30m": 300, "1h": 500},
    outcallRates: {"1h": 800},
    dominationRates: {"1h": 700},
    rateOverrides: [
      {after: "21:00", rates: {"1h": 600}},
      {after: "23:00", rates: {"30m": 400}},
      {after: "cuplu", rates: {"1h": 1000}},
    ],
  })).toEqual([
    {key: "30m", label: "30 minute", values: ["300 lei", "după 23:00: 400 lei"]},
    {
      key: "1h",
      label: "1 oră",
      values: ["500 lei", "dominare: 700 lei", "după 21:00: 600 lei", "cuplu: 1000 lei", "deplasare: 800 lei"],
    },
  ]);
});

test("preserves euro formatting for outcall rates", () => {
  expect(serviceDisplay.getRateRows({
    baseRates: {"30m": 300, "1h": 500},
    outcallRates: {"1h": "150€"},
  })).toEqual([
    {key: "30m", label: "30 minute", values: ["300 lei"]},
    {key: "1h", label: "1 oră", values: ["500 lei", "deplasare: 150€"]},
  ]);
});

test("does not create rate rows when no rate is available", () => {
  expect(serviceDisplay.getRateRows({baseRates: {}})).toEqual([]);
});
