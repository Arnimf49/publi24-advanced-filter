import {expect, test} from "@playwright/test";
import {serviceDisplay} from "../../src/nimfomane/component/EscortDetailsModal/serviceDisplay";

test("groups available services and formats extra costs", () => {
  expect(serviceDisplay.getServiceGroups({
    op: true,
    cim: {extraCost: 50},
    anal: false,
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
      services: [{service: "anal", label: "AP (nu)", isNotIncluded: true}],
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
        {service: "domination", label: "dominare nespecifică", isNotIncluded: false},
      ],
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
    ],
  })).toEqual([
    {key: "30m", label: "30 minute", values: ["300 lei", "după 23:00: 400 lei"]},
    {
      key: "1h",
      label: "1 oră",
      values: ["500 lei", "deplasare: 800 lei", "dominare: 700 lei", "după 21:00: 600 lei"],
    },
  ]);
});

test("does not create rate rows when no rate is available", () => {
  expect(serviceDisplay.getRateRows({baseRates: {}})).toEqual([]);
});
