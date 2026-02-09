import { z } from 'zod';

export const PhotoSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
});

export const GetPhotosResponseSchema = z.array(PhotoSchema);

export type Photo = z.infer<typeof PhotoSchema>;