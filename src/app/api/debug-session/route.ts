import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    logger.info("Debug session endpoint called", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      companyId: session?.user?.companyId,
      sessionKeys: session ? Object.keys(session) : []
    });
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      session: session,
      user: session?.user,
      companyId: session?.user?.companyId,
      role: session?.user?.role,
      timestamp: new Date().toISOString(),
      headers: {
        cookie: request.headers.get('cookie'),
        authorization: request.headers.get('authorization'),
        userAgent: request.headers.get('user-agent')
      }
    });
  } catch (error: any) {
    logger.error("Error in debug session endpoint", {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({
      error: "Error getting session",
      message: error.message,
      hasSession: false,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
