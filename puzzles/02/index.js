import { resolve } from "node:path";
import { readInput } from "../../utils.js";

export async function solve() {
  const inputFilePath = resolve(import.meta.dirname, "./input.txt");
  const matrix =
    /* reads */
    (await readInput(inputFilePath, { parseRows: true }))

      /* sanitizes */
      .filter((row) => row.trim())

      /* parses */
      .map((row) => {
        return row
          .trim()
          .split("")
          .reduce((list, char) => {
            const word = list.pop() ?? "";

            return char.trim()
              ? [...list, `${word + char}`]
              : [...list, word, char];
          }, [])
          .map((word) => parseInt(word))
          .filter((word) => !isNaN(word));
      })

      /* validates */
      .map((words) => {
        if (words.some((word) => typeof word !== "number")) {
          throw new Error(
            `Illegal row contents, expected type number, got "${JSON.stringify(words)}"`,
          );
        }

        return words;
      });

  return [await solvePuzzle1(matrix), await solvePuzzle2(matrix)];
}

async function solvePuzzle1(matrix) {
  return (
    matrix

      /* computes */
      .filter((line) => {
        return line.reduce((isSafe, val, index, array) => {
          const sign = array.length <= 1 ? 0 : array[1] - array[0] > 0 ? 1 : -1;
          const diff = index > 0 ? val - array[index - 1] : 0;

          return (
            isSafe &&
            (index > 0 ? Math.abs(diff) > 0 : true) &&
            Math.abs(diff) <= 3 &&
            diff * sign >= 0
          );
        }, true);
      })

      /* result */
      .reduce((sum) => {
        return sum + 1;
      }, 0)
  );
}

async function solvePuzzle2(matrix) {
  return (
    matrix

      /* computes */
      .filter((line) => {
        return line
          .reduce((acc, _, index, array) => {
            return [
              ...acc,
              [
                ...[...array].slice(0, index),
                ...[...array].slice(index + 1, array.length),
              ],
            ];
          }, [])
          .some((lineOption) => {
            return lineOption.reduce((isSafe, val, index, array) => {
              const sign =
                array.length <= 1 ? 0 : array[1] - array[0] > 0 ? 1 : -1;
              const diff = index > 0 ? val - array[index - 1] : 0;

              return (
                isSafe &&
                (index > 0 ? Math.abs(diff) > 0 : true) &&
                Math.abs(diff) <= 3 &&
                diff * sign >= 0
              );
            }, true);
          });
      })

      /* result */
      .reduce((sum) => {
        return sum + 1;
      }, 0)
  );
}
