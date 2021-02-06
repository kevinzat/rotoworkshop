/* Copyright 2018 Kevin Zatloual. All rights reserved. */

/** Returns the examples to use for training or testing. */
export function GetData(table, yIndex, train) {
  let X = [], y = [];
  for (let i = 0; i < table.rows.length; i++) {
    let h = (7 * i + 1) % 5;
    if ((train && h !== 3) || (!train && h === 3)) {
      X.push(table.rows[i].filter(
          (v, index) => (index !== yIndex)));
      y.push(table.rows[i][yIndex]);
    }
  }
  return [X, y];
}


/** Returns the error rate of the given prediction function on these data. */
export function ErrorRate(X, cls, predFunc) {
  let correct = 0;
  for (let i = 0; i < X.length; i++) {
    if (predFunc(X[i]) === cls[i])
      correct += 1;
  }
  return 100 * (1 - correct / X.length);
}


/** Returns the error rate of the given model on these data. */
export function SquaredError(X, y, predFunc) {
  let err = 0;
  for (let i = 0; i < X.length; i++) {
    let e = predFunc(X[i]) - y[i];
    err += e*e;
  }
  return err / X.length;
}


/** Returns a copy of the given vector scaled to sum to 1. */
export function Normalize(vals) {
  let sum = vals.reduce((a, b) => a+b);
  return vals.map(v => v / sum);
}

