import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withPrisma } from "@/lib/prisma";
import { z } from "zod";

const companySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const company = await withPrisma(async (prisma) => {
      return await prisma.company.findUnique({
        where: { id: params.id }
      });
    });

    if (!company) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = companySchema.parse(body);

    const company = await withPrisma(async (prisma) => {
      return await prisma.company.update({
        where: { id: params.id },
        data: validatedData
      });
    });

    return NextResponse.json(company);
  } catch (error: any) {
    console.error("Error updating company:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
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
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await withPrisma(async (prisma) => {
      return await prisma.company.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({ message: "Empresa eliminada exitosamente" });
  } catch (error: any) {
    console.error("Error deleting company:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    if (error.code === "P2003") {
      return NextResponse.json({ error: "No se puede eliminar la empresa porque tiene datos relacionados" }, { status: 400 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
