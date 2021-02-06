/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';
import { FormatNumber } from './FormatUtil';


/** Displays information about a logistic regression model. */
export default class LogisticRegressionPanel extends React.Component {
  render() {
    let beta = this.props.model.params;
    let [trainR2, trainErr] = this.props.model.trainErrs;
    let [testR2, testErr] = this.props.model.testErrs;

    let vars = ['(intercept)'].concat(
        this.props.model.features.map(v => v.name));

    let paramRows = [];
    for (let j = 0; j < vars.length; j++) {
      paramRows.push(
          <tr key={j}>
            <td><b>{vars[j]}</b></td>
            <td>{FormatNumber(beta[j], 3)}</td>
          </tr>);
    }

    return (
        <div>
          <h2 style={{marginTop: '25px'}}>Fit</h2>
          <table className="table table-borderless">
            <tbody>
              <tr>
                <td>Train Error</td>
                <td>{FormatNumber(trainErr, 1)}%</td>
              </tr>
              <tr>
                <td>Train pseudo-R<sup>2</sup></td>
                <td>{FormatNumber(trainR2, 2)}</td>
              </tr>
              <tr>
                <td>Test Error</td>
                <td>{FormatNumber(testErr, 1)}%</td>
              </tr>
              <tr>
                <td>Test pseudo-R<sup>2</sup></td>
                <td>{FormatNumber(testR2, 2)}</td>
              </tr>
            </tbody>
          </table>

          <h2 style={{marginTop: '25px'}}>Parameters</h2>
          <table className="table table-borderless">
            <thead>
              <tr style={{backgroundColor: '#f0f0f0'}}>
                <th>Parameter</th>
                <th>Estimate</th>
              </tr>
            </thead>
            <tbody>{paramRows}</tbody>
          </table>
        </div>);
  }
}
