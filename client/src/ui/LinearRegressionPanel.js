/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';
import { FormatNumber } from './FormatUtil';


/** Displays information about a linear regression model. */
export default class LinearRegressionPanel extends React.Component {
  render() {
      let [b, s] = this.props.model.params;
      let rTrain = this.props.model.trainErrs;
      let rTest = this.props.model.testErrs;

      let vars = ['(intercept)'].concat(
          this.props.model.features.map(v => v.name));

      let trows = [];
      for (let j = 0; j < vars.length; j++) {
        trows.push(
            <tr key={j}>
              <td><b>{vars[j]}</b></td>
              <td>{FormatNumber(b[j], 3)}</td>
              <td>{FormatNumber(s[j], 3)}</td>
            </tr>);
      }

      return (
          <div>
            <h2>Fit</h2>
            <table className="table table-borderless">
              <tbody>
                <tr>
                  <td width="33%"><b>Train R</b></td>
                  <td width="67%">{FormatNumber(rTrain,3)}</td>
                </tr>
                <tr>
                  <td width="33%"><b>Train R<sup>2</sup></b></td>
                  <td width="67%">{FormatNumber(rTrain*rTrain,3)}</td>
                </tr>
                <tr>
                  <td width="33%"><b>Test R</b></td>
                  <td width="67%">{FormatNumber(rTest,3)}</td>
                </tr>
                <tr>
                  <td width="33%"><b>Test R<sup>2</sup></b></td>
                  <td width="67%">{FormatNumber(rTest*rTrain,3)}</td>
                </tr>
              </tbody>
            </table>

            <h2 style={{marginTop: '50px'}}>Parameters</h2>
            <table className="table table-borderless">
              <thead>
                <tr style={{backgroundColor: '#f0f0f0'}}>
                  <th>Parameter</th>
                  <th>Estimate</th>
                  <th>Standard Error</th>
                </tr>
              </thead>
              <tbody>{trows}</tbody>
            </table>
          </div>);
  }
}
