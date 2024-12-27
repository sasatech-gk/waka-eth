import { NextRequest, NextResponse } from "next/server";
import { WakaSchema } from "../schema/waka-schema";
import { addLowerVerse, verifySignature, getVerse } from "../utils/web3";
import { ethers } from "ethers";
import { getProvider } from "../utils/web3";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate the request body against the schema
    const { tokenId, lowerVerse, signature, signerAddress } = WakaSchema.lowerVerse.parse(body);

    // Verify the signature
    const message = `Add lower verse to ${tokenId}: ${lowerVerse}`;
    if (!verifySignature(message, signature, signerAddress)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Get the verse information to verify it exists and is incomplete
    const provider = getProvider();
    const verseInfo = await getVerse(provider, tokenId);
    
    if (!verseInfo || verseInfo.isComplete) {
      return NextResponse.json(
        { error: "Verse not found or already completed" },
        { status: 400 }
      );
    }

    // Create wallet from signature for contract interaction
    const wallet = new ethers.Wallet(signature);
    
    // Add lower verse and mint NFT
    const { txHash } = await addLowerVerse(wallet, tokenId, lowerVerse);

    return NextResponse.json({ 
      tokenId,
      txHash,
      lowerVerse,
      signerAddress,
      status: "completed",
      message: "Lower verse added successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating lower verse:", error);
    return NextResponse.json(
      { error: "Failed to create lower verse" },
      { status: 400 }
    );
  }
}
