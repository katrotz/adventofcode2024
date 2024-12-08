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
        return row.trim().split("");
      });

  return [await solvePuzzle1(matrix), await solvePuzzle2(matrix)];
}

async function solvePuzzle1(matrix) {
  const matcher = (rowGenerator, colGenerator) => {
    const safelyGetNextValue = () => {
      const row = rowGenerator.next().value;
      const col = colGenerator.next().value;

      return matrix[row] && matrix[row][col] ? matrix[row][col] : "";
    };
    const combo =
      safelyGetNextValue() +
      safelyGetNextValue() +
      safelyGetNextValue() +
      safelyGetNextValue();

    return `XMAS` === combo ? 1 : 0;
  };
  function* incrementer(initialValue) {
    let value = initialValue;
    while (true) {
      yield value++;
    }
  }
  function* decrementer(initialValue) {
    let value = initialValue;
    while (true) {
      yield value--;
    }
  }
  function* identity(initialValue) {
    while (true) {
      yield initialValue;
    }
  }

  return matrix.reduce((totalCount, row, rowIndex) => {
    return (
      totalCount +
      row.reduce((count, char, colIndex) => {
        if (char !== "X") return count;

        const vNegMatch = matcher(decrementer(rowIndex), identity(colIndex));
        const d1Match = matcher(decrementer(rowIndex), incrementer(colIndex));
        const hPosMatch = matcher(identity(rowIndex), incrementer(colIndex));
        const d2Match = matcher(incrementer(rowIndex), incrementer(colIndex));
        const vPosMatch = matcher(incrementer(rowIndex), identity(colIndex));
        const d3Match = matcher(incrementer(rowIndex), decrementer(colIndex));
        const hNegMatch = matcher(identity(rowIndex), decrementer(colIndex));
        const d4Match = matcher(decrementer(rowIndex), decrementer(colIndex));

        const matches =
          hPosMatch +
          hNegMatch +
          vPosMatch +
          vNegMatch +
          d1Match +
          d2Match +
          d3Match +
          d4Match;

        return count + matches;
      }, 0)
    );
  }, 0);
}

async function solvePuzzle2(matrix) {
  const matcher = (row, col) => {
    const safelyGetNextValue = (row1, col1) => {
      return matrix[row1] && matrix[row1][col1] ? matrix[row1][col1] : "";
    };
    const word1 =
      safelyGetNextValue(row - 1, col - 1) +
      safelyGetNextValue(row + 1, col + 1);
    const word2 =
      safelyGetNextValue(row - 1, col + 1) +
      safelyGetNextValue(row + 1, col - 1);

    return ["MS", "SM"].includes(word1) && ["MS", "SM"].includes(word2) ? 1 : 0;
  };

  return matrix.reduce((totalCount, row, rowIndex) => {
    return (
      totalCount +
      row.reduce((count, char, colIndex) => {
        if (char !== "A") return count;

        return count + matcher(rowIndex, colIndex);
      }, 0)
    );
  }, 0);
}
