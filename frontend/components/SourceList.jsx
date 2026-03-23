import { Badge } from "@/components/ui/badge";

export default function SourceList({ sources }) {
  if (!sources?.length) return null;

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Sources
      </p>
      <div className="flex flex-col gap-2">
        {sources.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-sm hover:underline text-blue-600 dark:text-blue-400"
          >
            <Badge variant="outline" className="shrink-0 mt-0.5">{i + 1}</Badge>
            <span className="break-all">{s.title || s.url}</span>
          </a>
        ))}
      </div>
    </div>
  );
}