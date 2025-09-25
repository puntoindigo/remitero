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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await withPrisma(async (prisma) => {
      return await prisma.user.findUnique({
        where: { id: params.id },
        include: {
          company: true
        }
      });
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Los ADMIN solo pueden ver usuarios de su empresa
    if (session.user.role === "ADMIN" && user.companyId !== session.user.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const user = await withPrisma(async (prisma) => {
      // Verificar que el usuario existe
      const existingUser = await prisma.user.findUnique({
        where: { id: params.id }
      });

      if (!existingUser) {
        throw new Error("Usuario no encontrado");
      }

      // Los ADMIN solo pueden editar usuarios de su empresa
      if (session.user.role === "ADMIN" && existingUser.companyId !== session.user.companyId) {
        throw new Error("No autorizado");
      }

      // Verificar que el email no esté en uso por otro usuario
      if (validatedData.email) {
        const emailUser = await prisma.user.findFirst({
          where: {
            email: validatedData.email,
            id: { not: params.id }
          }
        });

        if (emailUser) {
          throw new Error("El email ya está en uso");
        }
      }

      // Hash de la contraseña si se proporciona
      let updateDataWithPassword = { ...validatedData };
      if (validatedData.password) {
        updateDataWithPassword.password = await bcrypt.hash(validatedData.password, 12);
      } else {
        delete updateDataWithPassword.password;
      }

      // Determinar la empresa del usuario
      const companyId = session.user.role === "SUPERADMIN" 
        ? validatedData.companyId 
        : session.user.companyId;

      if (!companyId) {
        throw new Error("Empresa requerida");
      }

      updateDataWithPassword.companyId = companyId;

      return await prisma.user.update({
        where: { id: params.id },
        data: updateDataWithPassword,
        include: {
          company: true
        }
      });
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error updating user:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }

    if (error.message === "El email ya está en uso") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === "Empresa requerida") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message === "Usuario no encontrado") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message === "No autorizado") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Los SUPERADMIN no pueden eliminarse a sí mismos
    if (session.user.role === "SUPERADMIN" && session.user.id === params.id) {
      return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 });
    }

    await withPrisma(async (prisma) => {
      // Verificar que el usuario existe
      const existingUser = await prisma.user.findUnique({
        where: { id: params.id }
      });

      if (!existingUser) {
        throw new Error("Usuario no encontrado");
      }

      // Los ADMIN solo pueden eliminar usuarios de su empresa
      if (session.user.role === "ADMIN" && existingUser.companyId !== session.user.companyId) {
        throw new Error("No autorizado");
      }

      return await prisma.user.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({ message: "Usuario eliminado exitosamente" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    
    if (error.message === "Usuario no encontrado") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message === "No autorizado") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (error.code === "P2003") {
      return NextResponse.json({ error: "No se puede eliminar el usuario porque tiene datos relacionados" }, { status: 400 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
