import { z } from "zod";

export const createCounterSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    prefix: z.string().length(1, "Prefix must be exactly 1 character"),
  }),
});

export const updateCounterSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid counter ID"),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    prefix: z.string().length(1).optional(),
  }),
});

export const counterIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid counter ID"),
  }),
});
