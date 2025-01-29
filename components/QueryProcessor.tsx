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
import { Clipboard, Plus } from "lucide-react";
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
import { Avatar, AvatarFallback } from "./ui/avatar";
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <h1>Processador SQL Query</h1>
          <Button variant={"outline"}>
            <Plus /> Adicionar Log
          </Button>
        </CardTitle>
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
                  <TabsTrigger value="ia">IA</TabsTrigger>
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
                  <ScrollArea className="h-[30vh] mt-4 pr-3">
                    <div className="flex gap-2">
                      <Avatar>
                        <AvatarFallback>IA</AvatarFallback>
                      </Avatar>
                      <p className="text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Delectus velit alias ad accusamus quia. Quaerat
                        eaque iste soluta aliquam voluptate consequuntur totam
                        porro, cumque debitis. Possimus quo aliquam illum
                        eligendi? Laudantium nihil perspiciatis necessitatibus
                        labore laborum inventore sunt esse numquam iusto
                        voluptatibus amet corrupti quisquam, velit nisi, libero
                        at expedita. Voluptatibus amet nisi officiis,
                        exercitationem aperiam sint illo possimus ut? Eveniet
                        delectus repellat facilis animi. Quisquam minus tempore
                        placeat laborum nisi doloribus modi sed illum
                        necessitatibus optio consectetur quidem consequuntur
                        nesciunt quas totam, quae, sit mollitia. Sit magni
                        assumenda temporibus. Culpa, quos quis ipsum quaerat
                        libero sapiente recusandae porro incidunt nobis ad modi.
                        A, soluta hic eius enim in amet nesciunt officia
                        laudantium placeat natus, eaque sunt ipsa, porro nulla.
                        Aliquid autem consequatur nam? Deserunt sint itaque cum
                        officiis rem beatae voluptates ullam, amet quis
                        quibusdam nam voluptas temporibus eum omnis facere
                        consectetur maxime numquam tempora reprehenderit modi
                        molestias doloremque. Possimus ullam delectus
                        consectetur voluptatem incidunt dolores similique velit
                        est aperiam debitis, laboriosam, odio enim adipisci
                        iusto? Numquam officiis facilis ea unde officia labore
                        eveniet hic? Eos repellat libero esse? Ipsum, asperiores
                        ab? Magnam molestiae esse numquam blanditiis possimus
                        quam incidunt cum reprehenderit magni tenetur,
                        distinctio omnis consectetur perspiciatis optio quo ut
                        maiores beatae error quaerat repellat. Molestiae, neque
                        hic? Unde molestiae hic ut enim ducimus earum sed
                        reiciendis illum dicta distinctio voluptatum est
                        temporibus, eveniet autem mollitia porro error voluptate
                        quas odio voluptas laudantium molestias recusandae! Eum,
                        aperiam tempora. Quod, hic suscipit, ex ducimus
                        assumenda porro veniam vitae repellendus blanditiis
                        eaque provident optio maiores consequatur facilis amet
                        fugiat officia enim! Suscipit doloribus consequuntur
                        explicabo praesentium quis earum optio quia! Ab
                        voluptates maiores eaque hic eos facilis odit quis
                        itaque? Laborum delectus ipsum quaerat explicabo
                        obcaecati voluptas eligendi dolore incidunt,
                        perspiciatis assumenda ipsam temporibus at est, harum
                        iste quidem distinctio!
                      </p>
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
