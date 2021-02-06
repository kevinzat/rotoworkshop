/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import DataWorker from './Data.worker.js';


/** Next ID to use in the handler map. */
var nextId = 0;

/** Records information about the handlers for worker responses. */
const handlers = new Map();

/** Wrapper on the worker thread. */
const worker = new DataWorker();


// Set up a listener to invoke the appropriate handler.
worker.addEventListener('message', evt => {
      if (!handlers.has(evt.data.id))
        return;

      const [onResult, onProgress] = handlers.get(evt.data.id);

      if (evt.data.type === 'progress') {
        if (onProgress)
          onProgress(evt.data.percent);
      } else if (evt.data.type === 'result') {
        onResult(evt.data.result);
        handlers.delete(evt.data.id);
      } else {
        // ignore anything else
        console.error(`Bad worker result type ${evt.data.type}`);
        handlers.delete(evt.data.id);
      }
    });


/** Add a work item for loading a file. */
export function ScheduleLoad(fileName, file, onResult, onProgress) {
  nextId++;
  handlers.set(nextId, [onResult, onProgress]);
  worker.postMessage(
      {type: 'file-load', id: nextId, fileName: fileName,file: file});
}


/** Add a work item for importing a file. */
export function ScheduleImport(name, path, onResult, onProgress) {
  nextId++;
  handlers.set(nextId, [onResult, onProgress]);
  worker.postMessage(
      {type: 'file-import', id: nextId, name: name, path: path});
}


/** Add a work item for performing learning. */
export function ScheduleLearn(
    tableName, colIndex, modelType, onResult, onProgress) {

  nextId++;
  handlers.set(nextId, [onResult, onProgress]);
  worker.postMessage({type: 'learn', id: nextId,
      tableName: tableName, colIndex: colIndex, modelType: modelType});
}


/** Add a work item for performing optimization. */
export function ScheduleOptimize(
    tableName, colIndex, constraints, onResult, onProgress) {

  nextId++;
  handlers.set(nextId, [onResult, onProgress]);
  worker.postMessage({type: 'optimize', id: nextId,
      tableName: tableName, colIndex: colIndex, constraints: constraints});
}
