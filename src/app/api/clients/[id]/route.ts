import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

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

    // Verificar que el cliente pertenece a la empresa
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      }
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const client = await prisma.client.update({
      where: { id: params.id },
      data: validatedData
    });

    return NextResponse.json(client);
  } catch (error: any) {
    console.error("Error updating client:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
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
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    // Verificar si tiene remitos asociados
    if (existingClient.remitos.length > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar el cliente porque tiene remitos asociados" 
      }, { status: 400 });
    }

    await prisma.client.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ message: "Cliente eliminado correctamente" });
  } catch (error: any) {
    console.error("Error deleting client:", error);
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
