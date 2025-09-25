import { NextRequest, NextResponse } from "next/server";
import { withPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }

    const user = await withPrisma(async (prisma) => {
      return await prisma.user.findUnique({
        where: { email },
        include: { company: true }
      });
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company?.name
      }
    });
  } catch (error: any) {
    console.error("Error in test-login:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: error.message 
    }, { status: 500 });
  }
}
