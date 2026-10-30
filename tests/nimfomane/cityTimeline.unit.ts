import {expect, test} from '@playwright/test';
import {cityTimeline} from '../../src/nimfomane/core/cityTimeline';

const DAY = 24 * 60 * 60 * 1000;
const JANUARY = (day: number, hour = 10) => Date.UTC(2026, 0, day, hour);

test('inserts a pause between city visits when the dates have a gap', () => {
  const result = cityTimeline.build([
    {city: 'București', date: JANUARY(20), text: 'Sunt disponibila'},
    {city: 'Cluj', date: JANUARY(10), text: 'Azi este ultima zi'},
    {city: 'Cluj', date: JANUARY(1), text: 'Sunt disponibila'},
  ], JANUARY(20, 12));

  expect(result.visitedCities).toEqual([
    ['București', 1],
    {pause: 10},
    ['Cluj', 9],
  ]);
  expect(result.currentCitySince).toBe(JANUARY(20));
  expect(result.currentPauseSince).toBeUndefined();
});

test('does not insert a pause for a one-day gap', () => {
  const result = cityTimeline.build([
    {city: 'București', date: JANUARY(11), text: 'Sunt disponibila'},
    {city: 'Cluj', date: JANUARY(10), text: 'Sunt disponibila'},
  ], JANUARY(11, 12));

  expect(result.visitedCities).toEqual([
    ['București', 1],
    ['Cluj', 1],
  ]);
});

test('merges consecutive visits in the same city when the gap is only one day', () => {
  const result = cityTimeline.build([
    {city: 'Cluj', date: JANUARY(20), text: 'Sunt disponibila'},
    {city: 'Cluj', date: JANUARY(19), text: 'INDISPONIBILA'},
    {city: 'Cluj', date: JANUARY(10), text: 'Sunt disponibila'},
  ], JANUARY(20, 12));

  expect(result.visitedCities).toEqual([
    ['Cluj', 10],
  ]);
  expect(result.currentCitySince).toBe(JANUARY(10));
});

test('marks the current status as paused when the newest post is unavailable', () => {
  const result = cityTimeline.build([
    {city: 'Cluj', date: JANUARY(20), text: 'INDISPONIBILA'},
    {city: 'Cluj', date: JANUARY(1), text: 'Sunt disponibila'},
  ], JANUARY(20, 12));

  expect(result.visitedCities).toEqual([
    ['Cluj', 19],
  ]);
  expect(result.currentCitySince).toBeUndefined();
  expect(result.currentPauseSince).toBe(JANUARY(20));
});

test('keeps the current city while the last days are still in the future', () => {
  const posts = [
    {city: 'Cluj', date: JANUARY(20), text: 'Ultimele 2 zile in oras'},
  ];

  const active = cityTimeline.build(posts, JANUARY(20, 12));
  expect(active.currentCitySince).toBe(JANUARY(20));
  expect(active.currentPauseSince).toBeUndefined();

  const paused = cityTimeline.build(posts, JANUARY(22, 12));
  expect(paused.currentCitySince).toBeUndefined();
  expect(paused.currentPauseSince).toBe(JANUARY(21));
});

test('splits visits in the same city when a pause signal appears between them', () => {
  const result = cityTimeline.build([
    {city: 'Cluj', date: JANUARY(20), text: 'Sunt disponibila'},
    {city: 'Cluj', date: JANUARY(15), text: 'INDISPONIBILA'},
    {city: 'Cluj', date: JANUARY(10), text: 'Sunt disponibila'},
  ], JANUARY(20, 12));

  expect(result.visitedCities).toEqual([
    ['Cluj', 1],
    {pause: 5},
    ['Cluj', 5],
  ]);
  expect(result.currentCitySince).toBe(JANUARY(20));
});

test('recognizes pause entries and computes ongoing days', () => {
  expect(cityTimeline.isPause({pause: 3})).toBe(true);
  expect(cityTimeline.isPause(['Cluj', 2])).toBe(false);
  expect(cityTimeline.isPause('Cluj')).toBe(false);
  expect(cityTimeline.getOngoingDays(JANUARY(20) - 2 * DAY, JANUARY(20))).toBe(2);
});
