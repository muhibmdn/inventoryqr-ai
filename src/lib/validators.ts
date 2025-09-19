import { z } from "zod";

export const itemCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  brandModel: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  quantity: z.number().int().min(0).default(1),
  unitPrice: z.number().optional().nullable(),
  purchasedAt: z.string().optional().nullable(),
  fundingSource: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  rack: z.string().optional().nullable(),
  condition: z.enum(["NEW", "GOOD", "DEFECT", "BROKEN"]).optional(),
  pic: z.string().optional().nullable(),
  lastCheckedAt: z.string().optional().nullable(),
  damagedAt: z.string().optional().nullable(),
});
