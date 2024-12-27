import { NextRequest, NextResponse } from "next/server";
import { WakaSchema } from "../schema/waka-schema";
import { createUpperVerse, verifySignature } from "../utils/web3";
import { ethers } from "ethers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate the request body against the schema
    const { upperVerse, signature, signerAddress } = WakaSchema.upperVerse.parse(body);

    // Verify the signature
    const message = `Create upper verse: ${upperVerse}`;
    if (!verifySignature(message, signature, signerAddress)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Create wallet from signature for contract interaction
    const wallet = new ethers.Wallet(signature);
    
    // Create upper verse on-chain
    const { tokenId, txHash } = await createUpperVerse(wallet, upperVerse);

    return NextResponse.json({ 
      tokenId,
      txHash,
      upperVerse,
      signerAddress,
      collaborationUrl: `/waka/${tokenId}/complete` 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating upper verse:", error);
    return NextResponse.json(
      { error: "Failed to create upper verse" },
      { status: 400 }
    );
  }
}
