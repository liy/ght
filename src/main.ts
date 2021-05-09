const inputStr = `git checkout -n33 -a -b test -c=abc -d "It's a \"message\"" -ee="start\"text\"end" --ff-f=1 --GGG -- lastcmd`;
const input = document.getElementById("command-input") as HTMLDivElement;
input.textContent = inputStr;
const selection = window.getSelection()!;

const optionRegex = /(?:--?\w+-?\w*=".*?[^\\]")|(?:--?\w+-?\w*=\w+)|(?:--?\w+-?\w*)|--/g;
const messageRegex = /".*?[^\\]"/g;
const isOptionRegex = /^(?:--\w+|-\w)|--/;
const isEndWithDigits = /\d+$/;
// input.focus();

// document.addEventListener("click", onCursorChange);

// function parseOptions(
//   commandText: string
// ): Map<string, string | number | boolean> {
//   const matches = commandText.match(optionRegex);
//   const options = new Map<string, string | number | boolean>();
//   if (matches) {
//     for (const match of matches) {
//       const [key, value] = match.split("=");

//       // number
//       const num = Number(value);
//       if (!isNaN(num)) {
//         options.set(key, num);
//       }
//       // string
//       else if (value) {
//         // Strip out quote
//         options.set(key, value.substr(1, value.length - 1));
//       }
//       // boolean
//       else {
//         options.set(key, true);
//       }
//     }
//   }
//   return options;
// }

// function parseCommands(commandText: string) {
//   commandText = commandText.replace(optionRegex, "");
//   console.log(commandText);
//   const chunks = commandText.match(/(?:[^\s"]+|"[^"]*")+/g);
//   console.log(chunks);
// }

interface Command {
  values: Array<string>;
  options: Map<string, string | number | boolean>;
}

function parseOption(value: string) {
  const num = Number(value);
  if (value === "" || value === undefined) {
    return true;
  }
  // number
  else if (!isNaN(num)) {
    return num;
  }
  // string
  else {
    return value.replace(/^"(.*)"$/, "$1");
  }
}

function parse(commandText: string): Command {
  // Split by space which is not in quotes.
  // https://stackoverflow.com/questions/16261635/javascript-split-string-by-space-but-ignore-space-in-quotes-notice-not-to-spli
  const matches = commandText.match(/(?:[^\s"]+|"[^"]*")+/g);

  const options = new Map<string, string | number | boolean>();
  const values = new Array();

  let lastOptionKey: null | string = null;

  matches?.forEach((match) => {
    const isOption = isOptionRegex.test(match);

    if (isOption) {
      // options
      const [key, value] = match.split("=");
      const result = key.match(isEndWithDigits);
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
        values.push(match);
      }
    }
  });

  return {
    options,
    values,
  };
}

function onCursorChange(e: Event) {
  const str = input.textContent?.substring(0, selection.anchorOffset)!;
  console.log(parse(str));
}

input.addEventListener("mouseup", onCursorChange);
input.addEventListener("keyup", onCursorChange);

// git <command> [...<option>] value
