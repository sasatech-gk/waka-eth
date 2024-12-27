import { z } from "zod";

export const WakaSchema = z.object({
  upperVerse: z.string().min(1, "上の句は必須です"),
  lowerVerse: z.string().optional(),
  signature: z.string().optional(),
});

export type WakaType = z.infer<typeof WakaSchema>;
