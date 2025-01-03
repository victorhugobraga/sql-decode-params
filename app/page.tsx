import QueryProcessor from "@/components/QueryProcessor";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8 text-center border-b pb-2">
        SankhyaQL
      </h1>
      <QueryProcessor />
      <Toaster richColors position="top-right" />
    </main>
  );
}
