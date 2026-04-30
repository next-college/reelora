import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, handleRouteError } from "@/lib/api/respond";
import { requireAuth, getOptionalAuth } from "@/lib/api/requireAuth";
import { likeTargetSchema, toggleLikeSchema } from "@/lib/schemas/like";

type Target = { videoId?: string; commentId?: string };

async function readVideoCounts(videoId: string, userId: string | null) {
  const [likeCount, dislikeCount, myVote] = await Promise.all([
    prisma.videoLike.count({ where: { videoId, type: "LIKE" } }),
    prisma.videoLike.count({ where: { videoId, type: "DISLIKE" } }),
    userId
      ? prisma.videoLike.findUnique({
          where: { userId_videoId: { userId, videoId } },
          select: { type: true },
        })
      : Promise.resolve(null),
  ]);
  return {
    liked: myVote?.type === "LIKE",
    disliked: myVote?.type === "DISLIKE",
    likeCount,
    dislikeCount,
  };
}

async function readCommentCounts(commentId: string, userId: string | null) {
  const [likeCount, dislikeCount, myVote] = await Promise.all([
    prisma.commentLike.count({ where: { commentId, type: "LIKE" } }),
    prisma.commentLike.count({ where: { commentId, type: "DISLIKE" } }),
    userId
      ? prisma.commentLike.findUnique({
          where: { userId_commentId: { userId, commentId } },
          select: { type: true },
        })
      : Promise.resolve(null),
  ]);
  return {
    liked: myVote?.type === "LIKE",
    disliked: myVote?.type === "DISLIKE",
    likeCount,
    dislikeCount,
  };
}

async function readCounts(target: Target, userId: string | null) {
  if (target.videoId) return readVideoCounts(target.videoId, userId);
  return readCommentCounts(target.commentId!, userId);
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = toggleLikeSchema.parse(await req.json());

    if (body.videoId) {
      const videoId = body.videoId;
      const existing = await prisma.videoLike.findUnique({
        where: { userId_videoId: { userId, videoId } },
      });
      if (!existing) {
        await prisma.videoLike.create({
          data: { type: body.type, userId, videoId },
        });
      } else if (existing.type === body.type) {
        await prisma.videoLike.delete({ where: { id: existing.id } });
      } else {
        await prisma.videoLike.update({
          where: { id: existing.id },
          data: { type: body.type },
        });
      }
    } else {
      const commentId = body.commentId!;
      const existing = await prisma.commentLike.findUnique({
        where: { userId_commentId: { userId, commentId } },
      });
      if (!existing) {
        await prisma.commentLike.create({
          data: { type: body.type, userId, commentId },
        });
      } else if (existing.type === body.type) {
        await prisma.commentLike.delete({ where: { id: existing.id } });
      } else {
        await prisma.commentLike.update({
          where: { id: existing.id },
          data: { type: body.type },
        });
      }
    }

    const counts = await readCounts(
      { videoId: body.videoId, commentId: body.commentId },
      userId,
    );
    return ok(counts);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const target = likeTargetSchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    );
    const auth = await getOptionalAuth();
    const counts = await readCounts(target, auth?.userId ?? null);
    return ok(counts);
  } catch (err) {
    return handleRouteError(err);
  }
}
