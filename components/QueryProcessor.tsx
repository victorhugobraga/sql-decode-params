"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Editor } from "@monaco-editor/react";
import { useState } from "react";

export default function QueryProcessor() {
  // const [state, formAction] = useFormState(processQueryAction, {
  //   result: "",
  //   error: "",
  // });
  const [query, setQuery] = useState("");
  const [params, setParams] = useState("");

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
                defaultLanguage="sql"
                className="mt-1 border border-gray-300 py-4 overflow-hidden rounded-lg"
              />
            </div>
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
          </div>
          <Button type="submit" className="mt-4">
            Processar Query
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        {/* {state.error && <div className="text-red-500 mt-2">{state.error}</div>}
        {state.result && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Processed Query:</h2>
            <pre className="bg-gray-100 p-2 rounded mt-2 whitespace-pre-wrap">
              {state.result}
            </pre>
          </div>
        )} */}
      </CardFooter>
    </Card>
  );
}
