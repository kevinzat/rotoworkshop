/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import ParseCSV from 'csv-parse/lib/es5/sync';
import Table from '../shared/Table';


/**
 * Returns the value of the string as a float or undefined if missing/null. If
 * neither of those applies, it returns the original string.
 */
function parseFloatOrNullOrString(str) {
  let str2 = str.trim().toLowerCase();
  if (str2 === '' || str2 === 'null')
    return undefined;
  let val = parseFloat(str2);
  return isNaN(val) ? str : val;
}


/**
 * Returns the maximum precision (digits after decimal point), number of
 * missing values, and number of distinct values in the column.
 */
function columnStats(rows, colIndex) {
  let maxPrec = 0;
  let numMissing = 0;
  let values = new Set();

  for (let i = 0; i < rows.length; i++) {
    let prec = 0;
    let val = rows[i][colIndex];
    if (val === undefined) {
      numMissing += 1;
    } else if (typeof val == 'number') {
      values.add(val);
      while (prec < 6 && Math.abs(Math.round(val) - val) >= 5e-7) {
        prec += 1;
        val *= 10;
      }
      maxPrec = Math.max(maxPrec, prec);
    } else {
      values.add(val);
    }
  }

  return [maxPrec, numMissing, values.size];
}


/**
 * Stores a database table and schema. The fields name, cols, and rows can be
 * accessed directly but should not be mutated.
 */
export default function ParseTable(name, content) {
  var rows = ParseCSV(content, {skip_empty_lines: true});

  var colNames = rows[0];
  var ncols = colNames.length;
  if (colNames.length > 5000)
    colNames = colNames.slice(0, 5000);  // put some limit on columns

  rows = rows.slice(1);
  rows = rows.map(r => r.map(parseFloatOrNullOrString));

  var cols = colNames.map(n => ({name: n}));
  for (let j = 0; j < cols.length; j++) {
    const [maxPrec, missing, distinct] = columnStats(rows, j);
    cols[j].precision = maxPrec;
    cols[j].missing = missing;
    cols[j].distinct = distinct;
  }

  return new Table(name, cols, rows, ncols);
}
