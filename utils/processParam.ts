function extractCols(arr: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i + 1] === "=" && (arr[i + 2] === "?" || arr[i + 2] === "?\n")) {
      result.push(arr[i]);
    }
  }
  return result;
}

export function processParam(query: string, params: string[]) {
  const processedQuery = query.toLowerCase().split("params:")[0];
  let paramIndex = 0;

  // From the query and the params, we can extract the col and the param value in a object { col: value, param: value }
  const processedParams = processedQuery.split(" ");

  const cols = processedParams
    // filter only the words inclued intto extractCols(processedParams)
    .filter((word) => extractCols(processedParams).includes(word))
    .map((word) => {
      const param = params[paramIndex];
      paramIndex++;

      if (!isNaN(Number(param))) return { col: word, param };
      if (param.match(/^\d{4}-\d{2}-\d{2}$/) || param.includes("\n")) {
        const [year, month, day] = param.split("\n")[0].split("-");
        return { col: word, param: `'${day}/${month}/${year}'` };
      }
      if (!param.startsWith("'")) return { col: word, param: `'${param}'` };
      return { col: word, param };
    });

  return cols;
}
