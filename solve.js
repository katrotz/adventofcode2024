import { readdir } from "node:fs/promises";

const startTime = Date.now();

const [inputDay] = process.argv.slice(2);

const parsedDay = parseInt(inputDay);
const paddedDay = isNaN(parsedDay) ? null : `0${parsedDay}`.slice(-2);

async function run(day) {
  const dirList = (await readdir("./puzzles")).sort();
  const puzzlesToSolve = day
    ? dirList.filter((puzzle) => puzzle === day)
    : dirList;

  for (const puzzle of puzzlesToSolve) {
    try {
      const { solve } = await import(`./puzzles/${puzzle}/index.js`);

      const [result1 = null, result2 = null] = await solve();

      console.log(`Puzzle ${puzzle}: \n 1: ${result1}\n 2: ${result2}`);
    } catch (error) {
      console.error(`Puzzle ${puzzle} failed with error`, error);
    }
  }

  console.info(`\nSolved ${puzzlesToSolve.length} puzzles`);
}

run(paddedDay).finally(() =>
  console.log(`\nDone in ${Math.round(Date.now() - startTime)}ms`),
);
