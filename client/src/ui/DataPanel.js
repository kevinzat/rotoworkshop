/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';
import * as assert from 'assert';
import { FormatNumber } from './FormatUtil';
import './DataPanel.css';


let MAX_COLS = 500;
let MAX_ROWS = 500;


/** Returns the given table entry as an appropriately-formatted string. */
export function FormatEntry(table, rowIndex, colIndex) {
  assert(0 <= rowIndex && rowIndex < table.rows.length);
  assert(0 <= colIndex && colIndex < table.cols.length);

  const val = table.rows[rowIndex][colIndex];
  if (val === undefined) {
    return '';
  } else if (typeof val === 'number') {
    return FormatNumber(val, table.cols[colIndex].precision);
  } else {
    return val;
  }
}


/** Displays the data from a particular table. */
export default class DataPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {lastSortIndex: undefined, lastSortAsc: false};
  }

  render() {
    let table = this.props.table;

    let rowWarn = '';
    if (table.nrows > MAX_ROWS)
      rowWarn = (<p><b>Warning</b>: only first {MAX_ROWS} rows shown</p>);

    let colWarn = '';
    if (table.ncols > MAX_COLS)
      colWarn = (<p><b>Warning</b>: only first {MAX_COLS} columns shown</p>);

    let colClass = (table.cols.length < 5) ? 'lg-table-cell' : 'table-cell';

    let headerCols = [];
    for (let j = 0; j < Math.min(MAX_COLS, table.cols.length); j++) {
      headerCols.push(
          <th scope="col" key={j} className={colClass}>
            <a href={"#sort-col"+j} className="header-sortable"
               onClick={this.sortBy.bind(this, j)}>
              {table.cols[j].name}
            </a>
          </th>);
    }

    let tableRows = [];
    for (let i = 0; i < Math.min(MAX_ROWS, table.rows.length); i++) {
      let cols = [];
      for (let j = 0; j < Math.min(MAX_COLS, table.cols.length,
                                   table.rows[i].length); j++) {
        cols.push(
            <td key={j} className={colClass}>
              {FormatEntry(table, i, j)}
            </td>);
      }
      tableRows.push(<tr key={i}>{cols}</tr>);
    }

    return (
        <div style={{overflowX: 'scroll'}}>
          {rowWarn}
          {colWarn}
          <small>
            <table className="table table-sm table-striped my-table">
              <thead style={{backgroundColor: '#6c757d', color: 'white'}}>
                <tr>{headerCols}</tr>
              </thead>
              <tbody>{tableRows}</tbody>
            </table>
          </small>
        </div>);
  }

  sortBy(index, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    let asc = (this.state.lastSortIndex !== index) || !this.state.lastSortAsc;
    this.props.table.stableSortBy(index, asc);
    this.setState({lastSortIndex: index, lastSortAsc: asc});
  }
}
