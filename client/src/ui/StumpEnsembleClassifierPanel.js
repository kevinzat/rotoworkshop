/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';
import Plot from 'react-plotly.js';
import { FormatNumber } from './FormatUtil';
import { StumpEnsembleFeatureWeights } from '../learning/DecisionTrees';
import { Normalize } from '../learning/LearnUtil';


let TREE_SIZES = [5, 10, 20, 40, 80, 100];
let MAX_TREE_SIZE = 100;


/** Displays information about a stump ensemble regression model. */
export default class StumpEnsembleClassifierPanel extends React.Component {
  constructor(props) {
    super(props);

    const classes = this.props.model.params[0];
    this.state = {
          allSizes: false, plotColumn: undefined,
          cls: Array.from(classes.keys()).reduce((a, b) => Math.max(a,b))
        };
  }

  handlePlotColumn(index, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({plotColumn: index});
  }

  handleClassValue(val, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({cls: val});
  }

  handleAllSizes(evt) {
    let checkBox = document.getElementById("allTreeSizes")

    this.setState({allTreeSizes: checkBox.checked});
  }

  handleRemove(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({plotColumn: undefined});
  }

  render() {
    let [classes, trees, treeWeights] = this.props.model.params;
    treeWeights = Normalize(treeWeights);

    let names = this.props.model.features.map(v => v.name);
    let clsName = this.props.model.label.name;
    let cls = this.state.cls;

    let options = (
        <div className="form-check" style={{float: 'right'}}>
          <input className="form-check-input" type="checkbox"
                 id="allTreeSizes"
                 onChange={this.handleAllSizes.bind(this)}>
          </input>
          <label className="form-check-label" htmlFor="allTreeSizes">
            Show all tree sizes
          </label>
        </div>);

    // Show the error rate on the training and test data
    let fitInfo;
    if (this.state.allTreeSizes) {
      let trainFit = [<td key='label'><b>Train Error</b></td>];
      let testFit = [<td key='label'><b>Test Error</b></td>];
      for (let i = 0; i < TREE_SIZES.length; i++) {
        const trainErr = this.props.model.trainErrs[i];
        const testErr = this.props.model.testErrs[i];
        const numTrees = TREE_SIZES[i];
        testFit.push(<td key={numTrees}>{FormatNumber(testErr, 1)}%</td>);
        trainFit.push(<td key={numTrees}>{FormatNumber(trainErr, 1)}%</td>);
      }

      fitInfo = ( // TREE_SIZES
            <table className="table table-borderless">
              <thead>
                <tr>
                  <th></th>
                  <th>5 Trees</th>
                  <th>10 Trees</th>
                  <th>20 Trees</th>
                  <th>40 Trees</th>
                  <th>80 Trees</th>
                  <th>100 Trees</th>
                </tr>
              </thead>
              <tbody>
                <tr>{trainFit}</tr>
                <tr>{testFit}</tr>
              </tbody>
            </table>);
    } else {
      let trainErr = this.props.model.trainErrs[TREE_SIZES.length-1];
      let testErr = this.props.model.testErrs[TREE_SIZES.length-1];
      fitInfo = (
            <table className="table table-borderless">
              <tbody>
                <tr>
                  <td>Train Error</td>
                  <td>{FormatNumber(trainErr, 1)}%</td>
                </tr>
                <tr>
                  <td>Test Error</td>
                  <td>{FormatNumber(testErr, 1)}%</td>
                </tr>
              </tbody>
            </table>);
    }

    let treeSizes = (this.state.allTreeSizes) ?
        TREE_SIZES : [MAX_TREE_SIZE];

    if (this.state.plotColumn === undefined) {

      // Find the maximum weight achievable by each feature used.
      let colWeight = MaxWeights(cls, trees, treeWeights, names);
      for (let index of colWeight.keys()) {
        colWeight.set(index, (this.state.allTreeSizes) ?
            [0, 0, 0, 0, 0, colWeight.get(index)] : [colWeight.get(index)]);
      }

      // Expand the information to include weights for other sizes (if any).
      for (let i = 0; i < treeSizes.length - 1; i++) {
        let numTrees = treeSizes[i];
        let newTrees = trees.slice(0, numTrees);
        let newWeights = Normalize(treeWeights.slice(0, numTrees));
        let newColWeights = MaxWeights(cls, newTrees, newWeights, names);
        for (let index of newColWeights.keys())
          colWeight.get(index)[i] = newColWeights.get(index);
      }

      // Get a list of the included parameters in order by weight.
      let indexes = Array.from(colWeight.keys());
      indexes.sort((j1, j2) => {
            let w1 = colWeight.get(j1);
            let w2 = colWeight.get(j2);
            for (let i = 0; i < w1.length; i++) {
              if (w1[i] < w2[i]) return +1;
              if (w1[i] > w2[i]) return -1;
            }
            return 0;
          });

      // Create a table that displays the weights.
      let weightInfo;
      if (this.state.allTreeSizes) {
        let trows = [];
        for (let j of indexes) {
          let wts = colWeight.get(j);
          trows.push(  // TREE_SIZES
              <tr key={'row'+j}>
                <td><b>{names[j]}</b></td>
                <td>{(wts[0] > 0) ? FormatNumber(wts[0], 3) : ''}</td>
                <td>{(wts[1] > 0) ? FormatNumber(wts[1], 3) : ''}</td>
                <td>{(wts[2] > 0) ? FormatNumber(wts[2], 3) : ''}</td>
                <td>{(wts[3] > 0) ? FormatNumber(wts[3], 3) : ''}</td>
                <td>{(wts[4] > 0) ? FormatNumber(wts[4], 3) : ''}</td>
                <td>{(wts[5] > 0) ? FormatNumber(wts[5], 3) : ''}</td>
              </tr>);
        }

        weightInfo = (
            <table className="table table-borderless"
                   style={{marginTop: '20px'}}>
              <thead>
                <tr style={{backgroundColor: '#f0f0f0'}}>
                  <th>Parameter</th>
                  <th>5 Trees</th>
                  <th>10 Trees</th>
                  <th>20 Trees</th>
                  <th>40 Trees</th>
                  <th>80 Trees</th>
                  <th>100 Trees</th>
                </tr>
              </thead>
              <tbody>{trows}</tbody>
            </table>);

      } else {
        let trows = [];
        for (let j of indexes) {
          let wts = colWeight.get(j);
          trows.push(
              <tr key={'row'+j}>
                <td><b>{names[j]}</b></td>
                <td>{FormatNumber(wts[0], 3)}</td>
              </tr>);
        }

        weightInfo = (
            <table className="table table-borderless"
                   style={{marginTop: '10px'}}>
              <thead>
                <tr style={{backgroundColor: '#f0f0f0'}}>
                  <th>Parameter</th>
                  <th>Max Weight</th>
                </tr>
              </thead>
              <tbody>{trows}</tbody>
            </table>);
      }

      // Choose the class for which the weights are shown.
      let clsVals = [];
      for (let val of classes.keys()) {
        clsVals.push(<a className="dropdown-item" href={"#clsVal" + val}
              onClick={this.handleClassValue.bind(this, val)}
              key={'clsVal'+val}>{clsName}={val}</a>);
      }

      // Create dropdown items for plotting each feature.
      let cols = [];
      for (let j of indexes) {
        cols.push(<a className="dropdown-item" href={"#plotCol" + j}
              onClick={this.handlePlotColumn.bind(this, j)} key={'plot'+j}>
              {names[j]}
            </a>);
      }

      return (
          <div>
            {options}

            <h2 style={{marginTop: '25px'}}>Fit</h2>
            {fitInfo}

            <h2 style={{marginTop: '25px'}}>Parameters</h2>
            <div style={{marginTop: '20px'}}>
              Show
              <div className="dropdown"
                   style={{display: 'inline-block', marginLeft: '0.5em'}}>
                <button
                   className="btn btn-sm btn-secondary dropdown-toggle"
                   style={{backgroundColor: 'rgb(208,208,208)',
                           border: '1px solid rgb(208,208,208)',
                           color: 'black'}}
                   type="button" id="clsValBtn" data-toggle="dropdown"
                   aria-haspopup="true" aria-expanded="false">
                  {clsName}={cls}
                </button>
                <div className="dropdown-menu" aria-labelledby="clsValBtn">
                  {clsVals}
                </div>
              </div>
              <div className="dropdown"
                   style={{display: 'inline-block', marginLeft: '1em'}}>
                <button
                   className="btn btn-sm btn-secondary dropdown-toggle"
                   style={{backgroundColor: 'black'}}
                   type="button" id="plotColBtn" data-toggle="dropdown"
                   aria-haspopup="true" aria-expanded="false">
                  Plot
                </button>
                <div className="dropdown-menu"
                     aria-labelledby="plotColBtn">
                  {cols}
                </div>
              </div>
              {weightInfo}
            </div>
          </div>);

    } else {
      let labelName = `Pr[${this.props.model.label.name}=${this.state.cls}]`;
      let layout = {title: `${labelName} vs ${names[this.state.plotColumn]}`};
      let data = [];
      let undefWeight;

      for (let numTrees of treeSizes) {
        let newTrees = trees.slice(0, numTrees);
        let newWeights = Normalize(treeWeights.slice(0, numTrees));
        let [weights, udw] = StumpEnsembleFeatureWeights(
            newTrees, newWeights, this.state.plotColumn, cls);
        if (numTrees === MAX_TREE_SIZE) undefWeight = udw;

        let [x, y] = PlotWeights(weights);
        data.push({x: x, y: y, type: 'scatter', showlegend: false,
                   name: `${numTrees} trees`,
                   opacity: numTrees / MAX_TREE_SIZE,
                   hoverinfo: (numTrees === MAX_TREE_SIZE) ? 'all' : 'none',
                   mode: (numTrees === MAX_TREE_SIZE) ?
                       'lines+markers': 'lines',
                   line: {color: 'rgb(38,120,178)'}});
      }

      // Show information about weight for undefined only if this feature
      // has some undefined values.
      let undefInfo = '';
      if (this.props.model.label.missing > 0) {
        undefInfo = (
            <div style={{textAlign: 'right'}}>
              <p>Weight {FormatNumber(undefWeight, 3)} for undefined</p>
            </div>);
      }

      return (
          <div>
            {options}

            <h2 style={{marginTop: '25px'}}>Fit</h2>
            {fitInfo}

            <h2 style={{marginTop: '25px'}}>Parameters</h2>
            {undefInfo}
            <div>
              <div className="clearfix">
                <a href="#remove" style={{float: 'right', color: 'black'}}
                   onClick={this.handleRemove.bind(this)}>remove</a>
              </div>
              <Plot data={data} layout={layout} style={{width: '100%'}} />
            </div>
          </div>);
    }
  }
}


/** Returns the (x,y) pairs to plot the given weight function. */
function PlotWeights(weights) {
  let n = weights.length;

  // Cut off the first and last segment to have finite length.
  let stepSize = (weights.length === 2) ? 0.1 * weights[0][2] :
          (weights[n-1][0] - weights[0][2]) / Math.max(n, 3);
  weights[0][0] = weights[0][2] - stepSize;
  weights[n-1][2] = weights[n-1][0] + stepSize;

  let xs = [], ys = [];
  for (let j = 0; j < n; j++) {
    xs.push(weights[j][0]);
    ys.push(weights[j][1]);
    xs.push(weights[j][2] - ((j+1 < n) ? 1e-9 : 0));
    ys.push(weights[j][1]);
  }

  return [xs, ys];
}

/** Return a map from parameter to maximum weight achievable from it. */
function MaxWeights(cls, trees, treeWeights, names) {
  let colWeight = new Map();
  for (let j = 0; j < names.length; j++) {
    let [wts, undWt] =
        StumpEnsembleFeatureWeights(trees, treeWeights, j, cls);
    let maxWt = Math.max(undWt,
        wts.map(r => r[1]).reduce((a,b) => Math.max(a,b)));
    if (maxWt > 0)
      colWeight.set(j, maxWt);
  }
  return colWeight;
}
