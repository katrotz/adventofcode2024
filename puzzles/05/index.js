import { resolve } from "node:path";
import { readInput } from "../../utils.js";

export async function solve() {
  const inputFilePath = resolve(import.meta.dirname, "./input.txt");
  const input =
    /* reads */
    (await readInput(inputFilePath, { parseRows: true }))

      /* sanitizes */
      .filter((row) => row.trim())

      /* parses */
      .map((row) => {
        return row.trim();
      })

      .reduce(
        ({ rules, pages }, row) => {
          if (row.includes("|")) {
            const [x, y] = row.split("|");

            return {
              rules: [...rules, { x: parseInt(x), y: parseInt(y) }],
              pages,
            };
          }

          if (row.includes(",")) {
            return {
              rules,
              pages: [...pages, row.split(",").map((v) => parseInt(v))],
            };
          }

          return { rules, pages };
        },
        { rules: [], pages: [] },
      );

  return [await solvePuzzle1(input), await solvePuzzle2(input)];
}

async function solvePuzzle1(input) {
  return input.pages
    .reduce((validPages, pages) => {
      const isValid = input.rules.every(({ x, y }) => {
        const xpos = pages.indexOf(x);
        const ypos = pages.indexOf(y);

        return xpos < 0 || ypos < 0 || xpos < ypos;
      });

      if (isValid) {
        return [...validPages, pages];
      }

      return validPages;
    }, [])
    .reduce((sum, pages) => {
      if (pages % 2 === 0) throw new Error("Unexpected pages size");

      return sum + pages[(pages.length - 1) / 2];
    }, 0);
}

async function solvePuzzle2(input) {
  const isValid = (pages, rule) => {
    const xpos = pages.indexOf(rule.x);
    const ypos = pages.indexOf(rule.y);

    return xpos < 0 || ypos < 0 || xpos < ypos;
  };

  const sortPages = (pages, rules) => {
    return rules.reduce(
      (adjustedPages, rule) => {
        if (!isValid(adjustedPages, rule)) {
          const xpos = adjustedPages.indexOf(rule.x);
          const ypos = adjustedPages.indexOf(rule.y);
          [adjustedPages[xpos], adjustedPages[ypos]] = [
            adjustedPages[ypos],
            adjustedPages[xpos],
          ];
        }

        return [...adjustedPages];
      },
      [...pages],
    );
  };

  return input.pages
    .filter((pages) => input.rules.some((rule) => !isValid(pages, rule)))
    .map((pages) => {
      let sortedPages = [...pages];
      while (input.rules.some((rule) => !isValid(sortedPages, rule))) {
        sortedPages = sortPages(sortedPages, input.rules);
      }

      return sortedPages;
    })
    .reduce((sum, pages) => {
      if (pages % 2 === 0) throw new Error("Unexpected pages size");

      return sum + pages[(pages.length - 1) / 2];
    }, 0);
}
