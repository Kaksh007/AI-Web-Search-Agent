import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SourceList from "./SourceList";

export default function ResultCard({ result, query }) {
  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="text-base font-medium text-muted-foreground">
          Results for: <span className="text-foreground">"{query}"</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{result.answer}</p>
        <Separator className="my-4" />
        <SourceList sources={result.sources} />
      </CardContent>
    </Card>
  );
}