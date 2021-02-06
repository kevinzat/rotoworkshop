/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import { InitRandomSeed, RandInt31, Random, RandomSample } from './RandomUtil';


expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});


it('RandInt31', () => {
  InitRandomSeed(5);
  expect(RandInt31()).toBe(84035);
  expect(RandInt31()).toBe(1412376245);
  expect(RandInt31()).toBe(1670799424);
  expect(RandInt31()).toBe(629750996);
  expect(RandInt31()).toBe(1425577356);
});

it('Random', () => {
  InitRandomSeed(5);
  expect(Random()).toBeCloseTo(0.00003913, 8);
  expect(Random()).toBeCloseTo(0.65768894, 8);
  expect(Random()).toBeCloseTo(0.77802661, 8);
  expect(Random()).toBeCloseTo(0.29325066, 8);
  expect(Random()).toBeCloseTo(0.66383619, 8);
});

it('RandomSample equal', () => {
  InitRandomSeed(5);
  const probs = [0.2, 0.2, 0.2, 0.2, 0.2];
  const indexes = RandomSample(probs, 10000);

  const counts = [0, 0, 0, 0, 0];
  for (let i = 0; i < indexes.length; i++)
    counts[indexes[i]] += 1;

  expect(counts[0] / 10000).toBeWithinRange(0.19, 0.21);
  expect(counts[1] / 10000).toBeWithinRange(0.19, 0.21);
  expect(counts[2] / 10000).toBeWithinRange(0.19, 0.21);
  expect(counts[3] / 10000).toBeWithinRange(0.19, 0.21);
  expect(counts[4] / 10000).toBeWithinRange(0.19, 0.21);
});

it('RandomSample one bump', () => {
  InitRandomSeed(5);
  const probs = [0.2, 0.0, 0.2, 0.4, 0.2];
  const indexes = RandomSample(probs, 10000);

  const counts = [0, 0, 0, 0, 0];
  for (let i = 0; i < indexes.length; i++)
    counts[indexes[i]] += 1;

  expect(counts[0] / 10000).toBeWithinRange(0.19, 0.21);
  expect(counts[1] / 10000).toBeWithinRange(0.00, 0.01);
  expect(counts[2] / 10000).toBeWithinRange(0.19, 0.21);
  expect(counts[3] / 10000).toBeWithinRange(0.39, 0.41);
  expect(counts[4] / 10000).toBeWithinRange(0.19, 0.21);
});

it('RandomSample two bumps', () => {
  InitRandomSeed(5);
  const probs = [0.4, 0.0, 0.0, 0.4, 0.2];
  const indexes = RandomSample(probs, 10000);

  const counts = [0, 0, 0, 0, 0];
  for (let i = 0; i < indexes.length; i++)
    counts[indexes[i]] += 1;

  expect(counts[0] / 10000).toBeWithinRange(0.39, 0.41);
  expect(counts[1] / 10000).toBeWithinRange(0.00, 0.01);
  expect(counts[2] / 10000).toBeWithinRange(0.00, 0.01);
  expect(counts[3] / 10000).toBeWithinRange(0.39, 0.41);
  expect(counts[4] / 10000).toBeWithinRange(0.19, 0.21);
});

it('RandomSample spike', () => {
  InitRandomSeed(5);
  const probs = [0.0, 0.0, 0.0, 0.0, 1.0];
  const indexes = RandomSample(probs, 10000);

  const counts = [0, 0, 0, 0, 0];
  for (let i = 0; i < indexes.length; i++)
    counts[indexes[i]] += 1;

  expect(counts[0] / 10000).toBeWithinRange(0.00, 0.01);
  expect(counts[1] / 10000).toBeWithinRange(0.00, 0.01);
  expect(counts[2] / 10000).toBeWithinRange(0.00, 0.01);
  expect(counts[3] / 10000).toBeWithinRange(0.00, 0.01);
  expect(counts[4] / 10000).toBeWithinRange(0.99, 1.00);
});
