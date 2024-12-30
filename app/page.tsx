import QueryProcessor from "@/components/QueryProcessor";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8 text-center border-b pb-2">
        QueryMate
      </h1>
      <QueryProcessor />
    </main>
  );
}
