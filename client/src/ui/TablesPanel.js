/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';
import './TablesPanel.css';


export default class TablesPanel extends React.Component {
  render() {
    var tables = [];
    for (var i = 0; i < this.props.tables.length; i++) {
      if (this.props.current === i) {
        tables.push(
            <li key={i}
                style={{background: '#d0d0d0', borderRadius: '2px',
                        listStyle: 'none', padding: '2px 0px 2px 5px'}}>
              &bull; <b>{this.props.tables[i].name}</b>
            </li>);
      } else {
        tables.push(
            <li key={i}
                style={{borderRadius: '2px',
                        listStyle: 'none', padding: '2px 0px 2px 5px'}}>
            &bull; <a href={"#table"+i} className="table-link"
                      onClick={this.selectTable.bind(this, i)}>
                      {this.props.tables[i].name}</a>
            </li>);
      }
    }

    tables.push(
        <li key="new"
            style={{borderRadius: '2px',
                    listStyle: 'none', padding: '2px 0px 2px 5px'}}>
        &#x2b; <a href={"#table-new"} className="table-link"
                  onClick={this.addTable.bind(this)}>Add New Table</a>
        </li>);

    return (
      <div className="card card-block" style={{background: '#f0f0f0'}}>
        <div style={{margin: '5px'}}>
          <h3 style={{textAlign: 'center'}}>Tables</h3>
          <hr style={{marginTop: '0'}}/>
          <ul id="tables" style={{padding: '0', margin: '0'}}>{tables}</ul>
        </div>
      </div>);
  }

  selectTable(index, evt) {
    evt.preventDefault();
    evt.stopPropagation();

    this.props.onSetCurrent(index);
  }

  addTable(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    this.props.onNewTable();
  }
}
