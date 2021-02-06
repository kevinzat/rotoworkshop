/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';
import Plot from 'react-plotly.js';
import { FormatNumber } from './FormatUtil';
import { StumpEnsembleFeatureEstimates } from '../learning/DecisionTrees';
import { Normalize } from '../learning/LearnUtil';


let TREE_SIZES = [5, 10, 20, 40, 80, 100];
let MAX_TREE_SIZE = 100;


/** Displays information about a stump ensemble regression model. */
export default class StumpEnsembleRegressorPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {plotColumn: undefined, allTreeSizes: false};
  }

  handlePlotColumn(index, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({plotColumn: index});
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
    let [trees, treeWeights] = this.props.model.params;
    treeWeights = Normalize(treeWeights);  // Normalize the tree weights.

    // Record the names in the order used by the tree.
    let names = this.props.model.features.map(v => v.name);

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
        const pr = Precision(Math.max(testErr, trainErr));
        testFit.push(<td key={numTrees}>{FormatNumber(testErr, pr)}</td>);
        trainFit.push(<td key={numTrees}>{FormatNumber(trainErr, pr)}</td>);
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
      let errPrec = Precision(Math.max(testErr, trainErr));
      fitInfo = (
            <table className="table table-borderless">
              <tbody>
                <tr>
                  <td>Train Error</td>
                  <td>{FormatNumber(trainErr, errPrec)}</td>
                </tr>
                <tr>
                  <td>Test Error</td>
                  <td>{FormatNumber(testErr, errPrec)}</td>
                </tr>
              </tbody>
            </table>);
      }

    let treeSizes = (this.state.allTreeSizes) ?
        TREE_SIZES : [MAX_TREE_SIZE];

    if (this.state.plotColumn === undefined) {

      // Find the weight placed on each feature used.
      let colWeight = SumWeights(trees, treeWeights);
      for (let index of colWeight.keys()) {
        colWeight.set(index, (this.state.allTreeSizes) ?
            [0, 0, 0, 0, 0, colWeight.get(index)] : [colWeight.get(index)]);
      }

      // Expand the information to include weights for other sizes (if any).
      for (let i = 0; i < treeSizes.length - 1; i++) {
        let numTrees = treeSizes[i];
        let newTrees = trees.slice(0, numTrees);
        let newWeights = Normalize(treeWeights.slice(0, numTrees));
        let newColWeights = SumWeights(newTrees, newWeights);
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
              <div className="dropdown" style={{display: 'inline-block'}}>
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
      let labelName = this.props.model.label.name
      let layout = {title: `${labelName} vs ${names[this.state.plotColumn]}`};
      let data = [];

      for (let numTrees of treeSizes) {
        let newTrees = trees.slice(0, numTrees);
        let newWeights = Normalize(treeWeights.slice(0, numTrees));
        let estimates = StumpEnsembleFeatureEstimates(
            newTrees, newWeights, this.state.plotColumn);

        let [x, y] = PlotEstimates(estimates);
        data.push({x: x, y: y, type: 'scatter', showlegend: false,
                   name: `${numTrees} trees`,
                   opacity: numTrees / MAX_TREE_SIZE,
                   hoverinfo: (numTrees === MAX_TREE_SIZE) ? 'all' : 'none',
                   mode: (numTrees === MAX_TREE_SIZE) ?
                       'lines+markers': 'lines',
                   line: {color: 'rgb(38,120,178)'}});
      }

      return (
          <div>
            {options}

            <h2 style={{marginTop: '25px'}}>Fit</h2>
            {fitInfo}

            <h2 style={{marginTop: '25px'}}>Parameters</h2>
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

/** Returns the (x,y) pairs to plot the given function. */
function PlotEstimates(estimates) {
  let n = estimates.length;

  // Cut off the first and last segment to have finite length.
  let stepSize = (estimates.length === 2) ? 0.1 * estimates[0][2] :
          (estimates[n-1][0] - estimates[0][2]) / Math.max(n, 3);
  estimates[0][0] = estimates[0][2] - stepSize;
  estimates[n-1][2] = estimates[n-1][0] + stepSize;

  let xs = [], ys = [];
  for (let j = 0; j < n; j++) {
    xs.push(estimates[j][0]);
    ys.push(estimates[j][1]);
    xs.push(estimates[j][2] - ((j+1 < n) ? 1e-9 : 0));
    ys.push(estimates[j][1]);
  }

  return [xs, ys];
}

/** Returns the precision to use for displaying the given number. */
function Precision(val) {
  val = Math.abs(val);
  if (val < 1e-5) return 8;
  if (val < 1e-4) return 7;
  if (val < 1e-3) return 6;
  if (val < 1e-2) return 5;
  if (val < 1e-1) return 4;
  if (val < 1e0) return 3;
  if (val < 1e1) return 2;
  return 1;
}

/** Return a map from parameter to sum of the weight of trees using it. */
function SumWeights(trees, treeWeights) {
  let colWeight = new Map();
  for (let i = 0; i < trees.length; i++) {
    const t = trees[i].feature
    if (colWeight.has(t)) {
      colWeight.set(t, colWeight.get(t) + treeWeights[i]);
    } else {
      colWeight.set(t, treeWeights[i]);
    }
  }
  return colWeight;
}
