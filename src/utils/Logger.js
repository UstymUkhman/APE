// Logger class to print console logs/warnings/errors

export default class Logger {
  /**
   * @static
   * @description - print message with `console.info`
   * @param {...*} - max 2 arguments of differebt types
   */
  static info () {
    const message = Logger._getMessage(arguments);

    if (typeof message === 'object') {
      console.info(message[0], message[1]);
    } else {
      console.info(message);
    }
  }

  /**
   * @static
   * @description - print message with `console.warn`
   * @param {...*} - max 2 arguments of differebt types
   */
  static warn () {
    const warning = Logger._getMessage(arguments);

    if (typeof warning === 'object') {
      console.warn(warning[0], warning[1]);
    } else {
      console.warn(warning);
    }
  }

  /**
   * @static
   * @description - print message with `console.error`
   * @param {...*} - max 2 arguments of differebt types
   */
  static error () {
    const error = Logger._getMessage(arguments);

    if (typeof error === 'object') {
      console.error(error[0], error[1]);
    } else {
      console.error(error);
    }
  }

  /**
   * @static
   * @private
   * @description - convert given arguments to more comfortable type
   * @param {*[]} logs - array of logs/warnings/errors to print in console
   * @returns {(string|Object[2])} - one joined string | array of 2 elements with different types
   */
  static _getMessage (logs) {
    let messages = [];
    let message = '';

    for (const l in logs) {
      if (typeof logs[l] === 'string') {
        message += `${logs[l]}\n`;
      } else {
        messages.push(message);
        messages.push(logs[l]);
        return messages;
      }
    }

    return message;
  }
}
