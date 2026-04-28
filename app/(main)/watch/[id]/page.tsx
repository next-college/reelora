import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVideo, getRelatedVideos } from "@/lib/data/video";
import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import WatchView from "@/components/video/WatchView";
import WatchPosterShell from "@/components/video/WatchPosterShell";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideo(id);

  if (!video) {
    return { title: "Video not found - Reelora" };
  }

  return {
    title: `${video.title} - Reelora`,
    description: video.description || `Watch ${video.title} on Reelora`,
    openGraph: {
      title: video.title,
      description: video.description || undefined,
      images: video.thumbnail ? [video.thumbnail] : undefined,
      type: "video.other",
    },
  };
}

export default async function WatchPage({ params }: PageProps) {
  const { id } = await params;
  const [video, related] = await Promise.all([
    getVideo(id),
    getRelatedVideos(id),
  ]);

  if (!video) notFound();

  return (
    <DirectionalTransition>
      <WatchView
        video={video}
        related={related}
        poster={<WatchPosterShell thumbnail={video.thumbnail} title={video.title} />}
      />
    </DirectionalTransition>
  );
}
