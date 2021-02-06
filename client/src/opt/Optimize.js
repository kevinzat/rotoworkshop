/* Copyright 2018 Kevin Zatloual. All rights reserved. */

// Returns the subset that maximizes value subject to the column-wise sum of
// their types being at most typeMax.
export function BinPackByType(types, values, typeMax, isAllowed, onProgress) {
  const typeCount = TypeCombinations(typeMax);

  // Stores the maximum value of any subset with the given type.
  let lastMaxValue = new Float32Array(new ArrayBuffer(4 * (typeCount + 1)));
  let nextMaxValue = new Float32Array(new ArrayBuffer(4 * (typeCount + 1)));

  // Stores the index of last (or elemNumber-th if not null) in that subset.
  let lastSetElem = new Int32Array(new ArrayBuffer(4 * (typeCount + 1)));
  let nextSetElem = new Int32Array(new ArrayBuffer(4 * (typeCount + 1)));

  // Stores the size of the subset achieving the maximum.
  let lastSetSize = new Int32Array(new ArrayBuffer(4 * (typeCount + 1)));
  let nextSetSize = new Int32Array(new ArrayBuffer(4 * (typeCount + 1)));

  // Stores the type of last (or elemNumber-th if not null) in that subset.
  let lastSetType = new Int32Array(new ArrayBuffer(4 * (typeCount + 1)));
  let nextSetType = new Int32Array(new ArrayBuffer(4 * (typeCount + 1)));

  // Find the optimal solution, including the last element.
  let [elemIndex, typeIndex, setSize] = _BinPackByTypeHelper2(
      types, values, 0, values.length, typeMax, 0, typeCount, isAllowed,
      lastMaxValue, nextMaxValue, lastSetSize, nextSetSize,
      lastSetElem, nextSetElem, lastSetType, nextSetType,
      onProgress, 0, 0.5);

  // Find the players used to get to that solution (minus the last element).
  let indexes = [];
  _BinPackByTypeHelper1(
      types, values, typeMax, 0, elemIndex, indexes, 0, typeIndex, setSize - 1,
      lastMaxValue, nextMaxValue, lastSetSize, nextSetSize,
      lastSetElem, nextSetElem, lastSetType, nextSetType,
      onProgress, 0.5, 1.0);
  indexes.push(elemIndex);
  return indexes;
}

// Adds the indexes of the best solution from the starting to ending point into
// the indexes list.
function _BinPackByTypeHelper1(
    types, values, typeMax, startElemIndex, endElemIndex, indexes,
    startTypeIndex, endTypeIndex, numPlayers, lastMaxValue, nextMaxValue,
    lastSetSize, nextSetSize, lastSetElem, nextSetElem,
    lastSetType, nextSetType, onProgress, fracStart, fracEnd) {

  let elemCount = Math.floor(numPlayers/2);  // find this element

  let [midElemIndex, midTypeIndex, ] = _BinPackByTypeHelper2(
      types, values, startElemIndex, endElemIndex, typeMax,
      startTypeIndex, endTypeIndex,
      (type) => _TypeToIndex(type, typeMax) === endTypeIndex,
      lastMaxValue, nextMaxValue, lastSetSize, nextSetSize,
      lastSetElem, nextSetElem, lastSetType, nextSetType,
      onProgress, fracStart, (fracStart + fracEnd)/2, elemCount);

  if (elemCount > 0) {
    _BinPackByTypeHelper1(
        types, values, typeMax, startElemIndex, midElemIndex, indexes,
        startTypeIndex, midTypeIndex, elemCount, lastMaxValue, nextMaxValue,
        lastSetSize, nextSetSize, lastSetElem, nextSetElem,
        lastSetType, nextSetType,
        onProgress, (fracStart + fracEnd)/2, (fracStart + 3*fracEnd)/4);
  }

  indexes.push(midElemIndex);

  if (numPlayers - 1 - elemCount > 0) {
    const type = _IndexToType(midTypeIndex, typeMax);
    const nextTypeIndex = _TypeToIndex(
        _AddTypes(type, types[midElemIndex]), typeMax);

    _BinPackByTypeHelper1(
        types, values, typeMax, midElemIndex+1, endElemIndex, indexes,
        nextTypeIndex, endTypeIndex, numPlayers - 1 - elemCount,
        lastMaxValue, nextMaxValue, lastSetSize, nextSetSize,
        lastSetElem, nextSetElem, lastSetType, nextSetType,
        onProgress, (fracStart + 3*fracEnd)/4, fracEnd);
  }
}

// Finds the subset that maximizes value subject to the column-wise sum of
// their types being at most typeMax. Return value is the index of the
// elemNumber-th element of that subset (or the last element if none is
// specified) along with the size of the subset. Only indices between start
// (inclusive) and end (exclusive) are examined.
function _BinPackByTypeHelper2(
    types, values, start, end, typeMax, startTypeIndex, endTypeIndex, isAllowed,
    lastMaxValue, nextMaxValue, lastSetSize, nextSetSize,
    lastSetElem, nextSetElem, lastSetType, nextSetType,
    onProgress, fracStart, fracEnd, elemCount) {

  // Initialize all three arrays for zero elements.
  for (let i = startTypeIndex; i <= endTypeIndex; i++) {
    lastMaxValue[i] = -1e500;
    lastSetSize[i] = -1e100;
    lastSetElem[i] = -1;
    lastSetType[i] = -1;
  }
  lastMaxValue[startTypeIndex] = lastSetSize[startTypeIndex] = 0;

  let pctLast = Math.floor(100 * fracStart);

  for (let k = start; k < end; k++) {
    nextMaxValue.set(lastMaxValue);  // start with no change
    nextSetSize.set(lastSetSize);
    nextSetElem.set(lastSetElem);
    nextSetType.set(lastSetType);

    for (let typeIndex = startTypeIndex;
         typeIndex <= endTypeIndex;
         typeIndex++) {
      const type = _IndexToType(typeIndex, typeMax);
      if (_CanAddTypes(types[k], type, typeMax)) {
        const newTypeIndex = _TypeToIndex(_AddTypes(types[k], type), typeMax);
        const newValue = lastMaxValue[typeIndex] + values[k];
        if (newValue > nextMaxValue[newTypeIndex]) {
          nextMaxValue[newTypeIndex] = newValue;
          nextSetSize[newTypeIndex] = lastSetSize[typeIndex] + 1;
          if (elemCount === undefined || nextSetSize[typeIndex] === elemCount) {
            nextSetElem[newTypeIndex] = k;
            nextSetType[newTypeIndex] = typeIndex;
          } else {
            nextSetElem[newTypeIndex] = lastSetElem[typeIndex];
            nextSetType[newTypeIndex] = lastSetType[typeIndex];
          }
        }
      }
    }

    [lastMaxValue, nextMaxValue] = [nextMaxValue, lastMaxValue];
    [lastSetSize, nextSetSize] = [nextSetSize, lastSetSize];
    [lastSetElem, nextSetElem] = [nextSetElem, lastSetElem];
    [lastSetType, nextSetType] = [nextSetType, lastSetType];

    let pctNext = Math.floor(100 *
        ((end - k) * fracStart + (k - start) * fracEnd) / (end - start));
    if (pctNext > pctLast)
      onProgress(pctNext);
    pctLast = pctNext;
  }

  // Find the index that achieves the maximum allowed value.
  let [, maxTypeIndex] = _Max(lastMaxValue, startTypeIndex, endTypeIndex,
      (typeIndex) => isAllowed(_IndexToType(typeIndex, typeMax)));

  return [lastSetElem[maxTypeIndex], lastSetType[maxTypeIndex],
          lastSetSize[maxTypeIndex]];
}


// Returns the maximum value (and the index at which it is achieved) of any
// index accepted by the given function.
function _Max(values, start, end, isAllowed) {
  let maxValue = -1e500;
  let maxIndex = -1;
  for (let index = start; index <= end; index++) {
    if (values[index] >= maxValue && isAllowed(index)) {
      maxValue = values[index];
      maxIndex = index;
    }
  }
  return [maxValue, maxIndex];
}

// Returns the total number of combinations of types that are possible without
// violating the given maximums.
export function TypeCombinations(typeMax) {
  let c = 1;
  for (let i = 0; i < typeMax.length; i++)
    c *= typeMax[i] + 1;
  return c;
}

// Returns the index of the given type in the space of all combinations.
function _TypeToIndex(type, typeMax) {
  let factor = 1;  
  let index = 0;
  for (let i = 0; i < typeMax.length; i++) {
    index += type[i] * factor;
    factor *= typeMax[i] + 1;
  }
  return index;
}

// Returns the type corresponding to an index in the space of all combinations.
function _IndexToType(index, typeMax) {
  let type = [];
  for (let i = 0; i < typeMax.length; i++) {
    type.push(index % (typeMax[i] + 1));
    index = Math.floor(index / (typeMax[i] + 1));
  }
  return type;
}

// Determines whether the sum of the given types is no more than the maximum.
function _CanAddTypes(type1, type2, typeMax) {
  for (let i = 0; i < typeMax.length; i++) {
    if (type1[i] + type2[i] > typeMax[i])
      return false;
  }
  return true;
}

// Returns the sum of the given types.
function _AddTypes(type1, type2) {
  let type = [];
  for (let i = 0; i < type1.length; i++)
    type.push(type1[i] + type2[i]);
  return type;
}

/* Returns the difference of the given types.
function _SubTypes(type1, type2) {
  let type = [];
  for (let i = 0; i < type1.length; i++) {
    type.push(type1[i] - type2[i]);
  }
  return type;
}*/
