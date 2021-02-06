/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import Matrix from '../matrix/Matrix';
import { Variance } from '../util/SampleStat';


/**
 * Returns the list (b, s, R), where b is a list of variable estimates, s is a
 * list of variable standard errors, and R is the square root of R^2.
 *
 * By default b and s will start with an intercept variable. This can be
 * removed by setting includeIntercept=false.
 *
 * Each entry of X is a list containing the variable values, while each entry
 * of y is the number to be predicted.
 */
export function LinearRegression(X, y, addIntercept=true) {
  X = new Matrix(addIntercept ? X.map(r => ([1].concat(r))) : X);
  y = new Matrix(y.map(v => [v]));

  let V = X.transpose().mul(X).pseudoInverse(1e-9);
  let b = V.mul(X.transpose().mul(y));
  let [R2, s2] = RSquaredMatrix(X, y, b);

  let s = [];
  for (let j = 0; j < X.cols; j++)
    s.push(Math.sqrt(s2 * V.get(j,j)));

  return [b.getColumn(0), s, Math.sqrt(R2)];
}

/** Returns the R^2 for the given linear model on the given data. */
export function RSquared(X, y, b, addIntercept=true) {
  X = new Matrix(addIntercept ? X.map(r => ([1].concat(r))) : X);
  y = new Matrix(y.map(v => [v]));
  b = new Matrix(b.map(v => [v]));
  return RSquaredMatrix(X, y, b)[0];
}

/** Implements the above but with inputs that are matrices / vectors. */
function RSquaredMatrix(X, y, b) {
  // Note: LINEST in Excel uses n-1 for s2 also (not just t2).
  let r = y.sub(X.mul(b));
  let s2 = r.transpose().mul(r).get(0,0) / Math.max(1, X.rows - X.cols);
  let t2 = Variance(y.getColumn(0)) * y.rows / (y.rows - 1);
  return [1 - Math.min(1, s2 / t2), s2];
}

/** Returns the prediction for the given linear model on the given data. */
export function LinearPredict(b, row, addIntercept=true) {
  const x = new Matrix([addIntercept ? [1].concat(row) : row]);
  b = new Matrix(b.map(v => [v]));
  return x.mul(b).get(0,0);
}

/** Returns the MLE estimator of b such that y ~ logistic(Xb). */
export function LogisticRegression(X, y, addIntercept=true) {
  return FitGLM(X, y, Logistic, LogisticDeriv, BernoulliVar, addIntercept);
}

/**
 * Returns the MLE estimate of b such that y ~ g^{-1}(Xb). The "link function",
 * g, maps constrained values to the real line, so the inverse link function
 * maps real values to constrained ones.
 */
function FitGLM(X, y, invLink, invLinkDeriv, varFunc, addIntercept=true,
    maxIter=100, tol=1e-10) {
  X = new Matrix(addIntercept ? X.map(r => ([1].concat(r))) : X);
  y = new Matrix(y.map(v => [v]));

  let beta = [];
  for (let j = 0; j < X.cols; j++)
    beta.push([0]);
  beta = new Matrix(beta);

  let eta = y;

  // Note: It is possible to improve numerical stability when X does not have
  // full rank by working in SVD basis. See https://bwlewis.github.io/GLM/.

  for (let iter = 0; iter < maxIter; iter++) {
    let z = [], w = [];
    for (let i = 0; i < X.rows; i++) {
      let g = invLink(eta.get(i,0)), gp = invLinkDeriv(eta.get(i,0));
      gp = (Math.abs(gp) >= tol) ? gp : ((gp >= 0) ? tol : -tol);
      z.push([eta.get(i,0) + (y.get(i,0) - g) / gp]);
      w.push(gp*gp / Math.max(varFunc(g), tol));
    }

    let betaOld = beta;
    let XW = X.transpose().mul(Matrix.diag(w));
    beta = XW.mul(X).pseudoInverse(tol).mul(XW.mul(new Matrix(z)));
    let diff = beta.sub(betaOld);
    if (diff.transpose().mul(diff).get(0, 0) < tol)
      break;

    eta = X.mul(beta);
  }

  return beta.getColumn(0);
}

/** Returns the 0/1 prediction for the given row. */
export function LogisticClassify(beta, row, retProb) {
  let nu = LogisticParam(beta, row);
  return retProb ? Logistic(nu) : ((Logistic(nu) >= 0.5) ? 1 : 0);
}

/** Returns the parameter of the logistic function for the given row. */
function LogisticParam(beta, row) {
  beta = new Matrix([beta]);
  row = new Matrix([[1].concat(row)]);
  return beta.mul(row.transpose()).get(0, 0);
}

function Logistic(nu) {
  return 1 / (1 + Math.exp(-nu));
}

function LogisticDeriv(nu) {
  let mu = Logistic(nu);
  return mu * (1 - mu);
}

function BernoulliVar(mu) {
  return mu * (1 - mu);
}


/** Returns the fraction of reduction in deviance for the given model. */
export function PseudoRSquared(X, y, beta) {
  let dev = -2 * LogisticRegressionLogLikelihood(X, y, beta);

  let beta0 = beta.map(v => 0);
  let pr = 1. * y.reduce((a,b) => a+b) / y.length;
  beta0[0] = Math.log(pr / (1 - pr));
  let nullDev = -2 * LogisticRegressionLogLikelihood(X, y, beta0);

  return 1 - dev / nullDev;
}

/** Computes the log-likelihood for logistic regression. */
function LogisticRegressionLogLikelihood(X, y, beta) {
  let s = 0;
  for (let i = 0; i < X.length; i++)
    s += y[i] * LogProb(X[i], beta) + (1 - y[i]) * LogOppProb(X[i], beta);
  return s;
}

/** Returns the log of the estimated probability for the given example. */
function LogProb(row, beta) {
  let nu = LogisticParam(beta, row);
  return (nu < 100) ? nu - Math.log(1 + Math.exp(nu)) : 0;
}

/** Returns the log of 1 - the estimated probability for the given example. */
function LogOppProb(row, beta) {
  let nu = LogisticParam(beta, row);
  return (nu < 100) ? -Math.log(1 + Math.exp(nu)) : -nu;
}
