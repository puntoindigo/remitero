import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      hasSession: !!session,
      session: session,
      user: session?.user,
      companyId: session?.user?.companyId,
      role: session?.user?.role,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      error: "Error getting session",
      message: error.message,
      hasSession: false,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
