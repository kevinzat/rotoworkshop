/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import Matrix from './Matrix';


it('zeros', () => {
  let A = Matrix.zeros(2, 3);

  expect(A.rows).toBe(2);
  expect(A.cols).toBe(3);
  expect(A.get(0,0)).toBe(0);
  expect(A.get(0,1)).toBe(0);
  expect(A.get(0,2)).toBe(0);
  expect(A.get(1,0)).toBe(0);
  expect(A.get(1,1)).toBe(0);
  expect(A.get(1,2)).toBe(0);

  A = Matrix.zeros(3, 2);

  expect(A.rows).toBe(3);
  expect(A.cols).toBe(2);
  expect(A.get(0,0)).toBe(0);
  expect(A.get(0,1)).toBe(0);
  expect(A.get(1,0)).toBe(0);
  expect(A.get(1,1)).toBe(0);
  expect(A.get(2,0)).toBe(0);
  expect(A.get(2,1)).toBe(0);
});

it('eye', () => {
  let A = Matrix.eye(2, 2);

  expect(A.rows).toBe(2);
  expect(A.cols).toBe(2);
  expect(A.get(0,0)).toBe(1);
  expect(A.get(0,1)).toBe(0);
  expect(A.get(1,0)).toBe(0);
  expect(A.get(1,1)).toBe(1);
});

it('diag', () => {
  let A = Matrix.diag([4, 5]);

  expect(A.rows).toBe(2);
  expect(A.cols).toBe(2);
  expect(A.get(0,0)).toBe(4);
  expect(A.get(0,1)).toBe(0);
  expect(A.get(1,0)).toBe(0);
  expect(A.get(1,1)).toBe(5);

  A = Matrix.diag([4, 5, 6]);

  expect(A.rows).toBe(3);
  expect(A.cols).toBe(3);
  expect(A.get(0,0)).toBe(4);
  expect(A.get(0,1)).toBe(0);
  expect(A.get(0,2)).toBe(0);
  expect(A.get(1,0)).toBe(0);
  expect(A.get(1,1)).toBe(5);
  expect(A.get(1,2)).toBe(0);
  expect(A.get(2,0)).toBe(0);
  expect(A.get(2,1)).toBe(0);
  expect(A.get(2,2)).toBe(6);
});

it('add', () => {
  let A = new Matrix([[1, 2, 3], [4, 5, 6]]);
  let B = new Matrix([[0, 5, 3], [0, -5, 2]]);
  let C = A.add(B);

  expect(C.rows).toBe(2);
  expect(C.cols).toBe(3);
  expect(C.get(0,0)).toBeCloseTo(1, 10);
  expect(C.get(0,1)).toBeCloseTo(7, 10);
  expect(C.get(0,2)).toBeCloseTo(6, 10);
  expect(C.get(1,0)).toBeCloseTo(4, 10);
  expect(C.get(1,1)).toBeCloseTo(0, 10);
  expect(C.get(1,2)).toBeCloseTo(8, 10);
});

it('sub', () => {
  let A = new Matrix([[1, 2, 3], [4, 5, 6]]);
  let B = new Matrix([[0, 5, 3], [0, -5, 2]]);
  let C = A.sub(B);

  expect(C.rows).toBe(2);
  expect(C.cols).toBe(3);
  expect(C.get(0,0)).toBeCloseTo(1, 10);
  expect(C.get(0,1)).toBeCloseTo(-3, 10);
  expect(C.get(0,2)).toBeCloseTo(0, 10);
  expect(C.get(1,0)).toBeCloseTo(4, 10);
  expect(C.get(1,1)).toBeCloseTo(10, 10);
  expect(C.get(1,2)).toBeCloseTo(4, 10);
});

it('mul', () => {
  let A = new Matrix([[1, 2, 3], [4, 5, 6]]);
  let B = new Matrix([[7, 8], [9, 10], [11, 12]]);
  let C = A.mul(B);

  expect(C.rows).toBe(2);
  expect(C.cols).toBe(2);
  expect(C.get(0,0)).toBeCloseTo(58, 10);
  expect(C.get(0,1)).toBeCloseTo(64, 10);
  expect(C.get(1,0)).toBeCloseTo(139, 10);
  expect(C.get(1,1)).toBeCloseTo(154, 10);
});

it('pinv 1', () => {
  let A = new Matrix([[1, 1, 1, 1], [5, 7, 7, 9]]);
  let C = A.pseudoInverse();

  expect(C.rows).toBe(4);
  expect(C.cols).toBe(2);
  expect(C.get(0,0)).toBeCloseTo(2, 2);
  expect(C.get(0,1)).toBeCloseTo(-0.25, 2);
  expect(C.get(1,0)).toBeCloseTo(0.25, 2);
  expect(C.get(1,1)).toBeCloseTo(0, 2);
  expect(C.get(2,0)).toBeCloseTo(0.25, 2);
  expect(C.get(2,1)).toBeCloseTo(0, 2);
  expect(C.get(3,0)).toBeCloseTo(-1.5, 2);
  expect(C.get(3,1)).toBeCloseTo(0.25, 2);
});

it('pinv 2', () => {
  let A = new Matrix([[4, 6], [6, 14]]);
  let C = A.pseudoInverse();

  expect(C.rows).toBe(2);
  expect(C.cols).toBe(2);
  expect(C.get(0,0)).toBeCloseTo(0.7, 2);
  expect(C.get(0,1)).toBeCloseTo(-0.3, 2);
  expect(C.get(1,0)).toBeCloseTo(-0.3, 2);
  expect(C.get(1,1)).toBeCloseTo(0.2, 2);
});

it('get', () => {
  let A = new Matrix([[1, 2, 3], [4, 5, 6]]);

  expect(A.rows).toBe(2);
  expect(A.cols).toBe(3);
  expect(A.get(0,0)).toBeCloseTo(1, 10);
  expect(A.get(0,1)).toBeCloseTo(2, 10);
  expect(A.get(0,2)).toBeCloseTo(3, 10);
  expect(A.get(1,0)).toBeCloseTo(4, 10);
  expect(A.get(1,1)).toBeCloseTo(5, 10);
  expect(A.get(1,2)).toBeCloseTo(6, 10);

  let c = A.getColumn(0);

  expect(c.length).toBe(2);
  expect(c[0]).toBeCloseTo(1, 10);
  expect(c[1]).toBeCloseTo(4, 10);

  c = A.getColumn(2);

  expect(c.length).toBe(2);
  expect(c[0]).toBeCloseTo(3, 10);
  expect(c[1]).toBeCloseTo(6, 10);

  let r = A.getRow(0);

  expect(r.length).toBe(3);
  expect(r[0]).toBeCloseTo(1, 10);
  expect(r[1]).toBeCloseTo(2, 10);
  expect(r[2]).toBeCloseTo(3, 10);

  r = A.getRow(1);

  expect(r.length).toBe(3);
  expect(r[0]).toBeCloseTo(4, 10);
  expect(r[1]).toBeCloseTo(5, 10);
  expect(r[2]).toBeCloseTo(6, 10);

  let elems = A.getElements();
  expect(elems.length).toBe(2);
  expect(elems[0].length).toBe(3);
  expect(elems[0][0]).toBeCloseTo(1, 10);
  expect(elems[0][1]).toBeCloseTo(2, 10);
  expect(elems[0][2]).toBeCloseTo(3, 10);
  expect(elems[1][0]).toBeCloseTo(4, 10);
  expect(elems[1][1]).toBeCloseTo(5, 10);
  expect(elems[1][2]).toBeCloseTo(6, 10);

  A = A.transpose();

  expect(A.rows).toBe(3);
  expect(A.cols).toBe(2);
  expect(A.get(0,0)).toBeCloseTo(1, 10);
  expect(A.get(0,1)).toBeCloseTo(4, 10);
  expect(A.get(1,0)).toBeCloseTo(2, 10);
  expect(A.get(1,1)).toBeCloseTo(5, 10);
  expect(A.get(2,0)).toBeCloseTo(3, 10);
  expect(A.get(2,1)).toBeCloseTo(6, 10);

  c = A.getColumn(0);

  expect(c.length).toBe(3);
  expect(c[0]).toBeCloseTo(1, 10);
  expect(c[1]).toBeCloseTo(2, 10);
  expect(c[2]).toBeCloseTo(3, 10);

  elems = A.getElements();

  expect(elems.length).toBe(3);
  expect(elems[0].length).toBe(2);
  expect(elems[0][0]).toBeCloseTo(1, 10);
  expect(elems[0][1]).toBeCloseTo(4, 10);
  expect(elems[1][0]).toBeCloseTo(2, 10);
  expect(elems[1][1]).toBeCloseTo(5, 10);
  expect(elems[2][0]).toBeCloseTo(3, 10);
  expect(elems[2][1]).toBeCloseTo(6, 10);
})
