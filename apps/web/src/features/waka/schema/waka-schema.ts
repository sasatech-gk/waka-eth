import { z } from "zod";

export const WakaSchema = {
  upperVerse: z.object({
    upperVerse: z.string()
      .min(1, "Upper verse is required")
      .max(100, "Upper verse must be less than 100 characters"),
    signature: z.string()
      .optional()
      .describe("Ethereum signature of the upper verse"),
  }),
  
  lowerVerse: z.object({
    verseId: z.string()
      .min(1, "Verse ID is required"),
    lowerVerse: z.string()
      .min(1, "Lower verse is required")
      .max(100, "Lower verse must be less than 100 characters"),
    signature: z.string()
      .optional()
      .describe("Ethereum signature of the lower verse"),
  }),

  completeWaka: z.object({
    id: z.string(),
    upperVerse: z.string(),
    lowerVerse: z.string(),
    upperVerseSignature: z.string().optional(),
    lowerVerseSignature: z.string().optional(),
    createdAt: z.string(),
    completedAt: z.string().optional(),
  }),
};
