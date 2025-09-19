import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RemitoService } from "@/lib/services/remitoService";
import { remitoSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const remitos = await RemitoService.getRemitos(session.user.companyId);
    return NextResponse.json(remitos);
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
    const validatedData = remitoSchema.parse(body);

    const remito = await RemitoService.createRemito({
      ...validatedData,
      companyId: session.user.companyId,
      createdById: session.user.id
    });

    return NextResponse.json(remito, { status: 201 });
  } catch (error: any) {
    console.error("Error creating remito:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
