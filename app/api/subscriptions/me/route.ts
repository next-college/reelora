import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, handleRouteError } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";
import { encodeCursor, decodeCursor } from "@/lib/api/cursor";
import { feedQuerySchema } from "@/lib/schemas/subscription";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const query = feedQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    );

    const subs = await prisma.subscription.findMany({
      where: { subscriberId: userId },
      select: { channelId: true },
    });
    const channelIds = subs.map((s) => s.channelId);

    if (channelIds.length === 0) {
      return ok({ items: [], nextCursor: null });
    }

    const cursor = query.cursor ? decodeCursor(query.cursor) : null;

    const items = await prisma.video.findMany({
      where: {
        ownerId: { in: channelIds },
        ...(cursor && {
          OR: [
            { createdAt: { lt: new Date(cursor.createdAt) } },
            {
              createdAt: new Date(cursor.createdAt),
              id: { lt: cursor.id },
            },
          ],
        }),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: query.limit + 1,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        duration: true,
        views: true,
        ownerId: true,
        createdAt: true,
        owner: { select: { id: true, name: true, image: true } },
      },
    });

    const hasMore = items.length > query.limit;
    const page = hasMore ? items.slice(0, query.limit) : items;
    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last
        ? encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id })
        : null;

    return ok({
      items: page.map((v) => ({
        ...v,
        createdAt: v.createdAt.toISOString(),
      })),
      nextCursor,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
