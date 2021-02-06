/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';
import Table from '../shared/Table';
import TablesPanel from './TablesPanel';
import NewTablePanel from './NewTablePanel';
import { IMPORTABLE } from './NewTablePanel';
import PlotPanel from './PlotPanel';
import LearnPanel from './LearnPanel';
import PredictPanel from './PredictPanel';
import DataPanel from './DataPanel';
import OptimizePanel from './OptimizePanel';
import Model from '../shared/Model';
import ModelsPanel from './ModelsPanel';
import LinearRegressionPanel from './LinearRegressionPanel';
import LogisticRegressionPanel from './LogisticRegressionPanel';
import StumpEnsembleClassifierPanel from './StumpEnsembleClassifierPanel';
import StumpEnsembleRegressorPanel from './StumpEnsembleRegressorPanel';
import { ScheduleLoad, ScheduleImport,
         ScheduleLearn } from '../worker/DataThread';
import './MainBody.css';


/** Special suffix to add to names to indicate the model type. */
const MODEL_SUFFIX = {
    'Linear Regression': ' (Linear)',
    'Logistic Regression': ' (Logistic)',
    'Stump Ensemble Classifier': ' (Stump Cls)',
    'Stump Ensemble Regressor': ' (Stump Reg)'
  };


/** Test for unsupported browsers */
function IsUnsupportedBrowser() {
  // Firefox 1.0+
  const isFirefox = typeof InstallTrigger !== 'undefined';

  // Safari 3.0+ "[object HTMLElementConstructor]" 
  const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof window['safari'] !== 'undefined' && window['safari'].pushNotification));

  // Chrome 1+
  const isChrome = !!window.chrome && !(typeof window.opr !== "undefined") &&
      !(window.navigator.userAgent.indexOf("Edge") > -1);

  return !(isChrome || isFirefox || isSafari);
}


/** Displays the main body of the page (all excluding the title/top bar). */
export default class MainBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {tables: [], tableIndex: undefined,
                  models: [], modelIndex: undefined,
                  show: undefined, progress: undefined};

    // Open a file if specified
    if (props.open) {
      for (let [name, path] of IMPORTABLE) {
        if (name === props.open) {
          setTimeout(() => this.handleImportFile(name, path), 0);
          break;
        }
      }
    }
  }

  setCurrentTable(index) {
    this.setState({tableIndex: index, show: 'table-data',
                   modelIndex: undefined});
  }

  setCurrentModel(index) {
    this.setState({tableIndex: undefined, show: undefined,
                   modelIndex: index});
  }

  handleNewTable() {
    this.setState({tableIndex: undefined, show: 'table-new',
                   modelIndex: undefined});
  }

  showTableData(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    if (this.state.show !== 'table-data')
      this.setState({show: 'table-data'});
  }

  showTablePlot(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    if (this.state.show !== 'table-plot')
      this.setState({show: 'table-plot'});
  }

  showTableLearn(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    if (this.state.show !== 'table-learn')
      this.setState({show: 'table-learn'});
  }

  showTableOptimize(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    if (this.state.show !== 'table-optimize')
      this.setState({show: 'table-optimize'});
  }

  showTablePredict(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    if (this.state.show !== 'table-predict')
      this.setState({show: 'table-predict'});
  }

  render() {
    if (this.state.show === 'table-loading') {
      // TODO(future): show progress
      return (
          <p style={{marginTop: '200px', textAlign: 'center'}}>
            ... Loading ...
          </p>);

    } else if (this.state.show === 'model-loading') {
      var pct = this.state.progress;
      pct = (pct !== undefined) ? pct : 0;

      return (
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div style={{margin: '100px 20px'}}>
                  <h4>Building Model...</h4>
                  <div className="progress" style={{marginTop: '50px'}}>
                    <div className="progress-bar" role="progressbar"
                         style={{width: pct+'%'}} aria-valuenow={pct}
                          aria-valuemin="0" aria-valuemax="100">
                       {pct}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>);

    } if (this.state.show === 'table-new') {
      return this.renderPanel(
          <div>
            <NewTablePanel
                onFileImport={this.handleImportFile.bind(this)}
                onFileUpload={this.handleLoadFile.bind(this)} />
          </div>);

    } else if (this.state.tableIndex !== undefined) {
      let table = this.state.tables[this.state.tableIndex];

      let dataClass = "nav-link action-tab";
      let plotClass = dataClass;
      let learnClass = dataClass;
      let predictClass = dataClass;
      let optimizeClass = dataClass;

      let body;
      if (this.state.show === 'table-plot') {
        body = (<PlotPanel table={table}/>);
        plotClass += " active";
      } else if (this.state.show === 'table-learn') {
        body = (<LearnPanel table={table}
                    onBuildModel={this.handleBuildModel.bind(this)}/>);
        learnClass += " active";
      } else if (this.state.show === 'table-predict') {
        body = <PredictPanel table={table} models={this.state.models}/>;
        predictClass += " active";
      } else if (this.state.show === 'table-optimize') {
        body = (<OptimizePanel table={table}
                    onOptimizeResult={this.handleOptResult.bind(this)}/>);
        optimizeClass += " active";
      } else {
        body = (<DataPanel table={table}/>);
        dataClass += " active";
      }

      let extraTabs = '';
      if (this.state.models && this.state.models.length > 0) {
        extraTabs = (
            <li className="nav-item">
              <a className={predictClass} href="#learn"
                 onClick={this.showTablePredict.bind(this)}>Predict</a>
            </li>);
      }

      return this.renderPanel(
          <div>
            <ul className="nav nav-tabs" style={{marginBottom: '20px'}}>
              <li className="nav-item">
                <a className={dataClass} href="#data"
                   onClick={this.showTableData.bind(this)}>Data</a>
              </li>
              <li className="nav-item">
                <a className={plotClass} href="#plot"
                   onClick={this.showTablePlot.bind(this)}>Plot</a>
              </li>
              <li className="nav-item">
                <a className={learnClass} href="#learn"
                   onClick={this.showTableLearn.bind(this)}>Learn</a>
              </li>
              {extraTabs}
              <li className="nav-item">
                <a className={optimizeClass} href="#optimize"
                   onClick={this.showTableOptimize.bind(this)}>Optimize</a>
              </li>
            </ul>
            {body}
          </div>);

    } else if (this.state.modelIndex !== undefined) {
      const model = this.state.models[this.state.modelIndex];
      if (model.type === 'Linear Regression') {
        return this.renderPanel(<div>
              <LinearRegressionPanel model={model}/>
            </div>);
      } else if (model.type === 'Logistic Regression') {
        return this.renderPanel(<div>
              <LogisticRegressionPanel model={model}/>
            </div>);
      } else if (model.type === 'Stump Ensemble Regressor') {
        return this.renderPanel(<div>
              <StumpEnsembleRegressorPanel model={model}/>
            </div>);
      } else if (model.type === 'Stump Ensemble Classifier') {
        return this.renderPanel(<div>
              <StumpEnsembleClassifierPanel model={model}/>
            </div>);
      } else {
        return this.renderPanel(<div>Uh oh! Unknown model type :(</div>);
      }

    } else {
      return this.renderPanel(
          <div>
            <p style={{marginTop: '25px'}}>Welcome!</p>
            <p>&larr; You can start by adding tables on the left.</p>
          </div>);
    }
  }

  /**
   * Returns UI with the given panel on the right, next to the list of tables
   * and models.
   */
  renderPanel(panel) {
    let models = '';
    if (this.state.models.length > 0) {
      models = (
          <div style={{marginTop: '5px'}}>
            <ModelsPanel
                models={this.state.models} current={this.state.modelIndex}
                onSetCurrent={this.setCurrentModel.bind(this)}/>
          </div>);
    }

    let warnings = '';
    if (IsUnsupportedBrowser()) {
      warnings = (
        <div className="row" style={{marginTop: '50px', marginBottom: '50px'}}>
          <div className="col-12"><center>
            <b>Warning</b>: This application is designed for Chrome, Firefox, 
            and Safari. Some features may not work in this browser.
          </center></div>
        </div>);
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-3">
            <div>
              <TablesPanel
                  tables={this.state.tables} current={this.state.tableIndex}
                  onNewTable={this.handleNewTable.bind(this)}
                  onSetCurrent={this.setCurrentTable.bind(this)}/>
            </div>
            {models}
          </div>
          <div className="col-9">
            {panel}
          </div>
        </div>
        {warnings}
      </div>);
  }

  /** Called when the user tries to upload a new file. */
  handleLoadFile(file) {
    if (file.type === 'text/csv' ||
        file.type === 'application/vnd.ms-excel') {
      let name = file.name;
      if (name.toLowerCase().endsWith(".csv"))
        name = name.substring(0, name.length - 4);

      ScheduleLoad(name, file, vals => {
          let [name, cols, rows, ncols, nrows] = vals;
          var tables = this.state.tables.slice();
          tables.push(new Table(name, cols, rows, ncols, nrows));
          this.setState(
              {tables: tables, tableIndex: tables.length-1,
               modelIndex: undefined, show: 'data'});
        });
      this.setState({show: 'table-loading'});
    } else {
      // TODO(future): use a bootstrap alert
      alert('Only CSV files are supported (not "' + file.type + '")');
    }
  }

  /** Called when the user wants to import a known file. */
  handleImportFile(name, path) {
    ScheduleImport(name, path, vals => {
        let [name, cols, rows, ncols, nrows] = vals;
        var tables = this.state.tables.slice();
        tables.push(new Table(name, cols, rows, ncols, nrows));
        this.setState(
            {tables: tables, tableIndex: tables.length-1,
             modelIndex: undefined, show: 'data'});
      });
    this.setState({show: 'table-loading'});
  }

  /** Called when we start building a new model. */
  handleBuildModel(colIndex, modelType) {
    const table = this.state.tables[this.state.tableIndex];
    const tableName = table.name;

    ScheduleLearn(tableName, colIndex, modelType,
        vals => {
          const name = table.cols[colIndex].name + MODEL_SUFFIX[modelType];
          const [params, trainErrs, testErrs] = vals;
          const features = table.cols.filter((v, index) => index !== colIndex);
          const model = new Model(
              name, features, table.cols[colIndex],
              modelType, params, trainErrs, testErrs);

          var models = this.state.models.slice();
          models.push(model);
          this.setState(
              {models: models, modelIndex: models.length - 1,
               tableIndex: undefined, show: 'model', progress: undefined});
        },
        pct => {
          this.setState({progress: pct});
        });
      this.setState({show: 'model-loading'});
  }

  /** Called when optimization has produced the result. */
  handleOptResult(vals) {
    let [name, cols, rows, ncols, nrows] = vals;
    var tables = this.state.tables.slice();
    tables.push(new Table(name, cols, rows, ncols, nrows));
    this.setState(
        {tables: tables, tableIndex: tables.length-1,
         modelIndex: undefined, show: 'data'});
  }
}
