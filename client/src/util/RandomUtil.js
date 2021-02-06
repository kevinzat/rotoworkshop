/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import { BinarySearch } from './SearchUtil';


var SEED = 1;
var RANDMAX = 0x7fffffff;

/** Sets the random seed to the given value. */
export function InitRandomSeed(val) {
  SEED = val;
}

/** Returns a random integer between 0 and 2^31-2. */
export function RandInt31() {
  return SEED = (16807 * SEED) % RANDMAX;  // Park & Miller's minimal standard
}


/** Returns a random integer between a and b-1. */
export function RandInt(a, b) {
  return a + Math.floor(Random() * (b-a));
}


/** Returns a random number in [0, 1). */
export function Random() {
  return RandInt31() / RANDMAX;
}

/**
 * Returns a sample of count random indexes from prob, where the probability
 * of element i being chosen is given in prob[i].
 */
export function RandomSample(prob, count) {
  let cdf = [0];
  for (let i = 0; i < prob.length; i++)
    cdf.push(cdf[i] + prob[i]);

  if (Math.abs(1 - cdf[cdf.length-1]) > 1e-5)
    throw new Error(`RandomSample: probabilities do not add to 1`);
  cdf[cdf.length-1] = 1;

  let indexes = [];
  for (let i = 0; i < count; i++)
    indexes.push(Math.max(0, BinarySearch(cdf, Random())-1));
  return indexes;
}


/** Randomly permutes the values in the given array. */
export function RandomPermute(vals) {
  for (let i = 0; i < vals.length; i++) {
    let j = RandInt(i, vals.length);
    let t = vals[i];
    vals[i] = vals[j];
    vals[j] = t;
  }
}
