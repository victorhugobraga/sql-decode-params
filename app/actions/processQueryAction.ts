"use server";

import { processQuery } from "@/utils/processQuery";

export async function processQueryAction(query: string, params: string[]) {
  if (!query) {
    return { error: "Query is required" };
  }

  try {
    const processedQuery = processQuery(query, params);
    return { result: processedQuery };
  } catch (error) {
    console.error(error);
    return { error: "Error processing query" };
  }
}
