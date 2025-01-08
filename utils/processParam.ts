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
  const processedQuery = query.split("Params:")[0];
  let paramIndex = 0;

  if (processedQuery.toLowerCase().startsWith("select")) {
    const processedParams = processedQuery.split(" ");
    const cols = processedParams
      .filter((word) => extractCols(processedParams).includes(word))
      .map((word) => {
        const param = params[paramIndex];
        paramIndex++;

        if (!isNaN(Number(param))) return { col: word, param };
        if (
          param.match(/^\d{4}-\d{2}-\d{2}$/) ||
          param.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{1}$/)
        ) {
          const [year, month, day] = param.split("\n")[0].split("-");
          return { col: word, param: `'${day}/${month}/${year}'` };
        }
        if (!param.startsWith("'")) return { col: word, param: `'${param}'` };
        return { col: word, param };
      });
    return cols;
  }

  if (processedQuery.toLowerCase().startsWith("insert")) {
    const cols = processedQuery.split("(")[1].split(")")[0].split(",");
    const colsAndValues = cols.map((col, index) => {
      const param = params[index];
      if (!isNaN(Number(param))) return { col, param };
      if (
        param.match(/^\d{4}-\d{2}-\d{2}$/) ||
        param.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{1}$/)
      ) {
        const [year, month, day] = param.split("\n")[0].split("-");
        const dayParam = day.split(" ")[0];
        return { col, param: `'${dayParam}/${month}/${year}'` };
      }
      if (!param.startsWith("'")) return { col, param: `'${param}'` };
      return { col, param };
    });
    return colsAndValues;
  }
}
