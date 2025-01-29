"use server";

import { processParam } from "@/utils/processParam";
import { processQuery } from "@/utils/processQuery";

export async function processQueryAction(query: string, params: string[]) {
  if (!query) {
    return { error: "Nenhuma query informada!" };
  }

  try {
    const processedQuery = processQuery(query, params);
    const processedParams = processParam(query, params);

    return { result: processedQuery, params: processedParams };
  } catch {
    return { error: "Erro ao processar query!" };
  }
}
