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
import { sendGAEvent } from "@next/third-parties/google";
import { ArrowRight, Clipboard, Stars } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "sql-formatter";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";

type ParamList = {
  col: string;
  param: string;
};

export default function QueryProcessor() {
  const [query, setQuery] = useState("");
  const [params, setParams] = useState("");
  const [paramsList, setParamsList] = useState<ParamList[]>();
  const [result, setResult] = useState("");
  const [formatMode, setFormatMode] = useState(true);
  const [paramSearch, setParamSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const processQuery = async () => {
    sendGAEvent("event", "processQuery", "Processando query");

    if (!query) {
      toast.warning("Nenhuma query informada!");
      return;
    }

    try {
      setLoading(true);

      const paramsArr = params.replaceAll("\r", "").split("\n");
      paramsArr.shift();
      const paramsQuery = paramsArr.map((param) => param.split(" = ")[1]);

      console.log(paramsQuery);
      if (query.includes("?") && !query.includes("Params:")) {
        throw new Error(
          "Nenhum parâmetro informado! Adicione 'Params:' na query para informar os parâmetros."
        );
      }

      const queryProcessed = await processQueryAction(query, paramsQuery);

      if (queryProcessed.error) {
        throw new Error(queryProcessed.error);
      }

      if (!queryProcessed.result) {
        toast.warning("Nenhuma query processada!");
        return;
      }

      if (queryProcessed.params) {
        setParamsList(queryProcessed.params);
      }

      const queryFormatted =
        formatMode && queryProcessed.result
          ? format(queryProcessed.result, {
              language: "sql",
              keywordCase: "upper",
              dataTypeCase: "upper",
              functionCase: "upper",
            })
          : queryProcessed.result;

      if (queryFormatted) setResult(queryFormatted);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("Erro ao processar query!");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isQueryIncludesParams = query.includes("Params:");
    if (isQueryIncludesParams) {
      const newParams = query.split("Params:")[1];
      if (params != newParams) setParams(newParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <Card className="w-full max-w-4xl mx-auto pt-6">
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
                height="25vh"
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
        {loading ? (
          <div className="flex flex-col space-y-3 w-full">
            <Skeleton className="h-[30vh] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-[200px]" />
            </div>
          </div>
        ) : (
          result && (
            <div className="mt-4 w-full">
              <Tabs defaultValue="result" className="">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="result">Resultado</TabsTrigger>
                  <TabsTrigger value="params">Parâmetros</TabsTrigger>
                  <TabsTrigger value="ia" className="relative">
                    BIA <Stars className="w-4 absolute right-1/4" />
                  </TabsTrigger>
                </TabsList>
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
                      sendGAEvent("event", "copyQuery", "Copiando query");
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
                        <Input
                          placeholder="Digite um parâmetro..."
                          value={paramSearch}
                          onChange={(value) =>
                            setParamSearch(value.currentTarget.value)
                          }
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 flex justify-center items-center">
                      <Table className="">
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
                          {paramsList?.map(
                            (param, index) =>
                              (!paramSearch.length ||
                                param.col.includes(paramSearch)) && (
                                <TableRow key={index}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell className="font-bold">
                                    {param.col.toUpperCase()}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={"secondary"}
                                      className={
                                        !isNaN(Number(param.param))
                                          ? "text-green-600"
                                          : "text-orange-600"
                                      }
                                    >
                                      {param.param}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="ia">
                  {/* add a mocked template to an response from the ia about what the sql do with an avatar of the ia as an user*/}
                  <ScrollArea className="h-[40vh] mt-4 pr-3">
                    <div className="flex gap-2">
                      <Avatar>
                        <AvatarFallback>IA</AvatarFallback>
                        <AvatarImage src="/bia.svg" alt="IA" />
                      </Avatar>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Com base no contexto fornecido, posso explicar que
                          esta query está realizando uma consulta na tabela
                          TGFITE (tabela de itens de notas) do sistema Sankhya,
                          buscando todos os registros (*) onde o NUNOTA (número
                          único da nota) seja igual a 6581.
                        </p>
                        <p className="text-sm text-gray-600">
                          A tabela TGFITE contém os itens/produtos das notas
                          fiscais, e esta consulta irá retornar todas as
                          informações relacionadas aos itens desta nota
                          específica, incluindo:
                        </p>
                        <ul className="text-sm text-gray-600 list-disc pl-4">
                          <li className="list-item">Produtos (CODPROD)</li>
                          <li className="list-item">
                            Quantidades negociadas (QTDNEG)
                          </li>
                          <li className="list-item">
                            Local de origem (CODLOCALORIG)
                          </li>
                          <li className="list-item">Controle (CONTROLE)</li>
                          <li className="list-item">
                            Status da nota (STATUSNOTA)
                          </li>
                          <li className="list-item">
                            Entre outras informações relacionadas aos itens
                          </li>
                        </ul>
                        <p className="text-sm text-gray-600">
                          É importante observar que esta consulta mostra apenas
                          os itens, sem considerar as informações do cabeçalho
                          da nota que estão armazenadas na tabela TGFCAB. Para
                          uma análise mais completa, seria interessante
                          relacionar também com a tabela de cabeçalho através de
                          um JOIN.
                        </p>
                        <p className="text-sm text-gray-600">
                          Uma versão mais completa da consulta poderia ser:
                        </p>
                        <Editor
                          theme="vs-light"
                          height="120px"
                          value={
                            "SELECT CAB.*, ITE.* \rFROM TGFCAB CAB \rINNER JOIN TGFITE ITE ON CAB.NUNOTA = ITE.NUNOTA \rWHERE CAB.NUNOTA = 6581"
                          }
                          onChange={() => setResult(result)}
                          defaultLanguage="sql"
                          className="mt-2 border border-gray-300 py-4 overflow-hidden rounded-lg"
                        />
                        <p className="text-sm text-gray-600">
                          Esta versão traria tanto as informações dos itens
                          quanto do cabeçalho da nota.
                        </p>
                        <div className="w-full flex flex-wrap items-center justify-between">
                          <div className="flex flex-wrap">
                            <button
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-400 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 hover:text-tertiary-hover-foreground focus-visible:text-tertiary-hover-foreground rounded-lg h-fit px-2 py-2"
                              data-action-id="answer_feedback_positive_btn"
                              title="Reforço Positivo"
                              type="button"
                              aria-haspopup="dialog"
                              aria-expanded="false"
                              aria-controls="radix-:r2:"
                              data-state="closed"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="var(--text-primary-700)"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-thumbs-up h-4 w-4"
                              >
                                <path d="M7 10v12"></path>
                                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                              </svg>
                            </button>
                            <button
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-400 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 hover:text-tertiary-hover-foreground focus-visible:text-tertiary-hover-foreground rounded-lg h-fit px-2 py-2"
                              data-action-id="answer_feedback_negative_btn"
                              title="Reforço Negativo"
                              type="button"
                              aria-haspopup="dialog"
                              aria-expanded="false"
                              aria-controls="radix-:r5:"
                              data-state="closed"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-thumbs-down h-4 w-4"
                              >
                                <path d="M17 14V2"></path>
                                <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
                              </svg>
                            </button>
                            <button
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-400 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 hover:text-tertiary-hover-foreground focus-visible:text-tertiary-hover-foreground rounded-lg h-fit px-2 py-2"
                              data-action-id="answer_references_btn"
                              title="Ver referências"
                              type="button"
                              aria-haspopup="dialog"
                              aria-expanded="false"
                              aria-controls="radix-:r8:"
                              data-state="closed"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-globe h-4 w-4"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                                <path d="M2 12h20"></path>
                              </svg>
                            </button>
                            <button
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-400 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 hover:text-tertiary-hover-foreground focus-visible:text-tertiary-hover-foreground rounded-lg h-fit px-2 py-2"
                              data-action-id="answer_retry_btn"
                              title="Refazer resposta"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-refresh-cw h-4 w-4"
                              >
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                                <path d="M21 3v5h-5"></path>
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                                <path d="M8 16H3v5"></path>
                              </svg>
                            </button>
                          </div>
                          <div>
                            {/* Continue chat link */}
                            <Button variant={"link"} className="text-[#008561]">
                              Continuar chat <ArrowRight />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )
        )}
      </CardFooter>
    </Card>
  );
}
