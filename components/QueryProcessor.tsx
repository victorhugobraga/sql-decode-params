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
import { Clipboard, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "sql-formatter";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent } from "./ui/tabs";

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
      toast.warning("Nenhuma query informada!");
      return;
    }

    const paramsArr = params.replaceAll("\r", "").split("\n");
    paramsArr.shift();
    const paramsQuery = paramsArr.map((param) => param.split(" = ")[1]);
    const queryProcessed = await processQueryAction(query, paramsQuery);

    if (queryProcessed.error) {
      toast.error(queryProcessed.error);
      return;
    }

    if (!queryProcessed.result) {
      toast.warning("Nenhuma query processada!");
      return;
    }

    console.log("queryProcessed", paramsQuery);

    const queryFormatted =
      formatMode && queryProcessed.result
        ? format(queryProcessed.result, {
            language: "sql",
            keywordCase: "upper",
            dataTypeCase: "upper",
            functionCase: "upper",
            identifierCase: "upper",
          })
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
        {result && (
          <div className="mt-4 w-full">
            <Tabs defaultValue="result" className="">
              {/* <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="result">Resultado</TabsTrigger>
                <TabsTrigger value="params">Parâmetros</TabsTrigger>
              </TabsList> */}
              <TabsContent value="result">
                <Editor
                  theme="vs-light"
                  height="30vh"
                  value={result}
                  onChange={() => setResult(result)}
                  defaultLanguage="sql"
                  className="mt-1 border border-gray-300 py-4 overflow-hidden rounded-lg"
                />
                <Button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    toast.success(
                      "Resultado copiado para a área de transferência!"
                    );
                  }}
                  className="mt-2"
                  variant={"outline"}
                >
                  <Clipboard /> Copiar resultado
                </Button>
              </TabsContent>
              <TabsContent value="params">
                <Card>
                  <CardHeader>
                    <CardTitle>Parâmetros informados</CardTitle>
                    <div className="flex gap-2">
                      <Input placeholder="Digite um parâmetro..." />
                      <Button type="button" variant={"outline"}>
                        <Search /> Pesquisar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 flex justify-center items-center">
                    <Table className="w-full max-w-[400px] mx-auto border rounded-lg shadow overflow-hidden">
                      <TableCaption>
                        Lista de parâmetros informados
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Index</TableHead>
                          <TableHead>Parâmetro</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>1</TableCell>
                          <TableCell className="font-bold">NUNOTA</TableCell>
                          <TableCell>57</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>1</TableCell>
                          <TableCell className="font-bold">NUNOTA</TableCell>
                          <TableCell>57</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
