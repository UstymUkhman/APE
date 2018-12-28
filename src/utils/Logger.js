// Console logger utils

export default class Logger {
  static info () {
    const message = Logger.getMessage(arguments);

    if (typeof message === 'object') {
      console.info(message[0], message[1]);
    } else {
      console.info(message);
    }
  }

  static warn () {
    const warning = Logger.getMessage(arguments);

    if (typeof warning === 'object') {
      console.warn(warning[0], warning[1]);
    } else {
      console.warn(warning);
    }
  }

  static error () {
    const error = Logger.getMessage(arguments);

    if (typeof error === 'object') {
      console.error(error[0], error[1]);
    } else {
      console.error(error);
    }
  }

  static getMessage (logs) {
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
