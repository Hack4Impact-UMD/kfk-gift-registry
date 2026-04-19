import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ParentCommentsProps {
  comments?: string;
}

export function ParentComments({ comments }: ParentCommentsProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">Parent Comments</CardTitle>
      </CardHeader>
      <CardContent>
        {comments ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comments}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">No parent comments submitted.</p>
        )}
      </CardContent>
    </Card>
  );
}