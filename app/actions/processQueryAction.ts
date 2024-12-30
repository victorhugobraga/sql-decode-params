'use server'

import { processQuery } from '@/utils/processQuery';

export async function processQueryAction(formData: FormData) {
  const query = formData.get('query') as string;
  const params = (formData.get('params') as string).split(' ').filter(Boolean);

  if (!query) {
    return { error: 'Query is required' };
  }

  try {
    const processedQuery = processQuery(query, params);
    return { result: processedQuery };
  } catch (error) {
    return { error: 'Error processing query' };
  }
}

