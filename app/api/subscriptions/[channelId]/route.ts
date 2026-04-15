import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";

type RouteContext = { params: Promise<{ channelId: string }> };

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = await requireAuth();
    const { channelId } = await ctx.params;

    await prisma.subscription.deleteMany({
      where: { subscriberId: userId, channelId },
    });

    return new Response(null, { status: 204 });
  } catch (err) {
    return handleRouteError(err);
  }
}
