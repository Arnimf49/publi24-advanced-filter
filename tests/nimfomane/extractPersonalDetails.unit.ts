import {expect, test} from "@playwright/test";
import {readFileSync} from "node:fs";
import {escortInfoExtractor} from "../../src/nimfomane/core/escortInfoExtractor";
import type {PersonalDetails} from "../../src/nimfomane/core/escortInfoExtractor";

const readSample = (file: string): string => readFileSync(new URL(`./mocks/personal-details-texts/${file}`, import.meta.url), "utf8");

const samples: Array<{file: string; expected: PersonalDetails}> = [
  {file: "sample1.txt", expected: {height: 170}},
  {file: "sample2.txt", expected: {age: 22, height: 168, weight: 55}},
  {file: "sample3.txt", expected: {height: 165, weight: 65}},
  {file: "sample4.txt", expected: {age: 42, height: 157, weight: 50}},
  {file: "sample5.txt", expected: {height: 164, weight: 52}},
  {file: "sample6.txt", expected: {age: 20, height: 160, weight: 56}},
  {file: "sample7.txt", expected: {age: 25, height: 160, weight: 65}},
  {file: "sample8.txt", expected: {age: 37, height: 165, weight: 68}},
  {file: "sample9.txt", expected: {age: 28, height: 170, weight: 58}},
  {file: "sample10.txt", expected: {height: 170, weight: 58}},
  {file: "sample11.txt", expected: {age: 20, height: 160, weight: 50}},
  {file: "sample12.txt", expected: {age: 21, height: 160, weight: 50}},
];

for (const sample of samples) {
  test(`extracts personal details from ${sample.file}`, () => {
    expect(escortInfoExtractor.extractPersonalDetails(readSample(sample.file))).toEqual(sample.expected);
  });
}

test("does not extract personal details from false-sample1.txt", () => {
  expect(escortInfoExtractor.extractPersonalDetails(readSample("false-sample1.txt"))).toBeNull();
});
