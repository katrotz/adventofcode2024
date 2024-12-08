import { resolve } from "node:path";
import { readInput } from "../../utils.js";

export async function solve() {
  const inputFilePath = resolve(import.meta.dirname, "./input.txt");
  const contents =
    /* reads */
    (await readInput(inputFilePath, { parseRows: true }))

      /* sanitizes */
      .filter((row) => row.trim())

      .reduce((acc, val) => {
        return `${acc}${val}`;
      }, "");

  return [await solvePuzzle1(contents), await solvePuzzle2(contents)];
}

async function solvePuzzle1(contents) {
  return contents
    .match(/mul\(\d+,\d+\)/gi)

    .map((match) => {
      return match.replace("mul", "+").replace(",", "*");
    })

    .map(eval)

    .reduce((acc, val) => acc + val, 0);
}

async function solvePuzzle2(contents) {
  const rules = [
    { rule: /don't/y, type: "DISABLE" }, // The order matters since /do/ would qualify before don't
    { rule: /do/y, type: "ENABLE" },
    { rule: /mul/y, type: "*", extractor: () => "*" },
    { rule: /\(/y, type: "(" },
    { rule: /\)/y, type: ")" },
    { rule: /,/y, type: "," },
    {
      rule: /-?[0-9]+\.?[0-9]*(?![a-zA-Z$_])/y,
      type: "NUMBER",
      extractor: (literal) => parseFloat(literal),
    },
  ];

  return (
    contents
      .trim()
      .split("")

      /* lexer */
      .reduce((tokens, char, index) => {
        const lastToken = tokens[tokens.length - 1];

        if (lastToken && lastToken.endsAt > index) {
          return tokens;
        }

        for (const { rule, type, extractor } of rules) {
          rule.lastIndex = index;
          const match = rule.exec(contents);

          if (!match) continue;

          const literal = match[0];
          const value = extractor ? extractor(literal) : literal;
          const startsAt = index;
          const endsAt = index + literal.length;

          return [...tokens, { type, literal, value, startsAt, endsAt }];
        }

        return [
          ...tokens,
          {
            type: "ILLEGAL",
            literal: char,
            value: char,
            startsAt: index,
            endsAt: index + 1,
          },
        ];
      }, [])

      /* parser */
      .reduce(
        ({ enabled, expressions }, token, index, tokens) => {
          if (
            tokens[index].type === "*" &&
            tokens[index + 1].type === "(" &&
            tokens[index + 2].type === "NUMBER" &&
            tokens[index + 3].type === "," &&
            tokens[index + 4].type === "NUMBER" &&
            tokens[index + 5].type === ")" &&
            enabled
          ) {
            return {
              enabled,
              expressions: [
                ...expressions,
                `(${tokens[index + 2].value}*${tokens[index + 4].value})`,
              ],
            };
          }

          if (
            tokens[index].type === "ENABLE" &&
            tokens[index + 1].type === "(" &&
            tokens[index + 2].type === ")"
          ) {
            return {
              enabled: true,
              expressions: expressions,
            };
          }

          if (
            tokens[index].type === "DISABLE" &&
            tokens[index + 1].type === "(" &&
            tokens[index + 2].type === ")"
          ) {
            return {
              enabled: false,
              expressions: expressions,
            };
          }

          return { enabled, expressions };
        },
        { enabled: true, expressions: [] },
      )
      .expressions.map(eval)
      .reduce((acc, val) => acc + val, 0)
  );
}
