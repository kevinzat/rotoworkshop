/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import { InitRandomSeed, RandomPermute } from '../util/RandomUtil';


/**
 * Stores a database table and schema. The fields name, cols, and rows can be
 * accessed directly but should not be mutated. Cols is a map that includes
 * name, precision (if a number), and number of missing and distinct values.
 * nrows and ncols are the number of rows and columns in the original data.
 */
class Table {
  constructor(name, cols, rows, ncols, nrows) {
    this.name = name;
    this.cols = cols;  // {name, precision, missing, distinct}
    this.rows = rows;
    this.ncols = (ncols !== undefined) ? ncols : cols.length;
    this.nrows = (nrows !== undefined) ? nrows : rows.length;
  }

  subTable(indexes) {
    let rows = [];
    for (let i = 0; i < indexes.length; i++)
      rows.push(this.rows[indexes[i]]);
    return new Table(this.name, this.cols, rows, this.ncols, rows.length);
  }

  /** Returns a random sample of 500 rows (or all the rows if <500). */
  getSampleRows() {
    if (this.rows.length <= 500)
      return this.rows.slice(0);

    let indexes = this.rows.map((val, index) => index);
    InitRandomSeed(5678);
    RandomPermute(indexes);

    let sampleRows = [];
    for (let i = 0; i < 500; i++)
      sampleRows.push(this.rows[indexes[i]]);
    return sampleRows;
  }

  /** Stably re-sorts the rows by their values in this column. */
  stableSortBy(colIndex, asc) {
    this.rows = this.rows
        .map((val, index) => [val, index])
        .sort((v1, v2) => {
            if (v1[0][colIndex] < v2[0][colIndex]) {
              return asc ? -1 : +1;
            } else if (v1[0][colIndex] > v2[0][colIndex]) {
              return asc ? +1 : -1;
            } else {
              return v1[1] - v2[1];  // stay stable regardless of asc/desc
            }
        }).map(v => v[0]);
  }
}

export default Table;
