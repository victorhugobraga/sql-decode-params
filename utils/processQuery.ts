export function processQuery(query: string, params: string[]): string {
  let processedQuery = query.split("params:")[0];
  let paramIndex = 0;

  // Replace placeholders with parameters
  processedQuery = processedQuery.replace(/\?/g, () => {
    const param = params[paramIndex];
    paramIndex++;
    return param ? `'${param}'` : "?";
  });

  return processedQuery;
}
