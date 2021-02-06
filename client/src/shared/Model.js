/* Copyright 2018 Kevin Zatloual. All rights reserved. */

/**
 * Stores information about a model, including its parameters and statistics
 * about the errors seen on the training and test data.
 */
export default class Model {
  constructor(name, features, label, modelType, params, trainErrs, testErrs) {
    this.name = name;
    this.features = features;  // column info on each feature
    this.label = label;  // column info for label
    this.type = modelType;
    this.params = params;
    this.trainErrs = trainErrs;
    this.testErrs = testErrs;
  }

  /** Determines whether this model can be applied to the given table. */
  appliesTo(table) {
    let colNames = new Set(table.cols.map(c => c.name));

    for (let feature of this.features) {
      if (!colNames.has(feature.name))
        return false;
    }
    return true;
  }

  /**
   * Returns the given values in the order required for this model.
   * NOTE: This assumes that this model applies to the given table.
   */
  rowFrom(table, tableRow) {
    let indexes = new Map();
    for (let j = 0; j < table.cols.length; j++)
      indexes.set(table.cols[j].name, j);

    let modelRow = [];
    for (let j = 0; j < this.features.length; j++)
      modelRow.push(tableRow[indexes.get(this.features[j].name)])
    return modelRow;
  }
}
