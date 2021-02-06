/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';
import TableDnD from './TableDnD';

/** List of files (name, path) available for import. */
export const IMPORTABLE = [
  ['GW32 Projections', '/examples/pl-wk32-projections.csv'],
  ['GW33 Projections', '/examples/pl-wk33-projections.csv'],
  ['GW34 Projections', '/examples/pl-wk34-projections.csv'],
  ['GW35 Projections', '/examples/pl-wk35-projections.csv'],
  ['GW36 Projections', '/examples/pl-wk36-projections.csv'],
  ['GW37 Projections', '/examples/pl-wk37-projections.csv'],
  ['GW38 Projections', '/examples/pl-wk38-projections.csv'],
  ['FWD Attack Points', '/examples/form-fixture-stats-FWD.csv'],
  ['MID Attack Points', '/examples/form-fixture-stats-MID.csv'],
  ['DEF Attack Points', '/examples/form-fixture-stats-DEF.csv'],
  ['GK Attack Points', '/examples/form-fixture-stats-GK.csv'],
  ['April Dynasty Values', '/examples/dyn-values-Apr-2019.csv'],
  ['All Drafted WRs', '/examples/drafted-wrs.csv'],
  ['Truly Linear Data', '/examples/fake-linear.csv'],
  ['Truly Logistic Data', '/examples/fake-logistic.csv']
];


/** UI allowing the client to upload or select a table to import. */
export default class NewTablePanel extends React.Component {
  render() {
    return (
        <div>
          <h3>New Table</h3>
          <p>Select one of the following tables to import:</p>
          <table cellPadding="5" style={{margin: '20px', width: '100%'}}>
          <tbody>
            <tr style={{borderTop: '1px solid black'}}>
              <td><b>NFL</b></td>
              <td><a onClick={this.importTable.bind(this, 'April Dynasty Values', '/examples/dyn-values-Apr-2019.csv')}
                     href="#aprdynvalues">April Dynasty Values</a></td>
              <td><a onClick={this.importTable.bind(this, 'Drafted WRs', '/examples/drafted-wrs.csv')}
                     href="#receivers">Drafted WRs</a></td>
            </tr>
            <tr style={{borderTop: '1px solid black'}}>
              <td width="20%"><b>PL</b></td>
              <td width="40%"><a onClick={this.importTable.bind(this, 'GW38 Projections', '/examples/pl-wk38-projections.csv')}
                     href="#wk38">GW38 Projections</a></td>
              <td width="40%"><a onClick={this.importTable.bind(this, 'FWD Attack Points', '/examples/form-fixture-stats-FWD.csv')}
                     href="#form-fixture-FWD">FWD Attack Points</a></td>
            </tr>
            <tr>
              <td></td>
              <td><a onClick={this.importTable.bind(this, 'GW37 Projections', '/examples/pl-wk37-projections.csv')}
                     href="#wk37">GW37 Projections</a></td>
              <td><a onClick={this.importTable.bind(this, 'MID Attack Points', '/examples/form-fixture-stats-MID.csv')}
                     href="#form-fixture-MID">MID Attack Points</a></td>
            </tr>
            <tr>
              <td></td>
              <td width="40%"><a onClick={this.importTable.bind(this, 'GW36 Projections', '/examples/pl-wk36-projections.csv')}
                     href="#wk36">GW36 Projections</a></td>
              <td><a onClick={this.importTable.bind(this, 'DEF Attack Points', '/examples/form-fixture-stats-DEF.csv')}
                     href="#form-fixture-DEF">DEF Attack Points</a></td>
            </tr>
            <tr>
              <td></td>
              <td width="40%"><a onClick={this.importTable.bind(this, 'GW35 Projections', '/examples/pl-wk35-projections.csv')}
                     href="#wk35">GW35 Projections</a></td>
              <td><a onClick={this.importTable.bind(this, 'GK Attack Points', '/examples/form-fixture-stats-GK.csv')}
                     href="#form-fixture-GK">GK Attack Points</a></td>
            </tr>
            <tr style={{borderTop: '1px solid black',
                        borderBottom: '1px solid black'}}>
              <td><b>Fake</b></td>
              <td><a onClick={this.importTable.bind(this, 'Truly Linear Data', '/examples/fake-linear.csv')}
                     href="#linear">Truly Linear Data</a></td>
              <td><a onClick={this.importTable.bind(this, 'Truly Logistic Data', '/examples/fake-logistic.csv')}
                     href="#logistic">Truly Logistic Data</a></td>
            </tr>
          </tbody>
          </table>

          <p>Or drag your own CSV file below.</p>
          <TableDnD onFileUpload={this.props.onFileUpload}/>
        </div>);
  }

  importTable(name, path, evt) {
    evt.preventDefault();
    evt.stopPropagation();

    this.props.onFileImport(name, path);

    window['gtag']('event', 'import', {event_label: path});
  }
}
