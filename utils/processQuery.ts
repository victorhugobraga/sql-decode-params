export function processQuery(query: string, params: string[]): string {
  let processedQuery = query.split("params:")[0];
  let paramIndex = 0;

  // Replace placeholders with parameters
  processedQuery = processedQuery.replace(/\?/g, () => {
    const param = params[paramIndex];
    paramIndex++;

    if (!isNaN(Number(param))) return param;
    if (param.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log("date");
      const [year, month, day] = param.split("-");
      return `'${day}/${month}/${year}'`;
    }
    if (!param.startsWith("'")) return `'${param}'`;
    return param;
  });

  return processedQuery;
}
