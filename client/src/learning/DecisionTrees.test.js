/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import { LinearRegression } from './LinearModels';
import { BestSplitByClass, BestSplitByVariance,
         FitTreeEnsembleRegressor, TreeEnsemblePredict,
         _MostCommon } from './DecisionTrees';


it('BestSplitByClass basic', () => {
  let [feature, threshold, defaultLeft, leftIndexes, rightIndexes] =
      BestSplitByClass(
          [[0, 0], [1, 0], [0, 1], [1, 1]],
          [0, 0, 1, 1],  // 1st is random, 2nd predicts perfectly
          [1, 1, 1, 1],
          [0, 1, 2, 3]);

  leftIndexes.sort();  // order is unimportant
  rightIndexes.sort();  // order is unimportant

  expect(feature).toBe(1);
  expect(threshold).toBeCloseTo(0.5);
  expect(leftIndexes.length).toBe(2);
  expect(leftIndexes[0]).toBe(0);
  expect(leftIndexes[1]).toBe(1);
  expect(rightIndexes.length).toBe(2);
  expect(rightIndexes[0]).toBe(2);
  expect(rightIndexes[1]).toBe(3);
});

it('BestSplitByClass indexes', () => {
  let [feature, threshold, defaultLeft, leftIndexes, rightIndexes] =
      BestSplitByClass(
          [[0, 0], [1, 0], [9, 9], [0, 1], [1, 1]],
          [0, 0, 2, 1, 1],  // 1st is random, 2nd predicts perfectly
          [1, 1, 1, 1, 1],
          [0, 1, 3, 4]);

  leftIndexes.sort();  // order is unimportant
  rightIndexes.sort();  // order is unimportant

  expect(feature).toBe(1);
  expect(threshold).toBeCloseTo(0.5);
  expect(leftIndexes.length).toBe(2);
  expect(leftIndexes[0]).toBe(0);
  expect(leftIndexes[1]).toBe(1);
  expect(rightIndexes.length).toBe(2);
  expect(rightIndexes[0]).toBe(3);
  expect(rightIndexes[1]).toBe(4);
});

it('BestSplitByClass undefined', () => {
  let [feature, threshold, defaultLeft, leftIndexes, rightIndexes] =
      BestSplitByClass(
          [[0, 0], [1, 0], [0, undefined], [1, 1]],
          [0, 0, 1, 1],  // 1st is random
                         // 2nd predicts perfectly IF undefined goes right
          [1, 1, 1, 1],
          [0, 1, 2, 3]);

  leftIndexes.sort();  // order is unimportant
  rightIndexes.sort();  // order is unimportant

  expect(feature).toBe(1);
  expect(threshold).toBeCloseTo(0.5);
  expect(defaultLeft).toBe(false);
  expect(leftIndexes.length).toBe(2);
  expect(leftIndexes[0]).toBe(0);
  expect(leftIndexes[1]).toBe(1);
  expect(rightIndexes.length).toBe(2);
  expect(rightIndexes[0]).toBe(2);
  expect(rightIndexes[1]).toBe(3);
});

it('MostCommon', () => {
  let cls = _MostCommon(
          [0, 0, 1, 1, 1],
          [1, 1, 1, 1, 1],
          [0, 1, 2, 3, 4]);
  expect(cls).toBe(1);

  cls = _MostCommon(
          [0, 0, 0, 1, 1],
          [1, 1, 1, 1, 1],
          [0, 1, 2, 3, 4]);
  expect(cls).toBe(0);

  cls = _MostCommon(
          [0, 0, 0, 1, 1],
          [1, 1, 1, 1, 10],
          [0, 1, 2, 3, 4]);
  expect(cls).toBe(1);

  cls = _MostCommon(
          [0, 0, 0, 1, 1],
          [1, 1, 1, 1, 10],
          [0, 1, 2, 3]);
  expect(cls).toBe(0);
});

it('BestSplitByVariance basic', () => {
  let [feature, threshold, leftIndexes, rightIndexes] =
      BestSplitByVariance(
          [[0, 0], [1, 0], [0, 1], [1, 1]],
          [0, 0, 1, 1],  // 1st is random, 2nd predicts perfectly
          [1, 1, 1, 1],
          [0, 1, 2, 3]);

  leftIndexes.sort();  // order is unimportant
  rightIndexes.sort();  // order is unimportant

  expect(feature).toBe(1);
  expect(threshold).toBeCloseTo(0.5);
  expect(leftIndexes.length).toBe(2);
  expect(leftIndexes[0]).toBe(0);
  expect(leftIndexes[1]).toBe(1);
  expect(rightIndexes.length).toBe(2);
  expect(rightIndexes[0]).toBe(2);
  expect(rightIndexes[1]).toBe(3);
});

it('FitTreeEnsembleRegressor', () => {
  let [trees, treeWeights] = FitTreeEnsembleRegressor(
          [[0, 0], [1, 0], [0, 1], [1, 1]],
          [0, 0, 1, 1]);
  // no variance after second tree

  expect(treeWeights.length).toBe(1);
  expect(treeWeights[0]).toBeCloseTo(1, 1);

  expect(trees.length).toBe(1);
  expect(trees[0].feature).toBe(1);
  expect(trees[0].threshold).toBe(0.5);
  expect(trees[0].leftValue).toBeCloseTo(0, 1);
  expect(trees[0].rightValue).toBeCloseTo(1, 1);
});

it('TreeEnsemblePredict', () => {
  let val = TreeEnsemblePredict(
          [{feature: 1, threshold: 0.4, leftValue: -1e5, rightValue: 1},
           {feature: 1, threshold: 0.8, leftValue: -1e5, rightValue: 2},
           {feature: 1, threshold: 1.2, leftValue: 3, rightValue: -1e5}],
          [0.33, 0.34, 0.33],
          [undefined, 1]);
  expect(val).toBeCloseTo(2, 1);

  val = TreeEnsemblePredict(
          [{feature: 1, threshold: 0.4, leftValue: -1e5, rightValue: 1},
           {feature: 1, threshold: 0.8, leftValue: -1e5, rightValue: 2},
           {feature: 1, threshold: 1.2, leftValue: 3, rightValue: -1e5}],
          [0.2, 0.2, 0.6],
          [undefined, 1]);
  expect(val).toBeCloseTo(3, 1);

  val = TreeEnsemblePredict(
          [{feature: 1, threshold: 0.4, leftValue: -1e5, rightValue: 1},
           {feature: 1, threshold: 0.8, leftValue: -1e5, rightValue: 2},
           {feature: 1, threshold: 1.2, leftValue: 3, rightValue: -1e5}],
          [0.6, 0.2, 0.2],
          [undefined, 1]);
  expect(val).toBeCloseTo(1, 1);
});
