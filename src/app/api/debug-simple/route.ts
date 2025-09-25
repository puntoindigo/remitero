import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      session: session,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      error: "Error",
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
