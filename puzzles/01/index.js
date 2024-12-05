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
        if (words.length !== 2) {
          throw new Error(
            `Illegal row contents, expected 2 numbers in a row, got ${words.length}`,
          );
        }

        return words;
      })

      /* transposes */
      .reduce((lists, words) => {
        if (!lists) {
          return words.map((word) => [word]);
        }

        for (const [index, word] of words.entries()) {
          lists[index] = [...(lists[index] ?? []), word];
        }

        return lists;
      }, null);

  return [await solvePuzzle1(matrix), await solvePuzzle2(matrix)];
}

async function solvePuzzle1(matrix) {
  return (
    matrix

      /* sorts */
      .map((list) => {
        return [...list].sort();
      })

      /* result */
      .reduce((acc, _, index, [head, ...tail]) => {
        if (index > 0) {
          return acc;
        }

        return head
          .map((val, index) => [val, ...tail.map((tVal) => tVal[index])])
          .map((list) => {
            return list.reduce((sum, val) => {
              return sum === null ? val : Math.abs(sum - val);
            }, null);
          })
          .reduce((sum, val) => {
            return sum + val;
          }, 0);
      }, 0)
  );
}

async function solvePuzzle2([head, ...tail]) {
  return head.reduce((result, value, index) => {
    return (
      result +
      value *
        tail.reduce((acc, list) => {
          return acc + list.filter((listVal) => listVal === value).length;
        }, 0)
    );
  }, 0);
}
