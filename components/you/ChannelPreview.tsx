import Link from "next/link";
import Image from "next/image";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { getChannel } from "@/lib/data/channel";

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

interface ChannelPreviewProps {
  userId: string;
}

export default async function ChannelPreview({ userId }: ChannelPreviewProps) {
  const channel = await getChannel(userId);

  if (!channel) {
    return null;
  }

  return (
    <Link
      href={`/channel/${channel.id}`}
      className="group flex items-center gap-4 p-4 rounded-xl border border-border-default hover:bg-bg-hover transition-base"
    >
      {channel.image ? (
        <Image
          src={channel.image}
          alt={channel.name || "Your channel"}
          width={64}
          height={64}
          className="w-16 h-16 rounded-full object-cover border border-border-default shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-bg-hover border border-border-default flex items-center justify-center shrink-0">
          <span className="text-xl font-semibold text-text-secondary">
            {channel.name?.charAt(0)?.toUpperCase() || "?"}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {channel.name || "Your channel"}
        </p>
        <p className="text-xs text-text-muted mt-0.5 font-mono">
          {formatCount(channel.subscriberCount)} subscribers &middot;{" "}
          {formatCount(channel.videoCount)} videos
        </p>
        <p className="text-xs text-text-secondary mt-1.5 group-hover:text-text-primary transition-base">
          View your channel
        </p>
      </div>
      <CaretRightIcon
        size={16}
        className="text-text-muted group-hover:text-text-secondary transition-base shrink-0"
      />
    </Link>
  );
}
