import { NextRequest, NextResponse } from "next/server";
import { WakaSchema } from "../schema/waka-schema";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement database fetch logic
    const waka = {
      upperVerse: "上の句",
      lowerVerse: "下の句",
      signature: "0x...",
    };

    const payload = WakaSchema.parse(waka);

    return NextResponse.json({
      status: 200,
      message: "Waka fetched",
      payload,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
