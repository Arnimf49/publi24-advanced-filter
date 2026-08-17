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
  {file: "sample13.txt", expected: {age: 29, height: 173, weight: 58}},
  {file: "sample14.txt", expected: {age: 29, height: 173, weight: 58}},
  {file: "sample15.txt", expected: {age: 30, height: 160}},
  {file: "sample16.txt", expected: {age: 30, height: 160, weight: 80}},
  {file: "sample17.txt", expected: {height: 155, weight: 48}},
  {file: "sample18.txt", expected: {age: 35, height: 165, weight: 52}},
  {file: "sample19.txt", expected: {age: 30, height: 160}},
  {file: "sample20.txt", expected: {age: 20, height: 154, weight: 46}},
  {file: "sample21.txt", expected: {age: 30, height: 170}},
  {file: "sample22.txt", expected: {height: 168, weight: 65}},
  {file: "sample23.txt", expected: {age: 21, height: 164, weight: 49}},
];

for (const sample of samples) {
  test(`extracts personal details from ${sample.file}`, () => {
    expect(escortInfoExtractor.extractPersonalDetails(readSample(sample.file))).toEqual(sample.expected);
  });
}

for (const file of ["false-sample1.txt", "false-sample.txt", "false-sample2.txt", "false-sample3.txt", "false-sample4.txt", "false-sample5.txt", "false-sample6.txt", "false-sample7.txt", "false-sample8.txt"]) {
  test(`does not extract personal details from ${file}`, () => {
    expect(escortInfoExtractor.extractPersonalDetails(readSample(file))).toBeNull();
  });
}
