import QueryProcessor from "@/components/QueryProcessor";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Plus } from "lucide-react";

export default function Home() {
  return (
    <main className="py-4 px-8">
      <header className="container mx-auto mb-8 border-b pb-2 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#008561]">SankhyaQL</h1>
        <Button variant={"outline"}>
          <Plus /> Adicionar Log
        </Button>
      </header>

      <section className="flex gap-8">
        <QueryProcessor />
      </section>
      <Toaster richColors position="top-right" />
    </main>
  );
}
