interface ParentCommentsProps {
  comments?: string;
}

export function ParentComments({ comments }: ParentCommentsProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <h3 className="text-lg font-semibold">Parent Comments</h3>

      <div className="w-full rounded-xl border bg-muted shadow-sm p-4">
        {comments ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {comments}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            No parent comments submitted.
          </p>
        )}
      </div>
    </div>
  );
}
