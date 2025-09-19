import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RemitoService } from "@/lib/services/remitoService";
import { statusChangeSchema } from "@/lib/validations";

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

    const remito = await RemitoService.updateRemitoStatus(
      params.id,
      validatedData.status,
      session.user.companyId,
      session.user.id
    );

    return NextResponse.json(remito);
  } catch (error: any) {
    console.error("Error updating remito status:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
