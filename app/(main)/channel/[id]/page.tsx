import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChannel, getChannelVideos } from "@/lib/data/channel";
import ChannelView from "@/components/channel/ChannelView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const channel = await getChannel(id);

  if (!channel) {
    return { title: "Channel not found - Reelora" };
  }

  return {
    title: `${channel.name || "Channel"} - Reelora`,
    description: `Watch videos from ${channel.name || "this channel"} on Reelora`,
    openGraph: {
      title: channel.name || "Channel",
      images: channel.image ? [channel.image] : undefined,
    },
  };
}

export default async function ChannelPage({ params }: PageProps) {
  const { id } = await params;
  const [channel, videos] = await Promise.all([
    getChannel(id),
    getChannelVideos(id),
  ]);

  if (!channel) notFound();

  return <ChannelView channel={channel} videos={videos} />;
}
