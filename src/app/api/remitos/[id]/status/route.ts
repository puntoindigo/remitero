import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { statusChangeSchema } from "@/lib/validations";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId || !session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = statusChangeSchema.parse(body);

    const updatedRemito = await prisma.$transaction(async (tx) => {
      const remito = await tx.remito.update({
        where: { id: params.id, companyId: session.user.companyId },
        data: {
          status: validatedData.status,
        },
      });

      await tx.statusHistory.create({
        data: {
          remitoId: remito.id,
          status: validatedData.status,
          at: new Date(),
          byUserId: session.user.id,
        },
      });
      return remito;
    });

    return NextResponse.json(updatedRemito);
  } catch (error: any) {
    console.error("Error updating remito status:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
