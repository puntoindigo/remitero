import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RemitoService } from "@/lib/services/remitoService";
import { statusChangeSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const remito = await RemitoService.getRemitoById(params.id, session.user.companyId);
    
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

    await RemitoService.deleteRemito(params.id, session.user.companyId);
    
    return NextResponse.json({ message: "Remito eliminado correctamente" });
  } catch (error: any) {
    console.error("Error deleting remito:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
