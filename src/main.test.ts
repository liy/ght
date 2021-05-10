import parse from "./main";

test("simple command", () => {
  expect(parse("git checkout").context).toEqual(["git", "checkout"]);
});

test("complex command", () => {
  const cmd = `git checkout branch -n33 -a -b test -c=abc -d "It's a \"message\"" -ee="start\"text\"end" --ff-f=1 --GGG -- lastcmd`;
  const result = parse(cmd);
  expect(result.context).toEqual(["git", "checkout", "branch"]);

  expect(result.options.get("-n")).toEqual(33);
  expect(result.options.get("-a")).toEqual(true);
  expect(result.options.get("-b")).toEqual("test");
  expect(result.options.get("-c")).toEqual("abc");
  expect(result.options.get("-d")).toEqual('It\'s a "message"');
  expect(result.options.get("-ee")).toEqual('start"text"end');
  expect(result.options.get("--ff-f")).toEqual(1);
  expect(result.options.get("--GGG")).toEqual(true);
  expect(result.options.get("--")).toEqual("lastcmd");
});
