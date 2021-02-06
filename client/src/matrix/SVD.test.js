/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import SVD from './SVD';
import Matrix from './Matrix';

it('SVD 1', () => {
  let [U, s, V] = SVD([
        [3, 2, 2],
        [2, 3, -2]
      ]);

  U = new Matrix(U);
  expect(U.rows).toBe(2);
  expect(U.cols).toBe(2);
  let U2 = U.mul(U.transpose());
  expect(U2.get(0,0)).toBeCloseTo(1, 10);
  expect(U2.get(0,1)).toBeCloseTo(0, 10);
  expect(U2.get(1,0)).toBeCloseTo(0, 10);
  expect(U2.get(1,1)).toBeCloseTo(1, 10);

  expect(s.length).toBe(2);
  expect(s[0]).toBeCloseTo(5, 10);
  expect(s[1]).toBeCloseTo(3, 10);

  V = new Matrix(V);
  expect(V.rows).toBe(3);
  expect(V.cols).toBe(2);
  let V2 = V.transpose().mul(V);
  expect(V2.get(0,0)).toBeCloseTo(1, 10);
  expect(V2.get(0,1)).toBeCloseTo(0, 10);
  expect(V2.get(1,0)).toBeCloseTo(0, 10);
  expect(V2.get(1,1)).toBeCloseTo(1, 10);

  let A = U.mul(Matrix.diag(s)).mul(V.transpose());
  expect(A.rows).toBe(2);
  expect(A.cols).toBe(3);
  expect(A.get(0, 0)).toBeCloseTo(3, 10);
  expect(A.get(0, 1)).toBeCloseTo(2, 10);
  expect(A.get(0, 2)).toBeCloseTo(2, 10);
  expect(A.get(1, 0)).toBeCloseTo(2, 10);
  expect(A.get(1, 1)).toBeCloseTo(3, 10);
  expect(A.get(1, 2)).toBeCloseTo(-2, 10);
});

it('SVD 2', () => {
  let [U, s, V] = SVD([
        [1, 1, 0, 1],
        [0, 0, 0, 1],
        [1, 1, 0, 0],
      ]);

  U = new Matrix(U);
  expect(U.rows).toBe(3);
  expect(U.cols).toBe(3);
  let U2 = U.mul(U.transpose());
  expect(U2.get(0,0)).toBeCloseTo(1, 10);
  expect(U2.get(0,1)).toBeCloseTo(0, 10);
  expect(U2.get(0,2)).toBeCloseTo(0, 10);
  expect(U2.get(1,0)).toBeCloseTo(0, 10);
  expect(U2.get(1,1)).toBeCloseTo(1, 10);
  expect(U2.get(1,2)).toBeCloseTo(0, 10);
  expect(U2.get(2,0)).toBeCloseTo(0, 10);
  expect(U2.get(2,1)).toBeCloseTo(0, 10);
  expect(U2.get(2,2)).toBeCloseTo(1, 10);

  expect(s.length).toBe(3);
  expect(s[0]).toBeCloseTo(2.17532775, 8);
  expect(s[1]).toBeCloseTo(1.12603250, 8);
  expect(s[2]).toBeCloseTo(0, 10);

  V = new Matrix(V);
  expect(V.rows).toBe(4);
  expect(V.cols).toBe(3);
  let V2 = V.mul(V.transpose());
  expect(V2.get(0,0)).toBeCloseTo(1, 10);
  expect(V2.get(0,1)).toBeCloseTo(0, 10);
  expect(V2.get(0,2)).toBeCloseTo(0, 10);
  expect(V2.get(0,3)).toBeCloseTo(0, 10);
  expect(V2.get(1,0)).toBeCloseTo(0, 10);
  expect(V2.get(1,1)).toBeCloseTo(1, 10);
  expect(V2.get(1,2)).toBeCloseTo(0, 10);
  expect(V2.get(1,3)).toBeCloseTo(0, 10);
  expect(V2.get(2,0)).toBeCloseTo(0, 10);
  expect(V2.get(2,1)).toBeCloseTo(0, 10);
  expect(V2.get(2,2)).toBeCloseTo(0, 10);
  expect(V2.get(2,3)).toBeCloseTo(0, 10);
  expect(V2.get(3,0)).toBeCloseTo(0, 10);
  expect(V2.get(3,1)).toBeCloseTo(0, 10);
  expect(V2.get(3,2)).toBeCloseTo(0, 10);
  expect(V2.get(3,3)).toBeCloseTo(1, 10);

  let A = U.mul(Matrix.diag(s)).mul(V.transpose());
  expect(A.rows).toBe(3);
  expect(A.cols).toBe(4);
  expect(A.get(0, 0)).toBeCloseTo(1, 10);
  expect(A.get(0, 1)).toBeCloseTo(1, 10);
  expect(A.get(0, 2)).toBeCloseTo(0, 10);
  expect(A.get(0, 3)).toBeCloseTo(1, 10);
  expect(A.get(1, 0)).toBeCloseTo(0, 10);
  expect(A.get(1, 1)).toBeCloseTo(0, 10);
  expect(A.get(1, 2)).toBeCloseTo(0, 10);
  expect(A.get(1, 3)).toBeCloseTo(1, 10);
  expect(A.get(2, 0)).toBeCloseTo(1, 10);
  expect(A.get(2, 1)).toBeCloseTo(1, 10);
  expect(A.get(2, 2)).toBeCloseTo(0, 10);
  expect(A.get(2, 3)).toBeCloseTo(0, 10);
});

it('SVD 3', () => {
  let [U, s, V] = SVD([
        [2, 4],
        [1, 3],
        [0, 0],
        [0, 0],
      ]);

  U = new Matrix(U);
  expect(U.rows).toBe(4);
  expect(U.cols).toBe(2);
  // NOTE that U is truncated in this case

  expect(s.length).toBe(2);
  expect(s[0]).toBeCloseTo(5.4649857, 6);
  expect(s[1]).toBeCloseTo(0.36596619, 7);

  V = new Matrix(V);
  expect(V.rows).toBe(2);
  expect(V.cols).toBe(2);
  let V2 = V.mul(V.transpose());
  expect(V2.get(0,0)).toBeCloseTo(1, 10);
  expect(V2.get(0,1)).toBeCloseTo(0, 10);
  expect(V2.get(1,0)).toBeCloseTo(0, 10);
  expect(V2.get(1,1)).toBeCloseTo(1, 10);

  let A = U.mul(Matrix.diag(s)).mul(V.transpose());
  expect(A.rows).toBe(4);
  expect(A.cols).toBe(2);
  expect(A.get(0, 0)).toBeCloseTo(2, 10);
  expect(A.get(0, 1)).toBeCloseTo(4, 10);
  expect(A.get(1, 0)).toBeCloseTo(1, 10);
  expect(A.get(1, 1)).toBeCloseTo(3, 10);
  expect(A.get(2, 0)).toBeCloseTo(0, 10);
  expect(A.get(2, 1)).toBeCloseTo(0, 10);
  expect(A.get(3, 0)).toBeCloseTo(0, 10);
  expect(A.get(3, 1)).toBeCloseTo(0, 10);
});
