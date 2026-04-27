import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { ok, handleRouteError, ApiException } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";
import { encodeCursor, decodeCursor } from "@/lib/api/cursor";
import {
  createVideoSchema,
  listVideosQuerySchema,
} from "@/lib/schemas/video";

const TRENDING_POOL_SIZE = 100;
const TRENDING_RETURN_SIZE = 50;

type VideoRow = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  duration: number | null;
  views: number;
  ownerId: string;
  createdAt: Date;
};

function serializeVideo<T extends VideoRow>(v: T) {
  return {
    ...v,
    createdAt: v.createdAt.toISOString(),
  };
}

function trendingScore(views: number, createdAt: Date): number {
  const hours = (Date.now() - createdAt.getTime()) / 36e5;
  return views / Math.pow(hours + 2, 1.5);
}

export async function GET(req: NextRequest) {
  try {
    const query = listVideosQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams),
    );

    if (query.sort === "trending") {
      const pool = await prisma.video.findMany({
        orderBy: { views: "desc" },
        take: TRENDING_POOL_SIZE,
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

      const ranked = pool
        .map((v) => ({ v, score: trendingScore(v.views, v.createdAt) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, TRENDING_RETURN_SIZE)
        .map(({ v }) => serializeVideo(v));

      return ok({ items: ranked, nextCursor: null });
    }

    const cursor = query.cursor ? decodeCursor(query.cursor) : null;

    const items = await prisma.video.findMany({
      where: cursor
        ? {
            OR: [
              { createdAt: { lt: new Date(cursor.createdAt) } },
              {
                createdAt: new Date(cursor.createdAt),
                id: { lt: cursor.id },
              },
            ],
          }
        : undefined,
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

    return ok({ items: page.map(serializeVideo), nextCursor });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = createVideoSchema.parse(await req.json());

    const expectedPrefix = `reelora/videos/${userId}/`;
    const isOwnFolder =
      body.cloudinary.publicId === `reelora/videos/${userId}` ||
      body.cloudinary.publicId.startsWith(expectedPrefix);
    if (!isOwnFolder) {
      throw new ApiException(
        "FORBIDDEN",
        "Cloudinary publicId does not belong to this user's folder",
      );
    }

    const video = await prisma.video.create({
      data: {
        title: body.title,
        description: body.description,
        tags: body.tags ?? [],
        cloudinaryId: body.cloudinary.publicId,
        url: body.cloudinary.url,
        thumbnail: body.cloudinary.thumbnail,
        duration: body.cloudinary.duration
          ? Math.round(body.cloudinary.duration)
          : null,
        ownerId: userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        duration: true,
        views: true,
        ownerId: true,
        createdAt: true,
      },
    });

    revalidateTag("trending", "max");
    revalidateTag(`channel-${userId}`, "max");

    return ok({ video: serializeVideo(video) }, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
