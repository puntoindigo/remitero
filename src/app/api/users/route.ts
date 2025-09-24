import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withPrisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const userSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  role: z.enum(["ADMIN", "USER", "SUPERADMIN"]),
  address: z.string().optional(),
  phone: z.string().optional(),
  companyId: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const users = await withPrisma(async (prisma) => {
      return await prisma.user.findMany({
        where: {
          companyId: session.user.role === "ADMIN" ? session.user.companyId : undefined,
        },
        include: {
          company: true
        },
        orderBy: { name: "asc" }
      });
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const user = await withPrisma(async (prisma) => {
      // Verificar que el email no esté en uso
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });

      if (existingUser) {
        throw new Error("El email ya está en uso");
      }

      // Hash de la contraseña si se proporciona
      let hashedPassword = "";
      if (validatedData.password) {
        hashedPassword = await bcrypt.hash(validatedData.password, 12);
      }

      // Determinar la empresa del usuario
      const companyId = session.user.role === "SUPERADMIN" 
        ? validatedData.companyId 
        : session.user.companyId;

      if (!companyId) {
        throw new Error("Empresa requerida");
      }

      return await prisma.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: validatedData.role,
          address: validatedData.address,
          phone: validatedData.phone,
          companyId: companyId
        },
        include: {
          company: true
        }
      });
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }

    if (error.message === "El email ya está en uso") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === "Empresa requerida") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
