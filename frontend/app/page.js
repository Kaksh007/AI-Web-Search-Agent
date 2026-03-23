"use client";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import ResultCard from "@/components/ResultCard";
import { search } from "@/lib/api";

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (q) => {
    setQuery(q);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      setResult(await search(q));
    } catch {
      setError("Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">AI Search Agent</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Powered by Groq + Llama 3
        </p>
        <SearchBar onSearch={handleSearch} loading={loading} />
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        {result && <ResultCard result={result} query={query} />}
      </div>
    </main>
  );
}