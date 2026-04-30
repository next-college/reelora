import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, handleRouteError, ApiException } from "@/lib/api/respond";
import { requireAuth, getOptionalAuth } from "@/lib/api/requireAuth";
import { encodeCursor, decodeCursor } from "@/lib/api/cursor";
import {
  createCommentSchema,
  listCommentsQuerySchema,
} from "@/lib/schemas/comment";

const REPLIES_PER_COMMENT_CAP = 3;

const COMMENT_SELECT = {
  id: true,
  body: true,
  videoId: true,
  parentId: true,
  createdAt: true,
  author: { select: { id: true, name: true, image: true } },
} as const;

type CommentRow = {
  id: string;
  body: string;
  videoId: string;
  parentId: string | null;
  createdAt: Date;
  author: { id: string; name: string | null; image: string | null };
};

type VoteState = {
  likes: number;
  dislikes: number;
  userVote: "LIKE" | "DISLIKE" | null;
};

async function buildVoteMap(
  commentIds: string[],
  viewerId: string | null,
): Promise<Map<string, VoteState>> {
  const map = new Map<string, VoteState>();
  if (commentIds.length === 0) return map;

  for (const id of commentIds) {
    map.set(id, { likes: 0, dislikes: 0, userVote: null });
  }

  const [grouped, viewerVotes] = await Promise.all([
    prisma.commentLike.groupBy({
      by: ["commentId", "type"],
      where: { commentId: { in: commentIds } },
      _count: { _all: true },
    }),
    viewerId
      ? prisma.commentLike.findMany({
          where: { userId: viewerId, commentId: { in: commentIds } },
          select: { commentId: true, type: true },
        })
      : Promise.resolve([]),
  ]);

  for (const row of grouped) {
    const entry = map.get(row.commentId);
    if (!entry) continue;
    if (row.type === "LIKE") entry.likes = row._count._all;
    else entry.dislikes = row._count._all;
  }

  for (const v of viewerVotes) {
    const entry = map.get(v.commentId);
    if (entry) entry.userVote = v.type;
  }

  return map;
}

function serializeComment(c: CommentRow, vote: VoteState) {
  return {
    id: c.id,
    body: c.body,
    videoId: c.videoId,
    parentId: c.parentId,
    createdAt: c.createdAt.toISOString(),
    author: c.author,
    likes: vote.likes,
    dislikes: vote.dislikes,
    userVote: vote.userVote,
  };
}

export async function GET(req: NextRequest) {
  try {
    const query = listCommentsQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    );
    const auth = await getOptionalAuth();
    const viewerId = auth?.userId ?? null;

    const cursor = query.cursor ? decodeCursor(query.cursor) : null;

    const where = query.videoId
      ? { videoId: query.videoId, parentId: null }
      : { parentId: query.parentId };

    const items = await prisma.comment.findMany({
      where: cursor
        ? {
            ...where,
            OR: [
              { createdAt: { lt: new Date(cursor.createdAt) } },
              {
                createdAt: new Date(cursor.createdAt),
                id: { lt: cursor.id },
              },
            ],
          }
        : where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: query.limit + 1,
      select: COMMENT_SELECT,
    });

    const hasMore = items.length > query.limit;
    const page = hasMore ? items.slice(0, query.limit) : items;
    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last
        ? encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id })
        : null;

    if (page.length === 0) {
      return ok({ items: [], nextCursor });
    }

    if (query.parentId) {
      const voteMap = await buildVoteMap(
        page.map((c) => c.id),
        viewerId,
      );
      return ok({
        items: page.map((c) =>
          serializeComment(c, voteMap.get(c.id) ?? {
            likes: 0,
            dislikes: 0,
            userVote: null,
          }),
        ),
        nextCursor,
      });
    }

    const topIds = page.map((c) => c.id);

    const [allReplies, replyCounts] = await Promise.all([
      prisma.comment.findMany({
        where: { parentId: { in: topIds } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: COMMENT_SELECT,
      }),
      prisma.comment.groupBy({
        by: ["parentId"],
        where: { parentId: { in: topIds } },
        _count: { _all: true },
      }),
    ]);

    const repliesByParent = new Map<string, CommentRow[]>();
    for (const id of topIds) repliesByParent.set(id, []);
    for (const r of allReplies) {
      if (!r.parentId) continue;
      const list = repliesByParent.get(r.parentId);
      if (!list) continue;
      if (list.length < REPLIES_PER_COMMENT_CAP) list.push(r);
    }

    const replyCountByParent = new Map<string, number>();
    for (const row of replyCounts) {
      if (row.parentId) replyCountByParent.set(row.parentId, row._count._all);
    }

    const visibleReplyIds: string[] = [];
    for (const list of repliesByParent.values()) {
      for (const r of list) visibleReplyIds.push(r.id);
    }

    const voteMap = await buildVoteMap(
      [...topIds, ...visibleReplyIds],
      viewerId,
    );

    const emptyVote: VoteState = { likes: 0, dislikes: 0, userVote: null };

    return ok({
      items: page.map((c) => {
        const replies = (repliesByParent.get(c.id) ?? [])
          .slice()
          .reverse()
          .map((r) => serializeComment(r, voteMap.get(r.id) ?? emptyVote));
        return {
          ...serializeComment(c, voteMap.get(c.id) ?? emptyVote),
          replies,
          replyCount: replyCountByParent.get(c.id) ?? 0,
        };
      }),
      nextCursor,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = createCommentSchema.parse(await req.json());

    const video = await prisma.video.findUnique({
      where: { id: body.videoId },
      select: { id: true },
    });
    if (!video) throw new ApiException("NOT_FOUND", "Video not found");

    let effectiveParentId: string | null = null;
    if (body.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: body.parentId },
        select: { id: true, parentId: true, videoId: true },
      });
      if (!parent) {
        throw new ApiException("NOT_FOUND", "Parent comment not found");
      }
      if (parent.videoId !== body.videoId) {
        throw new ApiException(
          "BAD_REQUEST",
          "Parent comment does not belong to this video",
        );
      }
      // Flatten to 2-level depth: replies to replies attach to the top-level ancestor.
      effectiveParentId = parent.parentId ?? parent.id;
    }

    const comment = await prisma.comment.create({
      data: {
        body: body.body,
        videoId: body.videoId,
        authorId: userId,
        parentId: effectiveParentId,
      },
      select: COMMENT_SELECT,
    });

    const emptyVote: VoteState = { likes: 0, dislikes: 0, userVote: null };
    return ok(
      { comment: serializeComment(comment, emptyVote) },
      { status: 201 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
