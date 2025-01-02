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
import { format } from "sql-formatter";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export default function QueryProcessor() {
  // const [state, formAction] = useFormState(processQueryAction, {
  //   result: "",
  //   error: "",
  // });
  const [query, setQuery] = useState("");
  const [params, setParams] = useState("");
  const [result, setResult] = useState("");
  const [formatMode, setFormatMode] = useState(true);

  const processQuery = async () => {
    if (!query) {
      alert("Query is required");
      return;
    }

    const paramsArr = params
      .split("\n")
      .map((param) => param.split(" = ")[1])
      .filter((item) => item);

    const queryProcessed = await processQueryAction(query, paramsArr);
    const queryFormatted =
      formatMode && queryProcessed.result
        ? format(queryProcessed.result, { language: "sql" })
        : queryProcessed.result;

    if (queryFormatted) setResult(queryFormatted);
  };

  useEffect(() => {
    const isQueryIncludesParams = query.toLowerCase().includes("params:");
    if (isQueryIncludesParams) {
      const newParams = query.toLowerCase().split("params:")[1];

      if (params != newParams) setParams(newParams);
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
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button type="button" onClick={processQuery}>
              Processar Query
            </Button>
            <div className="flex items-center space-x-2">
              <Switch
                id="format-mode"
                checked={formatMode}
                onCheckedChange={(value) => setFormatMode(value)}
              />
              <Label htmlFor="format-mode">Formatar</Label>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        {/* {state.error && <div className="text-red-500 mt-2">{state.error}</div>} */}
        {result && (
          <div className="mt-4 w-full">
            <h2 className="text-lg font-semibold">Processada Query:</h2>
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
