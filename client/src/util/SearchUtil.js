/* Copyright 2018 Kevin Zatloual. All rights reserved. */

/** Returns the key of the given array / map with the largest value. */
export function ArgMax(obj) {
  let maxKey, maxValue;
  obj.forEach((value, key) => {
        if (maxValue === undefined || maxValue < value) {
          maxValue = value;
          maxKey = key;
        }
      });
  return maxKey;
}

/**
 * Returns the index at which val would be inserted in given sorted array. In
 * the case of ties, the smallest index is returned.
 */
export function BinarySearch(array, val) {
  let lo = -1, hi = array.length;
  while (lo+1 < hi) {
    const mi = lo + ((hi - lo) >> 1);
    if (val <= array[mi]) {
      hi = mi;
    } else {
      lo = mi;
    }
  }
  return hi;
}
