/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';


/** Lets the user create a model for learning a particular column. */
export default class LearnPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { labelIndex: undefined };
  }

  handleLabelColumn(index, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({labelIndex: index});
  }

  handleModelType(modelType, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.props.onBuildModel(this.state.labelIndex, modelType);

    window['gtag']('event', 'learn', {event_label: modelType});
  }

  render() {
    if (this.state.labelIndex === undefined) {
      let cols = [];
      for (let j = 0; j < this.props.table.cols.length; j++) {
        cols.push(<a className="dropdown-item" href={"#col" + j}
              onClick={this.handleLabelColumn.bind(this, j)} key={j}>
              {this.props.table.cols[j].name}
            </a>);
      }

      return (
          <table className="table table-borderless">
          <tbody>
            <tr>
              <td><b>Column</b></td>
              <td>
                <div className="dropdown">
                  <button className="btn btn-sm btn-secondary dropdown-toggle"
                          style={{backgroundColor: 'black'}}
                          type="button" id="plotYBtn" data-toggle="dropdown"
                          aria-haspopup="true" aria-expanded="false">
                    Choose
                  </button>
                  <div className="dropdown-menu" aria-labelledby="plotYBtn">
                    {cols}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
          </table>);

    } else {

      const labelColumn = this.props.table.cols[this.state.labelIndex];

      let models = [];
      if (labelColumn.distinct <= 10 &&
          5 * labelColumn.distinct <= this.props.table.nrows) {
        models.push(
            <a className="dropdown-item" href="#linear" key="linear"
               onClick={this.handleModelType.bind(this, 'Logistic Regression')}>
              Logistic Regression
            </a>);
        models.push(
            <a className="dropdown-item" href="#stumpcls" key="stumpcls"
               onClick={this.handleModelType.bind(this, 'Stump Ensemble Classifier')}>
              Stump Ensemble Classifier
            </a>);
      } else {
        models.push(
            <a className="dropdown-item" href="#logistic" key="logistic"
               onClick={this.handleModelType.bind(this, 'Linear Regression')}>
              Linear Regression
            </a>);
        models.push(
            <a className="dropdown-item" href="#stumpreg" key="stumpreg"
               onClick={this.handleModelType.bind(this, 'Stump Ensemble Regressor')}>
              Stump Ensemble Regressor
            </a>);
      }

      return (
          <table className="table table-borderless">
          <tbody>
            <tr>
              <td><b>Column</b></td>
              <td>{labelColumn.name}</td>
            </tr>
            <tr>
              <td><b>Model Type</b></td>
              <td>
                <div className="dropdown">
                  <button className="btn btn-sm btn-secondary dropdown-toggle"
                          style={{backgroundColor: 'black'}}
                          type="button" id="plotModelBtn" data-toggle="dropdown"
                          aria-haspopup="true" aria-expanded="false">
                    Choose
                  </button>
                  <div className="dropdown-menu" aria-labelledby="plotModelBtn">
                    {models}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
          </table>);
    }
  }
}
