import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { remitoSchema } from "@/lib/validations";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const remitos = await prisma.remito.findMany({
      where: { companyId: session.user.companyId },
      include: {
        client: { select: { id: true, name: true } },
        items: true,
        createdBy: { select: { name: true } },
        history: {
          orderBy: { at: "desc" },
          take: 1,
          include: { byUser: { select: { name: true } } }
        }
      },
      orderBy: { number: "desc" }
    });

    // Map history to get the latest statusAt and calculate total
    const formattedRemitos = remitos.map(remito => ({
      ...remito,
      total: remito.items.reduce((sum, item) => sum + Number(item.lineTotal), 0),
      statusAt: remito.history[0]?.at.toISOString() || remito.createdAt.toISOString(),
      status: remito.history[0]?.status || remito.status, // Ensure status is from history if available
    }));

    return NextResponse.json(formattedRemitos);
  } catch (error) {
    console.error("Error fetching remitos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId || !session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    console.log('=== POST /api/remitos - Received data ===');
    console.log('Raw body:', JSON.stringify(body, null, 2));
    console.log('Body type:', typeof body);
    console.log('Body keys:', Object.keys(body));
    
    // Validate the data
    let validatedData;
    try {
      validatedData = remitoSchema.parse(body);
      console.log('✅ Validation successful:', JSON.stringify(validatedData, null, 2));
    } catch (validationError: any) {
      console.error('❌ Validation error details:');
      console.error('Error name:', validationError.name);
      console.error('Error message:', validationError.message);
      console.error('Validation errors:', validationError.errors);
      return NextResponse.json({ 
        error: "Datos inválidos", 
        details: validationError.errors 
      }, { status: 400 });
    }

    const newRemito = await prisma.$transaction(async (tx) => {
      // Get the last remito number for the company and increment
      const lastRemito = await tx.remito.findFirst({
        where: { companyId: session.user.companyId },
        orderBy: { number: "desc" },
        select: { number: true },
      });
      const nextRemitoNumber = (lastRemito?.number || 0) + 1;

      const createdRemito = await tx.remito.create({
        data: {
          number: nextRemitoNumber,
          clientId: validatedData.clientId,
          companyId: session.user.companyId,
          createdById: session.user.id,
          notes: validatedData.notes,
          status: "PENDIENTE", // Initial status
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

      // Create initial status history
      await tx.statusHistory.create({
        data: {
          remitoId: createdRemito.id,
          status: "PENDIENTE",
          at: new Date(),
          byUserId: session.user.id,
        },
      });

      return createdRemito;
    });

    return NextResponse.json(newRemito, { status: 201 });
  } catch (error: any) {
    console.error("Error creating remito:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

