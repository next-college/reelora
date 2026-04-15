import { z } from "zod";

export const likeTargetSchema = z
  .object({
    videoId: z.string().min(1).optional(),
    commentId: z.string().min(1).optional(),
  })
  .refine((d) => Boolean(d.videoId) !== Boolean(d.commentId), {
    message: "Exactly one of videoId or commentId is required",
  });

export const toggleLikeSchema = z
  .object({
    type: z.enum(["LIKE", "DISLIKE"]),
    videoId: z.string().min(1).optional(),
    commentId: z.string().min(1).optional(),
  })
  .refine((d) => Boolean(d.videoId) !== Boolean(d.commentId), {
    message: "Exactly one of videoId or commentId is required",
  });

export type ToggleLikeInput = z.infer<typeof toggleLikeSchema>;
