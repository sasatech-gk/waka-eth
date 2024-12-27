import { NextRequest, NextResponse } from "next/server";
import { WakaSchema } from "../schema/waka-schema";
import { generateId } from "../utils/generate-id";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate the request body against the schema
    const { upperVerse, signature } = WakaSchema.upperVerse.parse(body);

    // TODO: Verify the signature using Web3
    // This will be implemented when we add blockchain integration

    // Generate a unique ID for this verse
    const verseId = generateId();

    // TODO: Store the verse in Supabase
    // For now, we'll return the ID that will be used to create the collaboration URL
    
    return NextResponse.json({ 
      verseId,
      upperVerse,
      signature,
      collaborationUrl: `/waka/${verseId}/complete` 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating upper verse:", error);
    return NextResponse.json(
      { error: "Failed to create upper verse" },
      { status: 400 }
    );
  }
}
