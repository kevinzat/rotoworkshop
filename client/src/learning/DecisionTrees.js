/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import { ArgMax, BinarySearch } from '../util/SearchUtil';
import { InitRandomSeed, Random, RandomSample } from '../util/RandomUtil';
import { Normalize } from './LearnUtil';


/**
 * Returns a map and list, where the map takes classes to indexes in the list
 * and the list contains the total weight of each class.
 */
function GetClassInfo(cls, wt, indexes) {
  if (cls.length !== wt.length)
    throw new Error(`Different lengths: ${cls.length} vs ${wt.length}`);

  // Make a list of unique classes in sorted order (for debugability).
  let allClasses = Array.from(new Set(indexes.map(i => cls[i])));
  allClasses.sort();

  // Find all the classes and choose a unique index for each.
  let classes = new Map();
  for (let c of allClasses)
    classes.set(c, classes.size);

  // Count the total number of examples in each class.
  let classWeights = [];
  for (let j = 0; j < classes.size; j++)
    classWeights.push(0);
  for (let i = 0; i < indexes.length; i++)
    classWeights[classes.get(cls[indexes[i]])] += wt[indexes[i]];

  return [classes, classWeights];
}

/** Returns the most common class (by weight) in the given subset. */
export function _MostCommon(cls, wt, indexes) {
  let [classes, classWeights] = GetClassInfo(cls, wt, indexes);
  let maxClass, maxWeight = -1;
  classes.forEach((index, cls) => {
        if (maxWeight < classWeights[index]) {
          maxWeight = classWeights[index];
          maxClass = cls;
        }
      });
  return maxClass;
}

/** Returns the weighted average of the values at the given indexes. */
function _WeightedMean(y, wt, indexes) {
  let sum = 0, wtSum = 0;
  for (let i = 0; i < indexes.length; i++) {
    const t = indexes[i];
    sum += wt[t] * y[t];
    wtSum += wt[t];
  }
  return sum / wtSum;
}

/**
 * Sorts the list of indexes by the given column of table X, with all undefined
 * values are placed at the end.
 */
function _SortIndexesByCol(indexes, X, j) {
  indexes.sort((i1, i2) => {
        if (X[i1][j] === undefined) {
          return (X[i2][j] === undefined) ? 0 : +1;
        } else if (X[i2][j] === undefined) {
          return -1;
        } else {
          return (X[i1][j] < X[i2][j]) ? -1 : (X[i1][j] > X[i2][j]) ? +1 : 0;
        }
      });
}

/**
 * Returns the index of the first undefined element at the end. Note that
 * _SortIndexesByCol must be called first.
 */
function _IndexOfUndefined(indexes, X, j) {
  let firstUndefIndex = indexes.length;
  while (firstUndefIndex > 0 &&
         X[indexes[firstUndefIndex-1]][j] === undefined) {
    firstUndefIndex--;
  }
  return firstUndefIndex;
}

/**
 * Returns the column and threshold that gives the best split of the examples
 * in terms of reducing Gini coefficient. Note that indexes is mutated.
 */
export function BestSplitByClass(X, cls, wt, indexes) {
  if (X.length !== cls.length)
    throw new Error(`Different lengths: ${X.length} vs ${cls.length}`);
  if (cls.length !== wt.length)
    throw new Error(`Different lengths: ${cls.length} vs ${wt.length}`);

  // Find all the classes and choose a unique index for each.
  let [classes, classWeights] = GetClassInfo(cls, wt, indexes);
  let totalWeight = classWeights.reduce((a, b) => a+b);

  // Track the best split seen so far.
  let minImpurity = Math.pow(10, 1000);
  let minColIndex = undefined;
  let minRowIndex = undefined;
  let minThreshold = undefined;
  let minDefaultLeft = undefined;

  // Try splitting using each of the possible variables.
  for (let j = 0; j < X[0].length; j++) {

    _SortIndexesByCol(indexes, X, j);

    // Keep track of weights by class of examples defined in this feature
    // before and after the split and separately those undefined here.

    let undefWeights = classWeights.map(v => 0);
    let beforeWeights = classWeights.map(v => 0);
    let afterWeights = classWeights.slice(0);
    let undefWeightSum = 0, beforeWeightSum = 0, afterWeightSum = totalWeight;

    let n = indexes.length;
    while (n > 0 && X[indexes[n-1]][j] === undefined) {
      let k = classes.get(cls[indexes[n-1]]);
      undefWeights[k] += wt[indexes[n-1]];
      undefWeightSum += wt[indexes[n-1]];
      afterWeights[k] -= wt[indexes[n-1]];
      afterWeightSum -= wt[indexes[n-1]];
      n -= 1;
    }

    // Try splitting before each spot 1 to n-1.
    for (let i = 1; i < n; i++) {
      let k = classes.get(cls[indexes[i-1]]);
      beforeWeights[k] += wt[indexes[i-1]];
      beforeWeightSum += wt[indexes[i-1]];
      afterWeights[k] -= wt[indexes[i-1]];
      afterWeightSum -= wt[indexes[i-1]];

      if (X[indexes[i-1]][j] === X[indexes[i]][j])
        continue;  // not possible to split here

      let threshold = (X[indexes[i-1]][j] + X[indexes[i]][j]) / 2;

      let impurity = (
          GiniImpurity(ColSum(beforeWeights, undefWeights)) *
          (beforeWeightSum + undefWeightSum) +
          GiniImpurity(afterWeights) * afterWeightSum) / totalWeight;
      if (impurity < minImpurity) {
        minImpurity = impurity;
        minColIndex = j;
        minRowIndex = i;
        minThreshold = threshold;
        minDefaultLeft = true;
      }
      impurity = (
          GiniImpurity(beforeWeights) * beforeWeightSum +
          GiniImpurity(ColSum(afterWeights, undefWeights)) *
          (afterWeightSum + undefWeightSum)) / totalWeight;
      if (impurity < minImpurity) {
        minImpurity = impurity;
        minColIndex = j;
        minRowIndex = i;
        minThreshold = threshold;
        minDefaultLeft = false;
      }
    }
  }

  _SortIndexesByCol(indexes, X, minColIndex);

  const firstUndefIndex = _IndexOfUndefined(indexes, X, minColIndex);
  if (minDefaultLeft) {
    let undefIndexes = indexes.slice(firstUndefIndex);
    return [minColIndex, minThreshold, true,
            indexes.slice(0, minRowIndex).concat(undefIndexes),
            indexes.slice(minRowIndex, firstUndefIndex)];
  } else {
    return [minColIndex, minThreshold, false,
            indexes.slice(0, minRowIndex),
            indexes.slice(minRowIndex)];
  }
}

/** Returns the column-wise sum of two rows. */
function ColSum(row1, row2) {
  if (row1.length !== row2.length)
    throw new Error(`Mismatched lengths: ${row1.length} vs ${row2.length}`);

  let s = [];
  for (let i = 0; i < row1.length; i++)
    s.push(row1[i] + row2[i]);
  return s;
}

/** Returns the Gini impurity for the given class distribution. */
function GiniImpurity(classWeights) {
  let N = 0;
  for (let j = 0; j < classWeights.length; j++)
    N += classWeights[j];

  let s2 = 0;
  for (let j = 0; j < classWeights.length; j++)
    s2 += (classWeights[j] / N) * (classWeights[j] / N);
  return 1 - s2;
}

/**
 * Returns the column and threshold that gives the best split of the examples
 * in terms of reducing squared error (or equiv. sample-weighted variance).
 */
export function BestSplitByVariance(X, y, wt, indexes) {
  if (X.length !== y.length)
    throw new Error(`Different lengths: ${X.length} vs ${y.length}`);
  if (y.length !== wt.length)
    throw new Error(`Different lengths: ${y.length} vs ${wt.length}`);

  // Track the best split seen so far.
  let minSqError = Math.pow(10, 1000);
  let minColIndex = undefined;
  let minRowIndex = undefined;
  let minThreshold = undefined;

  // Pre-compute the sums needed to compute the weighted variance.
  let allSum = 0, allSqSum = 0, allWtSum = 0;
  for (let i = 0; i < indexes.length; i++) {
    let t = indexes[i];
    allSum += wt[t] * y[t];
    allSqSum += wt[t] * y[t] * y[t];
    allWtSum += wt[t];
  }

  // Try splitting using each of the possible variables.
  for (let j = 0; j < X[0].length; j++) {

    _SortIndexesByCol(indexes, X, j);

    // Keep track of sums needed to compute the weighted variance before and
    // after the split.
    let beforeSum = 0, beforeSqSum = 0, beforeWtSum = 0;
    let afterSum = allSum, afterSqSum = allSqSum, afterWtSum = allWtSum;

    // Try splitting before each spot 1 to n-1.
    for (let i = 1; i < X.length; i++) {
      let t = indexes[i-1];
      beforeSum += wt[t] * y[t];
      afterSum -= wt[t] * y[t];
      beforeSqSum += wt[t] * y[t] * y[t];
      afterSqSum -= wt[t] * y[t] * y[t];
      beforeWtSum += wt[t];
      afterWtSum -= wt[t];

      if (X[t][j] === X[indexes[i]][j])
        continue;  // not possible to split here

      let threshold = (X[t][j] + X[indexes[i]][j]) / 2;

      let beforeMean = beforeSum / beforeWtSum;
      let afterMean = afterSum / afterWtSum;

      let sqErrorBefore = beforeSqSum / beforeWtSum - beforeMean * beforeMean;
      let sqErrorAfter = afterSqSum / afterWtSum - afterMean * afterMean;
      let sqError = i * sqErrorBefore + (X.length - i) * sqErrorAfter;
      if (sqError < minSqError) {
        minSqError = sqError;
        minColIndex = j;
        minRowIndex = i;
        minThreshold = threshold;
      }
    }
  }

  _SortIndexesByCol(indexes, X, minColIndex);
  return [minColIndex, minThreshold, 
          indexes.slice(0, minRowIndex), indexes.slice(minRowIndex)];
}


/**
 * Returns the stump that best fits the weighted examples with the given
 * indexes. This will be a tree with left and right subtrees just constants.
 */
function FitStumpClassifier(X, cls, wt, indexes) {
  let [varIndex, varThreshold, defaultLeft, leftIndexes, rightIndexes] =
      BestSplitByClass(X, cls, wt, indexes);
  return {feature: varIndex,
          threshold: varThreshold,
          defaultLeft: defaultLeft,
          leftValue: _MostCommon(cls, wt, leftIndexes),
          rightValue: _MostCommon(cls, wt, rightIndexes)};
}


/**
 * Returns the stump that best fits the weighted examples with the given
 * indexes. This will be a tree with left and right subtrees just constants.
 */
function FitStumpRegressor(X, y, wt, indexes) {
  let [varIndex, varThreshold, leftIndexes, rightIndexes] =
      BestSplitByVariance(X, y, wt, indexes);
  return {feature: varIndex,
          threshold: varThreshold,
          leftValue: _WeightedMean(y, wt, leftIndexes),
          rightValue: _WeightedMean(y, wt, rightIndexes)};
}


/** Returns an ensemble of trees that tries to predict the given classes. */
export function FitTreeEnsembleClassifier(X, cls, numTrees=100,
    treeLearner=FitStumpClassifier, progress=undefined) {
  if (X.length !== cls.length)
    throw new Error(`Different lengths: ${X.length} vs ${cls.length}`);

  let wt = X.map(v => 1 / X.length);
  let indexes = X.map((v, index) => index);
  let [classes] = GetClassInfo(cls, wt, indexes);

  let trees = [];
  let treeWeights = [];

  for (let t = 0; t < numTrees; t++) {
    let stump = treeLearner(X, cls, wt, indexes);

    let err = 0;
    for (let i = 0; i < X.length; i++) {
      if (TreePredict(stump, X[i]) !== cls[i])
        err += wt[i];
    }
    if (err >= 1 - 1 / classes.size - 1e-12)  // no improvement
      break;

    trees.push(stump);
    treeWeights.push(Math.log((1 - err) / err) + Math.log(classes.size - 1));

    let factor = Math.exp(treeWeights[treeWeights.length-1]);
    let wtSum = 0;
    for (let i = 0; i < X.length; i++) {
      if (TreePredict(stump, X[i]) !== cls[i])
        wt[i] *= factor;
      wtSum += wt[i];
    }
    for (let i = 0; i < X.length; i++)
      wt[i] /= wtSum;

    if (progress !== undefined)
      progress(t+1, numTrees);
  }

  return [classes, trees, treeWeights];
}


/** Returns an ensemble of trees that tries to predict the given values. */
export function FitTreeEnsembleRegressor(X, y, numTrees=100, bagging=true,
    treeLearner=FitStumpRegressor, errMeasure=(e => e), learnRate=1,
    progress=undefined) {
  if (X.length !== y.length)
    throw new Error(`Different lengths: ${X.length} vs ${y.length}`);

  const allIndexes = X.map((v, index) => index);
  const equalWt = X.map(v => 1 / X.length);

  let wt = X.map(v => 1 / X.length);
  let trees = [];
  let treeWeights = [];

  InitRandomSeed(5678);          // Make this repeatable
  Random(); Random(); Random();  // Fill all the bits.

  for (let t = 0; t < numTrees; t++) {
    let stump;
    if (bagging) {
      const indexes = RandomSample(wt, X.length);  // use weights to sample
      stump = treeLearner(X, y, equalWt, indexes); // split with equal weights
    } else {
      stump = treeLearner(X, y, wt, allIndexes);   // split with weights
    }

    // Compute the error rate using the given error measure.
    let errMax = 0;
    for (let i = 0; i < X.length; i++) {
      let e = Math.abs(TreePredict(stump, X[i]) - y[i]);
      errMax = Math.max(errMax, e);
    }
    if (Math.abs(errMax) < 1e-8) errMax = 1;  // err will be zero anyway
    let err = 0;
    for (let i = 0; i < X.length; i++) {
      let e = Math.abs(TreePredict(stump, X[i]) - y[i]);
      err += wt[i] * errMeasure(e / errMax);
    }

    if (err >= 0.5 - 1e-8)
      break;  // no improvement made

    // Add this tree to the ensemble.
    let beta = err / (1 - err);
    trees.push(stump);
    treeWeights.push(Math.abs(err) <= 1e-8 ? 1 : -Math.log(beta) * learnRate);

    if (Math.abs(err) <= 1e-8)
      break;  // no more improvement possible

    // Update the weight based on the error.
    let wtSum = 0;
    for (let i = 0; i < X.length; i++) {
      let e = Math.abs(TreePredict(stump, X[i]) - y[i]) / errMax;
      wt[i] *= Math.pow(beta, (1-e) * learnRate);
      wtSum += wt[i];
    }
    for (let i = 0; i < X.length; i++)
      wt[i] /= wtSum;

    // Notify the client of progress.
    if (progress !== undefined)
      progress(t+1, numTrees);
  }

  return [trees, treeWeights];
}


/** Returns the prediction of the given tree on the given row. */
function TreePredict(tree, row) {
  while (typeof tree === 'object') {
    if (row[tree.feature] === undefined) {
      tree = tree.defaultLeft ? tree.leftValue : tree.rightValue;
    } else {
      tree = (row[tree.feature] <= tree.threshold) ?
              tree.leftValue : tree.rightValue;
    }
  }
  return tree;
}


/** Returns the prediction of the given ensemble of trees on the given row. */
export function TreeEnsembleClassify(
    classes, trees, treeWeights, row, probFor) {
  if (trees.length !== treeWeights.length) {
    throw new Error(
        `Different lengths: ${trees.length} vs ${treeWeights.length}`);
  }

  if (probFor)
    treeWeights = Normalize(treeWeights);

  let wt = new Map();
  for (let cls of classes.keys())
    wt.set(cls, 0);
  for (let i = 0; i < trees.length; i++) {
    let cls = TreePredict(trees[i], row);
    wt.set(cls, wt.get(cls) + treeWeights[i]);
  }

  return (probFor === undefined) ? ArgMax(wt) : wt.get(probFor);
}


/** Returns the prediction of the given ensemble of trees on the given row. */
export function TreeEnsemblePredict(trees, treeWeights, row) {
  if (trees.length !== treeWeights.length) {
    throw new Error(
        `Different lengths: ${trees.length} vs ${treeWeights.length}`);
  }

  // Collect the predictions of each tree sorted by the predicted value.
  let preds = [];
  for (let i = 0; i < trees.length; i++)
    preds.push([treeWeights[i], TreePredict(trees[i], row)]);
  preds.sort((v1, v2) => {
        return (v1[1] < v2[1]) ? -1 : (v1[1] > v2[1]) ? +1 : 0;
      });

  // Compute the cumulative sum of weights up to each point.
  let cdf = [0];
  for (let i = 0; i < preds.length; i++)
    cdf.push(cdf[i] + preds[i][0]);

  // Find the median position.
  let index = BinarySearch(cdf, 0.5 * cdf[cdf.length-1]);

  // TODO: consider averaging the values around the median position
  return preds[index-1][1];
}


/**
 * Helper to find the combined weight function for a feature. Weights are
 * recorded as a list of regions (a, w, b), meaning [a,b] has weight w, sorted
 * by a's.
 */
export function StumpEnsembleFeatureWeights(trees, treeWeights, feature, cls) {
  let inf = Math.pow(10, 1000);
  let weights = [[-inf, 0.0, inf]]
  let undefWeight = 0;
  for (let i = 0; i < trees.length; i++) {
    if (trees[i].feature === feature) {
      if (trees[i].leftValue === cls) {
        AddStumpWeight(weights, -inf, trees[i].threshold, treeWeights[i]);
        if (trees[i].defaultLeft) undefWeight += treeWeights[i];
      }
      if (trees[i].rightValue === cls) {
        AddStumpWeight(weights, trees[i].threshold, inf, treeWeights[i]);
        if (!trees[i].defaultLeft) undefWeight += treeWeights[i];
      }
    }
  }
  return [weights, undefWeight];
}

/** Helper function for above that adds weight to the range < val or > val. */
function AddStumpWeight(weights, greaterVal, lessEqVal, wt) {
  // Make sure there are splits at each of these values
  EnsureSplit(weights, greaterVal)
  EnsureSplit(weights, lessEqVal)

  // Add the given weight wherever it applies.
  for (let i = 0; i < weights.length; i++) {
    if (greaterVal <= weights[i][0] && weights[i][2] <= lessEqVal)
      weights[i][1] += wt;
  }
}

/**
 * Helper to find the combined estimate from a feature. Values are recorded as
 * a list of regions (a, v, b), meaning [a,b] has value v, sorted by a's.
 */
export function StumpEnsembleFeatureEstimates(trees, treeWeights, feature) {
  let inf = Math.pow(10, 1000);
  let values = [[-inf, [0, 0], inf]]
  for (let i = 0; i < trees.length; i++) {
    if (trees[i].feature === feature) {
      AddStumpEstimate(values, -inf, trees[i].threshold,
          treeWeights[i], trees[i].leftValue);
      AddStumpEstimate(values, trees[i].threshold, inf,
          treeWeights[i], trees[i].rightValue);
    }
  }

  return values.map(r => [r[0], r[1][0] / r[1][1], r[2]]);
}

/** Helper function for above that adds estimate to the range < val or > val. */
function AddStumpEstimate(values, greaterVal, lessEqVal, wt, est) {
  // Make sure there are splits at each of these values
  EnsureSplit(values, greaterVal)
  EnsureSplit(values, lessEqVal)

  // Add the given estimate wherever it applies.
  for (let i = 0; i < values.length; i++) {
    if (greaterVal <= values[i][0] && values[i][2] <= lessEqVal) {
      values[i][1][0] += wt * est;
      values[i][1][1] += wt;
    }
  }
}

/**
 * Adds a split at the given value if the given list of triples does not already
 * have one. Each triple is of the form (a, _, b) indicating the range (a, b].
 */
function EnsureSplit(triples, split) {
  if (split === triples[0][0]) return;
  for (let i = 0; i < triples.length; i++) {
    let [a, val, b] = triples[i];
    if (split < b - 1e-9) {  // split is missing
      triples.splice(i, 1, [a, val, split],
              [split, (typeof val === 'number') ? val : val.slice(0), b]);
      break;
    }
    if (split === b || split < b + 1e-9)  // infinity needs ===
      break;  // split exists already
  }
}
