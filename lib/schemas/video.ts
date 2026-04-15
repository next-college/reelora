import { z } from "zod";

export const createVideoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  cloudinary: z.object({
    publicId: z.string().min(1),
    url: z.url(),
    thumbnail: z.url().optional(),
    duration: z.number().positive().optional(),
  }),
});

export const updateVideoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
});

export const listVideosQuerySchema = z.object({
  sort: z.enum(["new", "trending"]).default("new"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;
