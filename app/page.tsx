import QueryProcessor from "@/components/QueryProcessor";
import { Toaster } from "@/components/ui/sonner";
import { LucideGithub } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <header className="mb-8 border-b pb-2 flex justify-between items-center">
        <h1 className="text-2xl font-bold">SankhyaQL</h1>
        <a
          href="https://github.com/victorhugobraga/inquery"
          target="_blank"
          rel="noopener noreferrer"
        >
          <LucideGithub />
        </a>
      </header>
      <QueryProcessor />
      <Toaster richColors position="top-right" />
    </main>
  );
}
