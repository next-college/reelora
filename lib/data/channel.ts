import "server-only";
import prisma from "@/lib/prisma";

export async function getChannel(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            subscribers: true,
            videos: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      subscriberCount: user._count.subscribers,
      videoCount: user._count.videos,
    };
  } catch {
    return null;
  }
}

export async function getChannelVideos(ownerId: string) {
  const videos = await prisma.video.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      thumbnail: true,
      duration: true,
      views: true,
      createdAt: true,
      owner: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  return videos.map((v) => ({
    ...v,
    createdAt: v.createdAt.toISOString(),
  }));
}
