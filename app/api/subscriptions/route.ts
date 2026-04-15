import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, handleRouteError, ApiException } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/requireAuth";
import { subscribeSchema } from "@/lib/schemas/subscription";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const { channelId } = subscribeSchema.parse(await req.json());

    if (channelId === userId) {
      throw new ApiException("BAD_REQUEST", "Cannot subscribe to yourself");
    }

    const channel = await prisma.user.findUnique({
      where: { id: channelId },
      select: { id: true },
    });
    if (!channel) throw new ApiException("NOT_FOUND", "Channel not found");

    const existing = await prisma.subscription.findFirst({
      where: { subscriberId: userId, channelId },
      select: { id: true },
    });
    if (!existing) {
      await prisma.subscription.create({
        data: { subscriberId: userId, channelId },
      });
    }

    return ok({ subscribed: true, channelId });
  } catch (err) {
    return handleRouteError(err);
  }
}
