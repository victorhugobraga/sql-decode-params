"use client";

import { processQueryAction } from "@/app/actions/processQueryAction";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";

export default function QueryProcessor() {
  // const [state, formAction] = useFormState(processQueryAction, {
  //   result: "",
  //   error: "",
  // });
  const [query, setQuery] = useState("");
  const [params, setParams] = useState("");
  const [showParams, setShowParams] = useState(true);
  const [result, setResult] = useState("");

  const processQuery = async () => {
    if (!query) {
      alert("Query is required");
      return;
    }

    const paramsArr = params
      .split("\n")
      .map((param) => param.split(" = ")[1])
      .filter((item) => item);

    console.log(paramsArr);
    const queryProcessed = await processQueryAction(query, paramsArr);
    console.log(queryProcessed);
    if (queryProcessed.result) setResult(queryProcessed.result);
  };

  useEffect(() => {
    const isQueryIncludesParams = query.toLowerCase().includes("params:");
    setShowParams(!isQueryIncludesParams);

    if (isQueryIncludesParams) {
      const newParams = query.split("params:")[1];

      if (params != newParams) setParams(newParams);
      console.log(newParams);
    }
  }, [query]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Processador SQL Query</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="query"
                className="block text-sm font-medium text-gray-700"
              >
                SQL Query (use ? para os parâmetros)
              </label>
              <Editor
                theme="vs-light"
                height="30vh"
                value={query}
                onChange={(value) => setQuery(value ?? "")}
                defaultLanguage="sql"
                className="mt-1 border border-gray-300 py-4 overflow-hidden rounded-lg"
              />
            </div>
            {showParams && (
              <div>
                <label
                  htmlFor="params"
                  className="block text-sm font-medium text-gray-700"
                >
                  Parâmetros (separados por linhas)
                </label>
                <textarea
                  id="params"
                  name="params"
                  value={params}
                  onChange={(e) => setParams(e.target.value)}
                  placeholder="index: valor"
                  rows={5}
                  className="mt-1 border border-gray-300 rounded-lg shadow-sm block w-full sm:text-sm p-2"
                />
              </div>
            )}
          </div>
          <Button type="button" onClick={processQuery} className="mt-4">
            Processar Query
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        {/* {state.error && <div className="text-red-500 mt-2">{state.error}</div>} */}
        {result && (
          <div className="mt-4 w-full">
            <h2 className="text-lg font-semibold">Processed Query:</h2>
            <Editor
              theme="vs-light"
              height="30vh"
              value={result}
              onChange={() => setResult(result)}
              defaultLanguage="sql"
              className="mt-1 border border-gray-300 py-4 overflow-hidden rounded-lg"
            />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
