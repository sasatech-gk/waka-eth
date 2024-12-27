import { NextRequest, NextResponse } from "next/server";
import { WakaSchema } from "../schema/waka-schema";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const payload = WakaSchema.parse(data);
    // TODO: Implement web3 signing logic here or store partial record

    return NextResponse.json({
      status: 200,
      message: "Waka created",
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
