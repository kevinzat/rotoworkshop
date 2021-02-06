// Adapted from ml-matrix
/**
 * Returns the SVD, A = U diag(w) V. The length of w at least as large as the
 * smaller of the number of rows and columns in A. U and V will automatically
 * be shrunk in their * number of rows and columns, respectively, to match the
 * size of w.
 */
export default function SVD(A, canMutate=false) {
    var a, m, n, swapped;
    if (A.length >= A[0].length) {
      swapped = false;
      a = canMutate ? A : matrixCopy(A);
      m = A.length;
      n = A[0].length;
    } else {
      swapped = true;
      a = matrixTranspose(A);
      m = A[0].length;
      n = A.length;
    }

    var nu = Math.min(m, n);
    var ni = Math.min(m + 1, n);
    var s = new Array(ni);
    var U = matrixZeros(m, nu);
    var V = matrixZeros(n, n);

    var e = new Array(n);
    var work = new Array(m);

    var si = new Array(ni);
    for (let i = 0; i < ni; i++) si[i] = i;

    var nct = Math.min(m - 1, n);
    var nrt = Math.max(0, Math.min(n - 2, m));
    var mrc = Math.max(nct, nrt);

    for (let k = 0; k < mrc; k++) {
      if (k < nct) {
        s[k] = 0;
        for (let i = k; i < m; i++) {
          s[k] = hypotenuse(s[k], a[i][k]);
        }
        if (s[k] !== 0) {
          if (a[k][k] < 0) {
            s[k] = -s[k];
          }
          for (let i = k; i < m; i++) {
            a[i][k] /= s[k];
          }
          a[k][k] += 1;
        }
        s[k] = -s[k];
      }

      for (let j = k + 1; j < n; j++) {
        if (k < nct && s[k] !== 0) {
          let t = 0;
          for (let i = k; i < m; i++) {
            t += a[i][k] * a[i][j];
          }
          t = -t / a[k][k];
          for (let i = k; i < m; i++) {
            a[i][j] += t * a[i][k];
          }
        }
        e[j] = a[k][j];
      }

      if (k < nct) {
        for (let i = k; i < m; i++) {
          U[i][k] = a[i][k];
        }
      }

      if (k < nrt) {
        e[k] = 0;
        for (let i = k + 1; i < n; i++) {
          e[k] = hypotenuse(e[k], e[i]);
        }
        if (e[k] !== 0) {
          if (e[k + 1] < 0) {
            e[k] = 0 - e[k];
          }
          for (let i = k + 1; i < n; i++) {
            e[i] /= e[k];
          }
          e[k + 1] += 1;
        }
        e[k] = -e[k];
        if (k + 1 < m && e[k] !== 0) {
          for (let i = k + 1; i < m; i++) {
            work[i] = 0;
          }
          for (let i = k + 1; i < m; i++) {
            for (let j = k + 1; j < n; j++) {
              work[i] += e[j] * a[i][j];
            }
          }
          for (let j = k + 1; j < n; j++) {
            let t = -e[j] / e[k + 1];
            for (let i = k + 1; i < m; i++) {
              a[i][j] += t * work[i];
            }
          }
        }
        for (let i = k + 1; i < n; i++) {
          V[i][k] = e[i];
        }
      }
    }

    let p = Math.min(n, m + 1);
    if (nct < n) {
      s[nct] = a[nct][nct];
    }
    if (m < p) {
      s[p - 1] = 0;
    }
    if (nrt + 1 < p) {
      e[nrt] = a[nrt][p - 1];
    }
    e[p - 1] = 0;

    for (let j = nct; j < nu; j++) {
      for (let i = 0; i < m; i++) {
        U[i][j] = 0;
      }
      U[j][j] = 1;
    }
    for (let k = nct - 1; k >= 0; k--) {
      if (s[k] !== 0) {
        for (let j = k + 1; j < nu; j++) {
          let t = 0;
          for (let i = k; i < m; i++) {
            t += U[i][k] * U[i][j];
          }
          t = -t / U[k][k];
          for (let i = k; i < m; i++) {
            U[i][j] += t * U[i][k];
          }
        }
        for (let i = k; i < m; i++) {
          U[i][k] = -U[i][k];
        }
        U[k][k] = 1 + U[k][k];
        for (let i = 0; i < k - 1; i++) {
          U[i][k] = 0;
        }
      } else {
        for (let i = 0; i < m; i++) {
          U[i][k] = 0;
        }
        U[k][k] = 1;
      }
    }

    for (let k = n - 1; k >= 0; k--) {
      if (k < nrt && e[k] !== 0) {
        for (let j = k + 1; j < n; j++) {
          let t = 0;
          for (let i = k + 1; i < n; i++) {
            t += V[i][k] * V[i][j];
          }
          t = -t / V[k + 1][k];
          for (let i = k + 1; i < n; i++) {
            V[i][j] += t * V[i][k];
          }
        }
      }
      for (let i = 0; i < n; i++) {
        V[i][k] = 0;
      }
      V[k][k] = 1;
    }

    var pp = p - 1;
    var iter = 0;
    var eps = Number.EPSILON;
    while (p > 0) {
      let k, kase;
      for (k = p - 2; k >= -1; k--) {
        if (k === -1) {
          break;
        }
        const alpha =
          Number.MIN_VALUE + eps * Math.abs(s[k] + Math.abs(s[k + 1]));
        if (Math.abs(e[k]) <= alpha || Number.isNaN(e[k])) {
          e[k] = 0;
          break;
        }
      }
      if (k === p - 2) {
        kase = 4;
      } else {
        let ks;
        for (ks = p - 1; ks >= k; ks--) {
          if (ks === k) {
            break;
          }
          let t =
            (ks !== p ? Math.abs(e[ks]) : 0) +
            (ks !== k + 1 ? Math.abs(e[ks - 1]) : 0);
          if (Math.abs(s[ks]) <= eps * t) {
            s[ks] = 0;
            break;
          }
        }
        if (ks === k) {
          kase = 3;
        } else if (ks === p - 1) {
          kase = 1;
        } else {
          kase = 2;
          k = ks;
        }
      }

      k++;

      switch (kase) {
        case 1: {
          let f = e[p - 2];
          e[p - 2] = 0;
          for (let j = p - 2; j >= k; j--) {
            let t = hypotenuse(s[j], f);
            let cs = s[j] / t;
            let sn = f / t;
            s[j] = t;
            if (j !== k) {
              f = -sn * e[j - 1];
              e[j - 1] = cs * e[j - 1];
            }
            for (let i = 0; i < n; i++) {
              t = cs * V[i][j] + sn * V[i][p - 1];
              V[i][p - 1] = -sn * V[i][j] + cs * V[i][p - 1];
              V[i][j] = t;
            }
          }
          break;
        }
        case 2: {
          let f = e[k - 1];
          e[k - 1] = 0;
          for (let j = k; j < p; j++) {
            let t = hypotenuse(s[j], f);
            let cs = s[j] / t;
            let sn = f / t;
            s[j] = t;
            f = -sn * e[j];
            e[j] = cs * e[j];
            for (let i = 0; i < m; i++) {
              t = cs * U[i][j] + sn * U[i][k - 1];
              U[i][k - 1] = -sn * U[i][j] + cs * U[i][k - 1];
              U[i][j] = t;
            }
          }
          break;
        }
        case 3: {
          const scale = Math.max(
            Math.abs(s[p - 1]),
            Math.abs(s[p - 2]),
            Math.abs(e[p - 2]),
            Math.abs(s[k]),
            Math.abs(e[k])
          );
          const sp = s[p - 1] / scale;
          const spm1 = s[p - 2] / scale;
          const epm1 = e[p - 2] / scale;
          const sk = s[k] / scale;
          const ek = e[k] / scale;
          const b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
          const c = sp * epm1 * (sp * epm1);
          let shift = 0;
          if (b !== 0 || c !== 0) {
            if (b < 0) {
              shift = 0 - Math.sqrt(b * b + c);
            } else {
              shift = Math.sqrt(b * b + c);
            }
            shift = c / (b + shift);
          }
          let f = (sk + sp) * (sk - sp) + shift;
          let g = sk * ek;
          for (let j = k; j < p - 1; j++) {
            let t = hypotenuse(f, g);
            if (t === 0) t = Number.MIN_VALUE;
            let cs = f / t;
            let sn = g / t;
            if (j !== k) {
              e[j - 1] = t;
            }
            f = cs * s[j] + sn * e[j];
            e[j] = cs * e[j] - sn * s[j];
            g = sn * s[j + 1];
            s[j + 1] = cs * s[j + 1];
            for (let i = 0; i < n; i++) {
              t = cs * V[i][j] + sn * V[i][j + 1];
              V[i][j + 1] = -sn * V[i][j] + cs * V[i][j + 1];
              V[i][j] = t;
            }
            t = hypotenuse(f, g);
            if (t === 0) t = Number.MIN_VALUE;
            cs = f / t;
            sn = g / t;
            s[j] = t;
            f = cs * e[j] + sn * s[j + 1];
            s[j + 1] = -sn * e[j] + cs * s[j + 1];
            g = sn * e[j + 1];
            e[j + 1] = cs * e[j + 1];
            if (j < m - 1) {
              for (let i = 0; i < m; i++) {
                t = cs * U[i][j] + sn * U[i][j + 1];
                U[i][j + 1] = -sn * U[i][j] + cs * U[i][j + 1];
                U[i][j] = t;
              }
            }
          }
          e[p - 2] = f;
          iter = iter + 1;
          break;
        }
        case 4: {
          if (s[k] <= 0) {
            s[k] = s[k] < 0 ? -s[k] : 0;
            for (let i = 0; i <= pp; i++) {
              V[i][k] = -V[i][k];
            }
          }
          while (k < pp) {
            if (s[k] >= s[k + 1]) {
              break;
            }
            let t = s[k];
            s[k] = s[k + 1];
            s[k + 1] = t;
            if (k < n - 1) {
              for (let i = 0; i < n; i++) {
                t = V[i][k + 1];
                V[i][k + 1] = V[i][k];
                V[i][k] = t;
              }
            }
            if (k < m - 1) {
              for (let i = 0; i < m; i++) {
                t = U[i][k + 1];
                U[i][k + 1] = U[i][k];
                U[i][k] = t;
              }
            }
            k++;
          }
          iter = 0;
          p--;
          break;
        }
        // no default
      }
    }

    if (swapped) {
      return [V, s, U];
    } else {
      return [U, s, V];
    }
}

function matrixCopy(A) {
  let C = [];
  for (let i = 0; i < A.length; i++) {
    let rA = A[i];
    let rC = [];
    for (let j = 0; j < rA.length; j++)
      rC.push(rA[j]);
    C.push(rC);
  }
  return C;
}

function matrixTranspose(A) {
  let C = [];
  for (let j = 0; j < A[0].length; j++) {
    let r = [];
    for (let i = 0; i < A.length; i++)
      r.push(A[i][j]);
    C.push(r);
  }
  return C;
}

function matrixZeros(m, n) {
  let C = [];
  for (let i = 0; i < m; i++) {
    let r = [];
    for (let j = 0; j < n; j++)
      r.push(0);
    C.push(r);
  }
  return C;
}

function hypotenuse(a, b) {
  var r = 0;
  if (Math.abs(a) > Math.abs(b)) {
    r = b / a;
    return Math.abs(a) * Math.sqrt(1 + r * r);
  }
  if (b !== 0) {
    r = a / b;
    return Math.abs(b) * Math.sqrt(1 + r * r);
  }
  return 0;
}
