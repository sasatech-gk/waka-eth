import { z } from "zod";

export const WakaSchema = {
  upperVerse: z.object({
    upperVerse: z.string()
      .min(1, "Upper verse is required")
      .max(100, "Upper verse must be less than 100 characters"),
    signature: z.string()
      .min(1, "Signature is required")
      .describe("Ethereum signature of the upper verse"),
    signerAddress: z.string()
      .min(1, "Signer address is required")
      .describe("Ethereum address of the signer"),
  }),
  
  lowerVerse: z.object({
    tokenId: z.string()
      .min(1, "Token ID is required"),
    lowerVerse: z.string()
      .min(1, "Lower verse is required")
      .max(100, "Lower verse must be less than 100 characters"),
    signature: z.string()
      .min(1, "Signature is required")
      .describe("Ethereum signature of the lower verse"),
    signerAddress: z.string()
      .min(1, "Signer address is required")
      .describe("Ethereum address of the signer"),
  }),

  completeWaka: z.object({
    tokenId: z.string(),
    upperVerse: z.string(),
    lowerVerse: z.string(),
    upperCreator: z.string(),
    lowerCreator: z.string(),
    txHash: z.string(),
    createdAt: z.string(),
    completedAt: z.string(),
  }),
};
