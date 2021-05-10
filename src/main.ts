const isOptionRegex = /^(?:--\w+|-\w)|--/;
const endingWithDigits = /\d+$/;

interface Command {
  context: Array<string>;
  options: Map<string, string | number | boolean>;
}

/**
 * Parse option text
 * @param value option text
 * @returns option value, boolean, string or number
 */
function parseOption(option: string) {
  const num = Number(option);
  // boolean
  if (option === "" || option === undefined) {
    return true;
  }
  // number
  else if (!isNaN(num)) {
    return num;
  }
  // string
  else {
    // Remove start and end quotes
    return option.replace(/^"(.*)"$/, "$1");
  }
}

/**
 * Split command input text using space as delimiter, ignore space inside quotes.
 * Option start with - or --
 *
 * boolean option value can be omitted; number or string option value follows = or space; number option value can be ending with option key
 *
 * @param string Command text string
 * @returns A command object
 */
function parse(text: string): Command {
  // Split by space which is not in quotes.
  // https://stackoverflow.com/questions/16261635/javascript-split-string-by-space-but-ignore-space-in-quotes-notice-not-to-spli
  const matches = text.match(/(?:[^\s"]+|"[^"]*")+/g);

  const options = new Map<string, string | number | boolean>();
  const context = new Array();

  let lastOptionKey: null | string = null;

  matches?.forEach((match) => {
    const isOption = isOptionRegex.test(match);

    if (isOption) {
      // options
      const [key, value] = match.split("=");
      const result = key.match(endingWithDigits);
      if (result) {
        options.set(key.substring(0, result.index), Number(result[0]));
      } else {
        options.set(key, parseOption(value));
      }
      lastOptionKey = key;
    } else {
      // If last match is an option, then this will be
      // the value of the last option.
      if (lastOptionKey) {
        options.set(lastOptionKey, parseOption(match));
        lastOptionKey = null;
      } else {
        context.push(match);
      }
    }
  });

  return {
    context,
    options,
  };
}

export default parse;
