/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import { LinearRegression, LogisticRegression } from './LinearModels';


it('LinearRegression exact', () => {
  let [b, s, R] = LinearRegression([[0], [1], [2], [3]], [1, 3, 5, 7]);

  expect(b.length).toBe(2);
  expect(b[0]).toBeCloseTo(1, 5);
  expect(b[1]).toBeCloseTo(2, 5);

  expect(s.length).toBe(2);
  expect(s[0]).toBeLessThan(1e-5);
  expect(s[1]).toBeLessThan(1e-5);

  expect(R).toBeCloseTo(1, 3);
});

it('LinearRegression no-intercept', () => {
  let [b, s, R] = LinearRegression([[0], [1], [2], [3]], [0, 2, 4, 6], false);

  expect(b.length).toBe(1);
  expect(b[0]).toBeCloseTo(2, 5);

  expect(s.length).toBe(1);
  expect(s[0]).toBeLessThan(1e-5);

  expect(R).toBeCloseTo(1, 3);
});

it('LogisticRegression', () => {
  let b = LogisticRegression(
      [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9]],
      [1, 0, 0, 0, 0, 1, 1, 1, 1, 1]);

  expect(b.length).toBe(2);
  expect(b[0]).toBeCloseTo(-1.76242, 5);
  expect(b[1]).toBeCloseTo(0.527860, 5);
});

it('LogisticRegression indeterminate', () => {
  // Answer can have arbitrarily large slope, so IRLS does not terminate
  let b = LogisticRegression(
      [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9]],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 1]);

  expect(b.length).toBe(2);
  expect(b[0] + 4 * b[1]).toBeLessThan(-10);
  expect(b[1] + 5 * b[1]).toBeGreaterThan(10);
});
