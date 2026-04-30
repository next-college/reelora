export default function ChannelPreviewSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border-default">
      <div className="w-16 h-16 rounded-full bg-bg-hover animate-pulse shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 w-32 rounded bg-bg-hover animate-pulse" />
        <div className="h-3 w-48 rounded bg-bg-hover animate-pulse" />
      </div>
    </div>
  );
}
