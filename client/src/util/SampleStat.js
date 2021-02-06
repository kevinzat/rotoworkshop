/* Copyright 2018 Kevin Zatloual. All rights reserved. */

function Mean(values) {
  let s = 0;
  for (let i = 0; i < values.length; i++)
    s += values[i]
  return s / values.length;
};

function Covariance(values1, values2) {
  if (values1.length !== values2.length)
    throw new Error(`Different lengths: ${values1.length} vs ${values2.length}`);

  let u1 = Mean(values1);
  let u2 = Mean(values2);
  let s = 0;
  for (let i = 0; i < values1.length; i++)
    s += (values1[i] - u1) * (values2[i] - u2);
  return s / values1.length;
}

function Variance(values) {
  return Covariance(values, values);
}

function StdDev(values) {
  return Math.sqrt(Variance(values));
}

function Correlation(values1, values2) {
  return Covariance(values1, values2) / (StdDev(values1) * StdDev(values2));
}

export { Mean, Covariance, Variance, StdDev, Correlation };
