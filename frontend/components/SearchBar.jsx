"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState("");

  const submit = () => { if (value.trim()) onSearch(value.trim()); };

  return (
    <div className="flex gap-2 w-full">
      <Input
        placeholder="Ask anything…"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        className="flex-1"
      />
      <Button onClick={submit} disabled={loading}>
        {loading ? "Searching…" : "Search"}
      </Button>
    </div>
  );
}