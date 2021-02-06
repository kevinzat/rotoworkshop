/* Copyright 2018 Kevin Zatloual. All rights reserved. */

/** Returns the given number as a string with the desired digits after dot. */
function FormatNumber(val, precision) {
  if (val < 0) {
    return '-' + FormatNumber(-val, precision);
  } else if (precision === 0) {
    return '' + Math.round(val);
  } else {
    for (let i = 0; i < precision; i++)
      val *= 10;

    let str = '' + Math.round(val);
    while (str.length < precision)
      str = '0' + str;

    if (str.length === precision) {
      return '0.' + str.substring(str.length - precision);
    } else {
      return str.substring(0, str.length - precision) + '.' +
             str.substring(str.length - precision);
    }
  }
}
export { FormatNumber };
