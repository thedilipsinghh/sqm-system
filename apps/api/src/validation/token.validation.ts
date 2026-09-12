import { z } from "zod";

export const generateTokenSchema = z.object({
  body: z.object({
    counterId: z.string().uuid("Invalid counter ID"),
  }),
});

export const tokenIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid token ID"),
  }),
});
