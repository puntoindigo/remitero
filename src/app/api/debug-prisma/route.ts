import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withPrisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG PRISMA START ===");
    console.log("TEST COMMIT - Force deploy");
    
    // Verificar variables de entorno
    console.log("Environment variables:");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("VERCEL_ENV:", process.env.VERCEL_ENV);
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("DATABASE_URL length:", process.env.DATABASE_URL?.length || 0);
    
    // Verificar sesión
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    
    // Probar conexión básica con Prisma
    console.log("Testing Prisma connection...");
    
    const testResult = await withPrisma(async (prisma) => {
      console.log("Inside withPrisma callback");
      
      // Probar una consulta simple
      const userCount = await prisma.user.count();
      console.log("User count:", userCount);
      
      return {
        userCount,
        connected: true
      };
    });
    
    console.log("Prisma test result:", testResult);
    
    return NextResponse.json({
      success: true,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      },
      session: session ? {
        hasSession: true,
        userId: session.user?.id,
        userRole: session.user?.role,
        companyId: session.user?.companyId
      } : { hasSession: false },
      prisma: testResult
    });
    
  } catch (error: any) {
    console.log("=== ERROR IN DEBUG PRISMA ===");
    console.log("Error message:", error.message);
    console.log("Error code:", error.code);
    console.log("Error stack:", error.stack);
    console.log("=== END ERROR ===");
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack
    }, { status: 500 });
  }
}
