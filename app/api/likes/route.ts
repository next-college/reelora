import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, handleRouteError } from "@/lib/api/respond";
import { requireAuth, getOptionalAuth } from "@/lib/api/requireAuth";
import { likeTargetSchema, toggleLikeSchema } from "@/lib/schemas/like";

type Target = { videoId?: string; commentId?: string };

async function readCounts(target: Target, userId: string | null) {
  const where = {
    videoId: target.videoId ?? null,
    commentId: target.commentId ?? null,
  };

  const [likeCount, dislikeCount, myVote] = await Promise.all([
    prisma.like.count({ where: { ...where, type: "LIKE" } }),
    prisma.like.count({ where: { ...where, type: "DISLIKE" } }),
    userId
      ? prisma.like.findFirst({
          where: { ...where, userId },
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

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = toggleLikeSchema.parse(await req.json());

    await prisma.$transaction(async (tx) => {
      const existing = await tx.like.findFirst({
        where: {
          userId,
          videoId: body.videoId ?? null,
          commentId: body.commentId ?? null,
        },
      });

      if (!existing) {
        await tx.like.create({
          data: {
            type: body.type,
            userId,
            videoId: body.videoId,
            commentId: body.commentId,
          },
        });
        return;
      }

      if (existing.type === body.type) {
        await tx.like.delete({ where: { id: existing.id } });
      } else {
        await tx.like.update({
          where: { id: existing.id },
          data: { type: body.type },
        });
      }
    });

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
