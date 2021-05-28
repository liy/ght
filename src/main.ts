interface Option {
  name: string;
  value: string | number | boolean;
}

export interface Command {
  /**
   * Arguments of the command
   */
  args: Array<string>;
  /**
   * Key value pairs of the the options
   */
  map: Map<string, string | number | boolean>;
  /**
   * Contains all the option pairs
   */
  options: Array<Option>;
  /**
   * Match and parse information of the command
   */
  matches: Array<Match>;
}

/**
 * Parse option text
 * @param value option text
 * @returns option value, boolean, string or number
 */
function parseOptionValue(option: string) {
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

const isOptionRegex = /^(?:--\w+|-\w)|--/;
// const hasEndDigitRegex = /-.(\d+)$/;
const hasEndDigitRegex = /\d+$/;

interface Pair {
  key: string;
  value: string | number | boolean | undefined;
}

export interface Match {
  text: string;
  index: number;
  isOption: boolean;
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
  const results = [...text.matchAll(/(?:[^\s"]+|"[^"]*")+/g)];

  const map = new Map<string, string | number | boolean>();
  const args = new Array();
  const options = new Array<Option>();

  const matches: Array<Match> = results.map((result, index) => {
    const isOption = isOptionRegex.test(result[0]);

    return {
      text: result[0],
      index: result.index!,
      isOption,
    };
  });

  matches.forEach((match, index) => {
    if (match.isOption) {
      const [name, value] = match.text.split("=");
      // option contains equal sign followed by value.
      if (value) {
        const option = { name, value: parseOptionValue(value) };
        map.set(name, value);
        options.push({ name, value });
      }
      // option does not contains equal sign, but potentially ending with digits
      else {
        const digitResult = match.text.match(hasEndDigitRegex);
        // end with digits
        if (digitResult) {
          const option = {
            name: match.text.substring(0, digitResult.index),
            value: Number(digitResult[0]),
          };
          map.set(option.name, option.value);
          options.push({ name: option.name, value: option.value });
        }
        // not ending with digits, could potentially has space separate option value
        else {
          if (matches[index + 1] && !matches[index + 1].isOption) {
            const value = parseOptionValue(matches[index + 1].text);
            map.set(match.text, value);
            options.push({ name: match.text, value });
          } else {
            map.set(match.text, true);
            options.push({ name: match.text, value: true });
          }
        }
      }
    } else {
      // Do not treat the value as argument is it is used for option value
      if (matches[index - 1] && !matches[index - 1].isOption) {
        args.push(match.text);
      }
    }
  });

  return {
    args,
    map,
    matches,
    options,
  };
}

export default parse;

export function isOption(text: string) {
  return isOptionRegex.test(text);
}
