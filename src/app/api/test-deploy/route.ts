import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "Deploy test successful",
    timestamp: new Date().toISOString(),
    version: "v2.0.0"
  });
}
