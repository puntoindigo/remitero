import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: "Endpoint simple funcionando",
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: "POST endpoint simple funcionando",
    timestamp: new Date().toISOString()
  });
}
