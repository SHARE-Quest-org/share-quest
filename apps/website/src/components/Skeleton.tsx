export function ArticleCardSkeleton({
  layout = "horizontal",
}: {
  layout?: "horizontal" | "vertical";
}) {
  if (layout === "vertical") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-pulse flex flex-col h-full">
        <div className="w-full bg-gray-200 aspect-video" />
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="h-3 bg-gray-200 rounded w-16" />
            <div className="h-3 bg-gray-200 rounded w-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-pulse flex gap-4">
      <div className="w-24 h-24 bg-gray-200 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="flex items-center gap-4 pt-1">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

export function WriterRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl m-2 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-28" />
          <div className="h-3 bg-gray-100 rounded w-16" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-16" />
    </div>
  );
}
