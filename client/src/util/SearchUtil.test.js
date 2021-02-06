/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import { BinarySearch, ArgMax } from './SearchUtil';


it('ArgMax array', () => {
  expect(ArgMax([2, 15, 29, 16, 8])).toBe(2);
  expect(ArgMax([29, 15, 2, 16, 8])).toBe(0);
  expect(ArgMax([8, 15, 2, 16, 29])).toBe(4);
});

it('ArgMax map', () => {
  expect(ArgMax(new Map(
      [['a',2], ['b',8], ['c',15], ['d',16], ['e',29]]))).toBe('e');
  expect(ArgMax(new Map(
      [['e',2], ['b',8], ['c',15], ['d',16], ['a',29]]))).toBe('a');
});

it('BinarySearch', () => {
  const array = [2, 8, 15, 16, 29];
  expect(BinarySearch(array, -1)).toBe(0);
  expect(BinarySearch(array, 0)).toBe(0);
  expect(BinarySearch(array, 1)).toBe(0);
  expect(BinarySearch(array, 2)).toBe(0);
  expect(BinarySearch(array, 3)).toBe(1);
  expect(BinarySearch(array, 7)).toBe(1);
  expect(BinarySearch(array, 8)).toBe(1);
  expect(BinarySearch(array, 9)).toBe(2);
  expect(BinarySearch(array, 14)).toBe(2);
  expect(BinarySearch(array, 15)).toBe(2);
  expect(BinarySearch(array, 16)).toBe(3);
  expect(BinarySearch(array, 17)).toBe(4);
  expect(BinarySearch(array, 28)).toBe(4);
  expect(BinarySearch(array, 29)).toBe(4);
  expect(BinarySearch(array, 30)).toBe(5);
});
