import { NextRequest, NextResponse } from "next/server";
import { withPrisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const users = await withPrisma(async (prisma) => {
      return await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyId: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error: any) {
    console.error("Error listing users:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: error.message 
    }, { status: 500 });
  }
}
