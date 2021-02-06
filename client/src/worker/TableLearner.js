/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import { GetData, ErrorRate, SquaredError, Normalize } from '../learning/LearnUtil';
import { LinearRegression, LogisticRegression, LogisticClassify,
         RSquared, PseudoRSquared } from '../learning/LinearModels';
import { FitTreeEnsembleClassifier, FitTreeEnsembleRegressor,
         TreeEnsembleClassify, TreeEnsemblePredict } from '../learning/DecisionTrees';


let TREE_SIZES = [5, 10, 20, 40, 80, 100];
let MAX_TREE_SIZE = 100;


/**
 * Returns the best model of the given type for learning the given column,
 * along with quality of fit metrics.
 */
export function LearnColumn(table, colIndex, modelType, onProgress) {

  onProgress(5); // Show some progress right away..

  let [exTrain, lblTrain] = GetData(table, colIndex, true);
  let [exTest, lblTest] = GetData(table, colIndex, false);

  if (modelType === 'Linear Regression') {
    let [b, s, rTrain] = LinearRegression(exTrain, lblTrain);
    let rTest = Math.sqrt(RSquared(exTest, lblTest, b));
    return [[b, s], rTrain, rTest];

  } else if (modelType === 'Logistic Regression') {
    let beta = LogisticRegression(exTrain, lblTrain);
    onProgress(50);

    let trainR2 = PseudoRSquared(exTrain, lblTrain, beta);
    let testR2 = PseudoRSquared(exTest, lblTest, beta);

    let predFunc = (ex) => LogisticClassify(beta, ex);
    let trainErr = ErrorRate(exTrain, lblTrain, predFunc);
    let testErr = ErrorRate(exTest, lblTest, predFunc);

    return [beta, [trainR2, trainErr], [testR2, testErr]];

  } else if (modelType === 'Stump Ensemble Classifier') {
    let [classes, trees, treeWeights] = FitTreeEnsembleClassifier(
        exTrain, lblTrain, 100, undefined,
        (i, n) => onProgress(100 * i / n));

    let trainErrs = [], testErrs = [];
    for (let numTrees of TREE_SIZES) {
      let newTrees = trees.slice(0, numTrees);
      let newWeights = Normalize(treeWeights.slice(0, numTrees));
      let predFunc =
           (ex) => TreeEnsembleClassify(classes, newTrees, newWeights, ex);
      trainErrs.push(ErrorRate(exTrain, lblTrain, predFunc));
      testErrs.push(ErrorRate(exTest, lblTest, predFunc));
    }

    return [[classes, trees, treeWeights], trainErrs, testErrs];

  } else if (modelType === 'Stump Ensemble Regressor') {
    let [trees, treeWeights] = FitTreeEnsembleRegressor(
        exTrain, lblTrain, 100, true, undefined, undefined, undefined,
        (i, n) => onProgress(100 * i / n));

    let trainErrs = [], testErrs = [];
    for (let numTrees of TREE_SIZES) {
      let newTrees = trees.slice(0, numTrees);
      let newWeights = Normalize(treeWeights.slice(0, numTrees));
      let predFunc = (ex) => TreeEnsemblePredict(newTrees, newWeights, ex);
      trainErrs.push(SquaredError(exTrain, lblTrain, predFunc));
      testErrs.push(SquaredError(exTest, lblTest, predFunc));
    }

    return [[trees, treeWeights], trainErrs, testErrs];

  } else {
    console.error(`Bad model type ${modelType}`);
  }
}
