/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import ParseTable from './TableParser';
import { LearnColumn } from './TableLearner';
import { OptimizeColumn } from './TableOptimizer';


/** Map to tables from their names. */
const tables = new Map();


// eslint-disable-next-line no-restricted-globals
const worker = self;

// TODO(future): send progress events during loading & parsing

worker.addEventListener('message', (evt) => {
  if (evt.data.type === 'file-load') {
    let reader = new FileReader()
    reader.onerror = evt2 => {
        console.error('Error reading file: ' + evt2.error);
        worker.postMessage({type: 'error', id: evt.data.id});
      };
    reader.onload = evt2 => {
        addTable(evt.data.id, evt.data.fileName, evt2.target.result);
      };
    reader.readAsText(evt.data.file);

  } else if (evt.data.type === 'file-import') {
    var req = new XMLHttpRequest();
    req.addEventListener("load", evt2 => {
        if (req.readyState == req.DONE) {
          if (req.status == 200) {
            addTable(evt.data.id, evt.data.name, req.responseText);
          } else {
            // TODO: show an error?
            console.error(evt.data.path, req.status);
          }
        }
      });
    req.open("GET", evt.data.path);
    req.send();

  } else if (evt.data.type === 'learn') {
    let table = tables.get(evt.data.tableName);
    let result = LearnColumn(table, evt.data.colIndex, evt.data.modelType,
        pct => {
          worker.postMessage({type: 'progress', id: evt.data.id, percent: pct});
        });
    worker.postMessage({type: 'result', id: evt.data.id, result: result});

  } else if (evt.data.type === 'optimize') {
    let table = tables.get(evt.data.tableName);
    let indexes = OptimizeColumn(table, evt.data.colIndex, evt.data.constraints,
        pct => {
          worker.postMessage({type: 'progress', id: evt.data.id, percent: pct});
        });
    let result = table.subTable(indexes);
    worker.postMessage({type: 'result', id: evt.data.id,
        result: [
            result.name + ' (Max\u202f'+table.cols[evt.data.colIndex].name+')',
            result.cols, result.rows, result.ncols, result.nrows
          ]});

  } else {
    console.error(`Bad worker result type ${evt.data.type}`);
    worker.postMessage({type: 'error', id: evt.data.id});
  }

});


/** Parses the given content into a table and adds it to the map. */
function addTable(id, name, content) {
  let table = ParseTable(name, content);

  // Record the table for later use.
  tables.set(table.name, table);

  // Send back a small version of the table, without too many rows
  // (Note that columns are also limited but must fully sent.)
  let rows = table.getSampleRows();
  worker.postMessage({type: 'result', id: id,
      result: [table.name, table.cols, rows, table.ncols, table.nrows]});
}
