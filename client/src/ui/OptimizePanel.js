/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';
import { TypeCombinations } from '../opt/Optimize';
import { ScheduleOptimize } from '../worker/DataThread';
import './OptimizePanel.css';


export default class OptimizePanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {constraints: [], optIndex: undefined, progress: undefined};
  }

  render() {
    const table = this.props.table;

    if (this.state.progress !== undefined) {
      let pct = this.state.progress;
      return (
          <div style={{margin: '100px 20px'}}>
            <h4>Optimizing...</h4>
            <div className="progress" style={{marginTop: '50px'}}>
              <div className="progress-bar" role="progressbar"
                   style={{width: pct+'%'}} aria-valuenow={pct}
                    aria-valuemin="0" aria-valuemax="100">
                 {pct}%
              </div>
            </div>
          </div>);

    } else {
      // Display UI for changing the constraints.

      let constraints = [];
      for (let i = 0; i < this.state.constraints.length; i++) {
        let con = this.state.constraints[i];

        let conCols = [];
        for (let j = 0; j < table.cols.length; j++) {
          conCols.push(
              <a className="dropdown-item"
                href={"#col"+i+','+j} key={'col'+i+','+j}
                onClick={this.handleConColumn.bind(this, i, j)}>
                {table.cols[j].name}
              </a>);
        }
        let conDesc = (con[1] === undefined) ? 'Choose' :
            table.cols[con[1]].name;

        let optEqual = '';
        if (con[0] === 'Count') {
          optEqual = (
              <input type="text" className="form-control" id={'con'+i+'Equal'}
                  style={{width: '100px',
                          marginLeft: '10px', marginRight: '10px',
                          borderColor: 'rgb(108,117,125)', height: '2em'}}
                  value={con[3]}
                  onChange={this.handleConEqual.bind(this, i)}/>);
        }

        let badValue = '';
        if (con[2] !== '' && isNaN(parseInt(con[2], 10))) {
          badValue = (
              <span style={{marginLeft: '10px'}}>
                <span className="bad-value">(bad value)</span>
              </span>);
        }

        constraints.push(
            <li key={'con'+i} className="constraint"
                style={{marginTop: (i === 0) ? '0' : '5px'}}>
            <form className="form-inline">
              <div className="dropdown"
                   style={{marginRight: '10px'}}>
                 <button className="btn btn-sm btn-secondary dropdown-toggle"
                        style={{backgroundColor: 'white', color: 'black'}}
                        type="button" id={'conFuncBtn'+i} data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                  {con[0]}
                </button>
                <div className="dropdown-menu" aria-labelledby={'conFuncBtn'+i}>
                  <a className="dropdown-item"
                        href={"#con"+i+'Sum'} key={'con'+i+'Sum'}
                        onClick={this.handleConFunction.bind(this, i, 'Sum')}
                      >Sum</a>
                  <a className="dropdown-item"
                        href={"#con"+i+'Count'} key={'con'+i+'Count'}
                        onClick={this.handleConFunction.bind(this, i, 'Count')}
                      >Count</a>
                </div>
              </div>
              of
              <div className="dropdown"
                   style={{display: 'inline-block', marginLeft: '10px',
                           marginRight: '10px'}}>
                <button className="btn btn-sm btn-secondary dropdown-toggle"
                        style={{backgroundColor: 'white', color: 'black'}}
                        type="button" id={'conColBtn'+i} data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                  {conDesc}
                </button>
                <div className="dropdown-menu" aria-labelledby={'conColBtn'+i}>
                  {conCols}
                </div>
              </div>
              {optEqual !== '' ? ' = ' : ''}
              {optEqual}
              at most
              <input type="text" className="form-control" id={'con'+i+'Limit'}
                  style={{width: '100px', marginLeft: '10px',
                          borderColor: 'rgb(108,117,125)', height: '2em'}}
                  value={con[2]}
                  onChange={this.handleConLimit.bind(this, i)}/>
              {badValue}
              <button type="button" className="btn btn-link remove"
                  onClick={this.handleRemove.bind(this, i)}>remove</button>
            </form></li>);
      }

      let canAddNew = true;
      for (let i = 0; i < this.state.constraints.length; i++) {
        const con = this.state.constraints[i];
        if (con[1] === undefined ||
            con[2] === '' || isNaN(parseInt(con[2], 10)) ||
            (con[0] === 'Count' && con[3] === '')) {
          canAddNew = false;
        }
      }

      let conNew = '';
      if (canAddNew) {
        conNew = (
            <div>
              <button type="button" className="btn btn-link"
                  onClick={this.handleNewConstraint.bind(this)}>Add New</button>
            </div>);
      }

      // Display UI for choosing the column to maximize.

      let optCols = [];
      for (let i = 0; i < table.cols.length; i++) {
        optCols.push(
            <a className="dropdown-item" href={"#col" + i}
               onClick={this.handleOptColumn.bind(this, i)} key={i}>
              {table.cols[i].name}
            </a>);
      }

      let optDesc = (this.state.optIndex === undefined) ? 'Choose' :
          table.cols[this.state.optIndex].name;
      let optChoice = (
          <div className="dropdown"
               style={{display: 'inline-block', marginLeft: '5px'}}>
            <button className="btn btn-sm btn-secondary dropdown-toggle"
                    type="button" id="optColBtn" data-toggle="dropdown"
                    aria-haspopup="true" aria-expanded="false">
              {optDesc}
            </button>
            <div className="dropdown-menu" aria-labelledby="optColBtn">
              {optCols}
            </div>
          </div>);

      let memory = '';
      let optClass = '';

      if (canAddNew && this.state.optIndex !== undefined) {
        let typeMax = this.typesFromConstraints();
        let combNum = TypeCombinations(typeMax) * table.nrows;
        let combStr = combNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        let memNum = Math.round(32 * TypeCombinations(typeMax)/100000)/ 10;
        memory = (
            <div>
              <div style={{fontSize: '10pt'}}>
                Requires {memNum} MB of extra memory.
              </div>
              <div style={{fontSize: '10pt'}}>
                Will explore {combStr} potential combinations.
              </div>
            </div>);
      } else {
        optClass = ' disabled';
      }

      return (
          <div>
            <h4>Constraints</h4>
            <ul>{constraints}</ul>
            {conNew}

            <h4 style={{marginTop: '20px'}}>Objective</h4>
            <div>Maximize sum of {optChoice}</div>
 
            <div style={{marginTop: '20px'}}> 
              <button type="button"className={"btn btn-primary" + optClass}
                  style={{float: 'left', marginRight: '10px'}}
                  onClick={this.optimize.bind(this)}>Optimize</button>
              {memory}
            </div>
          </div>);
    }
  }

  handleNewConstraint(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    let constraints = this.state.constraints.slice(0);
    constraints.push(['Sum', undefined, '', '']);
    this.setState({constraints: constraints});
  }

  handleConFunction(conIndex, func, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    let constraints = this.state.constraints.map(a => a.slice(0));
    constraints[conIndex][0] = func;
    this.setState({constraints: constraints});
  }

  handleConColumn(conIndex, colIndex, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    let constraints = this.state.constraints.map(a => a.slice(0));
    constraints[conIndex][1] = colIndex;
    this.setState({constraints: constraints});
  }

  handleConLimit(conIndex, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    let limit = document.getElementById('con'+conIndex+'Limit');

    let constraints = this.state.constraints.map(a => a.slice(0));
    constraints[conIndex][2] = limit.value;
    this.setState({constraints: constraints});
  }

  handleConEqual(conIndex, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    let limit = document.getElementById('con'+conIndex+'Equal');

    let constraints = this.state.constraints.map(a => a.slice(0));
    constraints[conIndex][3] = limit.value;
    this.setState({constraints: constraints});
  }

  handleRemove(conIndex, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    let constraints = this.state.constraints.slice(0);
    constraints.splice(conIndex, 1);
    this.setState({constraints: constraints});
  }

  handleOptColumn(index, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({optIndex: index});
  }

  typesFromConstraints() {
    let typeMax = [];
    for (let i = 0; i < this.state.constraints.length; i++) {
      typeMax.push(parseInt(this.state.constraints[i][2], 10));
    }
    return typeMax;
  }

  optimize() {
    if (this.state.optIndex === undefined)
      return;

    ScheduleOptimize(this.props.table.name, this.state.optIndex,
        this.state.constraints.map(
            arr => [arr[0], arr[1], parseInt(arr[2], 10), arr[3]]),
        vals => this.props.onOptimizeResult(vals),
        pct => {
          this.setState({progress: pct});
        });
    this.setState({progress: 0});
  }
}
