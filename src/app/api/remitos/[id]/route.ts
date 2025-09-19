import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const remito = await prisma.remito.findUnique({
      where: { id: params.id, companyId: session.user.companyId },
      include: {
        client: { select: { id: true, name: true } },
        items: true,
        createdBy: { select: { name: true } },
        history: {
          orderBy: { at: "asc" },
          include: { byUser: { select: { name: true } } }
        }
      }
    });
    
    if (!remito) {
      return NextResponse.json({ error: "Remito no encontrado" }, { status: 404 });
    }

    return NextResponse.json(remito);
  } catch (error) {
    console.error("Error fetching remito:", error);
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

    await prisma.remito.delete({
      where: { id: params.id, companyId: session.user.companyId },
    });
    
    return NextResponse.json({ message: "Remito eliminado correctamente" });
  } catch (error: any) {
    console.error("Error deleting remito:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
