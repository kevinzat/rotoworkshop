/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';
import Plot from 'react-plotly.js';


class PlotPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {plotType: undefined, xIndex: undefined, yIndex: undefined,
                  clIndex: undefined};
  }

  handlePlotLines(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({plotType: 'lines'});
  }

  handlePlotScatter(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({plotType: 'scatter'});
  }

  handleXColumn(index, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({xIndex: index});
  }

  handleYColumn(index, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({yIndex: index});
  }

  handleClassColumn(index, evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({clIndex: index});
  }

  handleRemove(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    this.setState({plotType: undefined, xIndex: undefined, yIndex: undefined,
                   clIndex: undefined});
  }

  render() {
    if (this.state.plotType === undefined) {
      return (
        <table className="table table-borderless">
        <tbody>
          <tr>
            <td><b>Plot Type</b></td>
            <td>
              <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle"
                        style={{backgroundColor: 'black'}}
                        type="button" id="plotTypeBtn" data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                  Choose
                </button>
                <div className="dropdown-menu" aria-labelledby="plotTypeBtn">
                  <a className="dropdown-item" href="#lines"
                     onClick={this.handlePlotLines.bind(this)}>Lines</a>
                  <a className="dropdown-item" href="#scatter"
                     onClick={this.handlePlotScatter.bind(this)}>Scatter</a>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        </table>);
    } else if (this.state.plotType === 'lines') {
      let lines = [];
      for (let j = 0; j < this.props.table.cols.length; j++) {
        let x = [];
        let y = [];
        for (let i = 0; i < this.props.table.rows.length; i++) {
          x.push(i+1);
          y.push(parseFloat(this.props.table.rows[i][j]));
        }
        lines.push({x: x, y: y, mode: 'lines',
                    name: this.props.table.cols[j].name});
      }

      return (
          <div>
            <div className="clearfix">
              <button type="button" className="btn btn-link"
                      style={{float: 'right', color: 'black'}}
                      onClick={this.handleRemove.bind(this)}>remove</button>
            </div>
            <Plot data={lines} layout={{}} style={{width: '100%'}} />
          </div>);
    } else if (this.state.plotType === 'scatter') {
      if (this.state.xIndex === undefined || this.state.yIndex === undefined) {
        let xCol;
        if (this.state.xIndex !== undefined) {
          xCol = this.props.table.cols[this.state.xIndex].name;
        } else {
          let cols = [];
          for (let j = 0; j < this.props.table.cols.length; j++) {
            cols.push(<a className="dropdown-item" href={"#col" + j}
                  onClick={this.handleXColumn.bind(this, j)} key={j}>
                  {this.props.table.cols[j].name}
                </a>);
          }
          xCol = (
              <div className="dropdown">
                <button className="btn btn-sm btn-secondary dropdown-toggle"
                        style={{backgroundColor: 'black'}}
                        type="button" id="plotXBtn" data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                  Choose
                </button>
                <div className="dropdown-menu" aria-labelledby="plotXBtn">
                  {cols}
                </div>
              </div>);
        }
  
        let yCol;
        if (this.state.yIndex !== undefined) {
          yCol = this.props.table.cols[this.state.yIndex].name;
        } else {
          let cols = [];
          for (let j = 0; j < this.props.table.cols.length; j++) {
            cols.push(<a className="dropdown-item" href={"#col" + j}
                  onClick={this.handleYColumn.bind(this, j)} key={j}>
                  {this.props.table.cols[j].name}
                </a>);
          }
          yCol = (
              <div className="dropdown">
                <button className="btn btn-sm btn-secondary dropdown-toggle"
                        style={{backgroundColor: 'black'}}
                        type="button" id="plotXBtn" data-toggle="dropdown"
                        aria-haspopup="true" aria-expanded="false">
                  Choose
                </button>
                <div className="dropdown-menu" aria-labelledby="plotXBtn">
                  {cols}
                </div>
              </div>);
        }
  
        return (
          <table className="table table-borderless">
          <tbody>
            <tr>
              <td><b>Plot Type</b></td>
              <td>Scatter</td>
            </tr>
            <tr>
              <td><b>X Column</b></td>
              <td>{xCol}</td>
            </tr>
            <tr>
              <td><b>Y Column</b></td>
              <td>{yCol}</td>
            </tr>
          </tbody>
          </table>);
      } else {
        let options = '';
        if (this.state.clIndex === undefined) {
          let cols = [];
          for (let j = 0; j < this.props.table.cols.length; j++) {
            cols.push(<a className="dropdown-item" href={"#col" + j}
                  onClick={this.handleClassColumn.bind(this, j)} key={j}>
                  {this.props.table.cols[j].name}
                </a>);
          }

          options = (
              <table className="table table-borderless">
              <tbody>
                <tr>
                  <td><b>Class Column</b></td>
                  <td>
                    <div className="dropdown">
                      <button
                          className="btn btn-sm btn-secondary dropdown-toggle"
                          style={{backgroundColor: 'black'}}
                          type="button" id="plotXBtn" data-toggle="dropdown"
                          aria-haspopup="true" aria-expanded="false">
                        None
                      </button>
                      <div className="dropdown-menu" aria-labelledby="plotXBtn">
                        {cols}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              </table>);
        }

        let rows = this.props.table.rows;
        let columns = this.props.table.cols;

        let xCol = columns[this.state.xIndex].name;
        let yCol = columns[this.state.yIndex].name;
        let layout = {title: `${xCol} by ${yCol}`}

        let data = [];
        if (this.state.clIndex === undefined) {
          data.push({x: [], y: [], mode: 'markers', type: 'scatter'});
          for (let i = 0; i < rows.length; i++) {
            data[0].x.push(rows[i][this.state.xIndex]);
            data[0].y.push(rows[i][this.state.yIndex]);
          }
        } else {
          let clCol = columns[this.state.clIndex].name;
          let groups = new Map();
          for (let i = 0; i < rows.length; i++) {
            let cls = rows[i][this.state.clIndex];
            if (!groups.has(cls))
              groups.set(cls, {x: [], y: [], mode: 'markers', type: 'scatter',
                               name: `${clCol} = ${cls}`});
            groups.get(cls).x.push(rows[i][this.state.xIndex]);
            groups.get(cls).y.push(rows[i][this.state.yIndex]);
          }

          let keys = [];  // add the groups in sorted order by value
          for (let cls of groups.keys())
            keys.push(cls);
          keys.sort();

          for (let cls of keys)
            data.push(groups.get(cls));
        }

        return (
            <div>
              <div>
                <div className="clearfix">
                  <button type="button" className="btn btn-link"
                          style={{float: 'right', color: 'black'}}
                          onClick={this.handleRemove.bind(this)}>remove</button>
                </div>
                <Plot data={data} layout={layout} style={{width: '100%'}} />
              </div>
              {options}
            </div>);
      }
    } else {
      return <p>Uh oh</p>;
    }
  }
}

export default PlotPanel;
