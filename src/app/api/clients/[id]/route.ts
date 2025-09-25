import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withPrisma } from "@/lib/prisma";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = clientSchema.parse(body);

    const client = await withPrisma(async (prisma) => {
      // Verificar que el cliente pertenece a la empresa
      const existingClient = await prisma.client.findFirst({
        where: {
          id: params.id,
          companyId: session.user.companyId
        }
      });

      if (!existingClient) {
        throw new Error("Cliente no encontrado");
      }

      return await prisma.client.update({
        where: { id: params.id },
        data: validatedData
      });
    });

    return NextResponse.json(client);
  } catch (error: any) {
    console.error("Error updating client:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }

    if (error.message === "Cliente no encontrado") {
      return NextResponse.json({ error: error.message }, { status: 404 });
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
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await withPrisma(async (prisma) => {
      // Verificar que el cliente pertenece a la empresa
      const existingClient = await prisma.client.findFirst({
        where: {
          id: params.id,
          companyId: session.user.companyId
        },
        include: {
          remitos: {
            select: { id: true }
          }
        }
      });

      if (!existingClient) {
        throw new Error("Cliente no encontrado");
      }

      // Verificar si tiene remitos asociados
      if (existingClient.remitos.length > 0) {
        throw new Error("No se puede eliminar el cliente porque tiene remitos asociados");
      }

      await prisma.client.delete({
        where: { id: params.id }
      });
    });
    
    return NextResponse.json({ message: "Cliente eliminado correctamente" });
  } catch (error: any) {
    console.error("Error deleting client:", error);
    
    if (error.message === "Cliente no encontrado") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message === "No se puede eliminar el cliente porque tiene remitos asociados") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
