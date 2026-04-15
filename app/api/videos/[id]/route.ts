import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";
import { ok, handleRouteError, ApiException } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";
import { updateVideoSchema } from "@/lib/schemas/video";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;

    const video = await prisma.video.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        url: true,
        duration: true,
        views: true,
        tags: true,
        createdAt: true,
        owner: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return ok({
      video: { ...video, createdAt: video.createdAt.toISOString() },
    });
  } catch (err) {
    if (
      typeof err === "object" &&
      err &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return handleRouteError(new ApiException("NOT_FOUND", "Video not found"));
    }
    return handleRouteError(err);
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = await requireAuth();
    const { id } = await ctx.params;
    const body = updateVideoSchema.parse(await req.json());

    const existing = await prisma.video.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!existing) throw new ApiException("NOT_FOUND", "Video not found");
    if (existing.ownerId !== userId) {
      throw new ApiException("FORBIDDEN", "Not your video");
    }

    const video = await prisma.video.update({
      where: { id },
      data: body,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        duration: true,
        views: true,
        tags: true,
        ownerId: true,
        createdAt: true,
      },
    });

    revalidateTag(`video-${id}`, "max");
    revalidateTag(`channel-${userId}`, "max");

    return ok({
      video: { ...video, createdAt: video.createdAt.toISOString() },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = await requireAuth();
    const { id } = await ctx.params;

    const existing = await prisma.video.findUnique({
      where: { id },
      select: { ownerId: true, cloudinaryId: true },
    });
    if (!existing) throw new ApiException("NOT_FOUND", "Video not found");
    if (existing.ownerId !== userId) {
      throw new ApiException("FORBIDDEN", "Not your video");
    }

    await prisma.video.delete({ where: { id } });

    try {
      await cloudinary.uploader.destroy(existing.cloudinaryId, {
        resource_type: "video",
        invalidate: true,
      });
    } catch (purgeErr) {
      console.error("Cloudinary purge failed:", purgeErr);
    }

    revalidateTag(`video-${id}`, "max");
    revalidateTag("trending", "max");
    revalidateTag(`channel-${userId}`, "max");

    return ok({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
