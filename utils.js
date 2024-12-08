import { readFile } from "node:fs/promises";

export async function readInput(filePath, { parseRows = false } = {}) {
  const contents = await readFile(filePath, { encoding: "utf-8" });

  if (parseRows) {
    return contents.split("\n");
  }

  return contents;
}
