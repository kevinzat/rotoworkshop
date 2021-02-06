/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import SVD from './SVD';


/** Simple matrix implementation that wraps an array of arrays. */
export default class Matrix {
  constructor(elems, transpose=false) {
    this.elems_ = elems;
    this.transpose_ = transpose;
    this.rows = transpose ? elems[0].length : elems.length;
    this.cols = transpose ? elems.length : elems[0].length;
  }

  /** Returns a matrix that is the transpose of this one. */
  transpose() {
    return new Matrix(this.elems_, !this.transpose_);
  }

  /** Returns an m-by-n matrix of zeros. */
  static zeros(m, n) {
    let elems = [];
    for (let i = 0; i < m; i++) {
      let r = [];
      for (let j = 0; j < n; j++)
        r.push(0);
        elems.push(r);
    }
    return new Matrix(elems);
  }

  /** Returns an n-by-n identity matrix. */
  static eye(n) {
    let A = Matrix.zeros(n, n);
    for (let i = 0; i < n; i++)
      A.elems_[i][i] = 1;
    return A;
  }

  /** Returns a diagonal matrix with values from s along the diagonal. */
  static diag(s) {
    let A = Matrix.zeros(s.length, s.length);
    for (let i = 0; i < s.length; i++)
      A.elems_[i][i] = s[i];
    return A;
  }

  /** Returns the given element of the matrix. */
  get(i, j) {
    if (i < 0 || this.rows < i)
      throw new Error(`Bad row ${i} (of ${this.rows})`);
    if (j < 0 || this.cols < j)
      throw new Error(`Bad row ${j} (of ${this.cols})`);

    return this.transpose_ ? this.elems_[j][i] : this.elems_[i][j];
  }

  /** Returns the elements in the given column. */
  getColumn(j) {
    let c = [];
    for (let i = 0; i < this.rows; i++)
      c.push(this.get(i, j));
    return c;
  }

  /** Returns the elements in the given row. */
  getRow(i) {
    let r = [];
    for (let j = 0; j < this.cols; j++)
      r.push(this.get(i, j));
    return r;
  }

  /** Returns a copy of the elements of the matrix. */
  getElements() {
    let elems = [];
    for (let i = 0; i < this.rows; i++) {
      let r = [];
      for (let j = 0; j < this.cols; j++)
        r.push(this.get(i, j));
      elems.push(r);
    }
    return elems;
  }

  /** Returns the result of adding the two given matrices. */
  add(M) {
    if (this.rows !== M.rows)
      throw new Error(`Differing number of rows: ${this.cols} vs ${M.cols}`);
    if (this.cols !== M.cols)
      throw new Error(`Differing number of cols: ${this.rows} vs ${M.rows}`);

    let elems = [];
    for (let i = 0; i < this.rows; i++) {
      let r = [];
      for (let j = 0; j < this.cols; j++) {
        r.push(this.get(i, j) + M.get(i, j));
      }
      elems.push(r);
    }
    return new Matrix(elems);
  }

  /** Returns the result of subtracting the two given matrices. */
  sub(M) {
    if (this.rows !== M.rows)
      throw new Error(`Differing number of rows: ${this.cols} vs ${M.cols}`);
    if (this.cols !== M.cols)
      throw new Error(`Differing number of cols: ${this.rows} vs ${M.rows}`);

    let elems = [];
    for (let i = 0; i < this.rows; i++) {
      let r = [];
      for (let j = 0; j < this.cols; j++) {
        r.push(this.get(i, j) - M.get(i, j));
      }
      elems.push(r);
    }
    return new Matrix(elems);
  }

  /** Returns the result of multiplying with the given matrix. */
  mul(M) {
    if (this.cols !== M.rows)
      throw new Error(`Wrong dimensions: ${this.cols} vs ${M.rows}`);

    let elems = [];
    for (let i = 0; i < this.rows; i++) {
      let r = [];
      for (let j = 0; j < M.cols; j++) {
        let s = 0;
        for (let k = 0; k < this.cols; k++)
          s += this.get(i,k) * M.get(k,j);
        r.push(s);
      }
      elems.push(r);
    }
    return new Matrix(elems);
  }

  /** Returns the inverse on the subspace of nonzero singular values. */
  pseudoInverse(tol=1e-10) {
    let [U, s, V] = SVD(
        this.transpose_ ? this.getElements() : this.elems_, this.transpose_);

    for (let i = 0; i < s.length; i++)
      s[i] = Math.abs(s[i]) <= tol ? 0 : 1/s[i];

    U = new Matrix(U);
    V = new Matrix(V);
    return V.mul(Matrix.diag(s, V.cols, V.cols)).mul(U.transpose());
  }
}
