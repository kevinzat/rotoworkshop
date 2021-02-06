/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';
import Table from '../shared/Table';
import DataPanel from './DataPanel';
import { LinearPredict, LogisticClassify } from '../learning/LinearModels';
import { TreeEnsembleClassify,
         TreeEnsemblePredict } from '../learning/DecisionTrees';


/** Panel that allows the user to get predictions of missing columns. */
export default class PredictPanel extends React.Component {
  constructor(props) {
    super(props);

    this.models = []
    for (let model of this.props.models) {
      if (model.appliesTo(this.props.table))
        this.models.push(model);
    }

    this.state = { modelIndex: undefined, probs: false };
  }

  handleProbabilities(evt) {
    let checkBox = document.getElementById("showProbs")
    this.setState({showProbs: checkBox.checked});
  }

  handleClassValue(val, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({showClass: val});
  }

  handleModelSelected(index, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({modelIndex: index});
  }

  handleRemove(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({modelIndex: undefined});
  }

  /** Returns the class to show probabilities for (if any). */
  getShowClass(classes) {
    let cls = this.state.showClass;
    if (cls === undefined)
      cls = Array.from(classes.keys()).reduce((a, b) => Math.max(a,b));
    return cls;
  }

  render() {
    if (this.models.length === 0) {
      return (
          <p>This table does not have the necessary columns for any of these
            models.</p>);
    } else if (this.state.modelIndex !== undefined) {
      const model = this.models[this.state.modelIndex];

      let cols = this.props.table.cols.slice(0);
      let prob = undefined;
      if ((model.type === 'Logistic Regression') && this.state.showProbs) {
        cols.unshift({name: `Pr[${model.label.name}=1]`, precision: 3,
                      missing: 0, distinct: 500});
        prob = true;
      } else if ((model.type === 'Stump Ensemble Classifier') &&
                 this.state.showProbs) {
        const [classes,,] = model.params;
        let cls = this.getShowClass(classes);
        cols.unshift({name: `Pr[${model.label.name}=${cls}]`, precision: 3,
                      missing: 0, distinct: 500});
        prob = cls;
      } else {
        cols.unshift(model.label);
      }

      let rows = [];
      for (let i = 0; i < this.props.table.rows.length; i++) {
        let row = this.props.table.rows[i].slice(0);
        row.unshift(this.prediction(model, row, prob));
        rows.push(row);
      }

      let labelChoice = '';
      if ((model.type === 'Stump Ensemble Classifier') &&
          this.state.showProbs) {
        const [classes,,] = model.params;

        let cls = this.getShowClass(classes);
        let clsVals = [];
        for (let val of classes.keys()) {
          clsVals.push(<a className="dropdown-item" href={"#clsVal" + val}
                onClick={this.handleClassValue.bind(this, val)}
                key={'clsVal'+val}>{model.label.name}={val}</a>);
        }

        labelChoice = (
            <div className="dropdown"
                 style={{display: 'inline-block', marginLeft: '0.5em'}}>
              <button
                 className="btn btn-sm btn-secondary dropdown-toggle"
                 style={{backgroundColor: 'rgb(208,208,208)',
                         border: '1px solid rgb(208,208,208)',
                         color: 'black'}}
                 type="button" id="clsValBtn" data-toggle="dropdown"
                 aria-haspopup="true" aria-expanded="false">
                {model.label.name}={cls}
              </button>
              <div className="dropdown-menu" aria-labelledby="clsValBtn">
                {clsVals}
              </div>
            </div>);
      }

      let table = new Table(this.props.table.name, cols, rows);

      return (
          <div>
            {labelChoice}
            <div className="clearfix">
              <button type="button" className="btn btn-link"
                      style={{float: 'right', color: 'black'}}
                      onClick={this.handleRemove.bind(this)}>remove</button>
            </div>
            <DataPanel table={table} />
          </div>);

    } else {
      let models = [];
      for (let j = 0; j < this.models.length; j++) {
        models.push(<a className="dropdown-item" href={"#model" + j}
              onClick={this.handleModelSelected.bind(this, j)} key={j}>
              {this.models[j].name}
            </a>);
      }

      return (
        <div>
          <table className="table table-borderless">
          <tbody>
            <tr>
              <td><b>Model</b></td>
              <td>
                <div className="dropdown">
                  <button className="btn btn-sm btn-secondary dropdown-toggle"
                          style={{backgroundColor: 'black'}}
                          type="button" id="modelBtn" data-toggle="dropdown"
                          aria-haspopup="true" aria-expanded="false">
                    Choose
                  </button>
                  <div className="dropdown-menu" aria-labelledby="modelBtn">
                    {models}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
          </table>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="showProbs"
                   onChange={this.handleProbabilities.bind(this)}>
            </input>
            <label className="form-check-label" htmlFor="showProbs">
              Show probabilities (classifiers only)
            </label>
          </div>
        </div>);
    }
  }

  /** Returns the prediction of the given model on the given row. */
  prediction(model, row, prob) {
    const modelRow = model.rowFrom(this.props.table, row);

    if (model.type === 'Linear Regression') {
      const [beta, ] = model.params;
      return LinearPredict(beta, modelRow);

    } else if (model.type === 'Logistic Regression') {
      const beta = model.params;
      return LogisticClassify(beta, modelRow, prob);

    } else if (model.type === 'Stump Ensemble Classifier') {
      const [classes, trees, treeWeights] = model.params;
      return TreeEnsembleClassify(
          classes, trees, treeWeights, modelRow, prob);

    } else if (model.type === 'Stump Ensemble Regressor') {
      const [trees, treeWeights] = model.params;
      return TreeEnsemblePredict(trees, treeWeights, modelRow);

    } else {
      console.error(`Bad model type ${model.type}`);
    }
  }
}
