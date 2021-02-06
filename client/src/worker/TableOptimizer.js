/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import { BinPackByType } from '../opt/Optimize';


/**
 * Returns the best model of the given type for learning the given column,
 * along with quality of fit metrics.
 */
export function OptimizeColumn(table, colIndex, constraints, onProgress) {

  let typeMax = [];
  for (let j = 0; j < constraints.length; j++)
    typeMax.push(constraints[j][2]);

  let types = [], values = [];
  for (let i = 0; i < table.rows.length; i++) {

    // If any necessary value is missing, skip this row.
    let hasMissing = table.rows[i][colIndex] === undefined;
    for (let j = 0; j < constraints.length; j++) {
      if (table.rows[i][colIndex] === undefined)
        hasMissing = true;
    }

    if (!hasMissing) {
      values.push(parseFloat(table.rows[i][colIndex]));

      let type = [];
      for (let j = 0; j < constraints.length; j++) {
        let [func, col, , val] = constraints[j];
        if (func === 'Count') {
          type.push(table.rows[i][col] === val ? 1 : 0);
        } else {
          type.push(table.rows[i][col]);
        }
      }
      types.push(type);
    }
  }

  return BinPackByType(types, values, typeMax, t => true, onProgress);
}
