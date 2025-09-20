import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { remitoSchema } from "@/lib/validations";

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
    console.log('Received remito update data:', JSON.stringify(body, null, 2));
    
    const remitoId = params.id;
    
    if (!remitoId) {
      return NextResponse.json({ error: "ID de remito requerido" }, { status: 400 });
    }
    
    try {
      const validatedData = remitoSchema.parse(body);
      console.log('Validation successful for update:', JSON.stringify(validatedData, null, 2));
    } catch (validationError: any) {
      console.error('Validation error:', validationError.errors);
      return NextResponse.json({ 
        error: "Datos inválidos", 
        details: validationError.errors 
      }, { status: 400 });
    }
    
    const validatedData = remitoSchema.parse(body);

    const updatedRemito = await prisma.$transaction(async (tx) => {
      // Verify the remito exists and belongs to the company
      const existingRemito = await tx.remito.findFirst({
        where: { 
          id: remitoId,
          companyId: session.user.companyId 
        },
        include: { items: true }
      });

      if (!existingRemito) {
        throw new Error("Remito no encontrado");
      }

      // Delete existing items
      await tx.remitoItem.deleteMany({
        where: { remitoId: remitoId }
      });

      // Update the remito
      const updated = await tx.remito.update({
        where: { id: remitoId },
        data: {
          clientId: validatedData.clientId,
          notes: validatedData.notes,
          items: {
            create: validatedData.items.map(item => ({
              productId: item.productId,
              productName: item.productName,
              productDesc: item.productDesc,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
        },
        include: {
          client: { select: { id: true, name: true } },
          items: true,
          createdBy: { select: { name: true } },
        },
      });

      return updated;
    });

    return NextResponse.json(updatedRemito);
  } catch (error: any) {
    console.error("Error updating remito:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}