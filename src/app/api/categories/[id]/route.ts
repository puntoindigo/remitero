import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withPrisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";

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
    const validatedData = categorySchema.parse(body);

    const category = await withPrisma(async (prisma) => {
      return await prisma.category.update({
        where: { 
          id: params.id,
          companyId: session.user.companyId 
        },
        data: validatedData,
        include: {
          _count: {
            select: { products: true }
          }
        }
      });
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error updating category:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
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
      // Verificar si hay productos asociados
      const productsCount = await prisma.product.count({
        where: { 
          categoryId: params.id,
          companyId: session.user.companyId 
        }
      });

      if (productsCount > 0) {
        throw new Error(`No se puede eliminar la categoría porque tiene ${productsCount} productos asociados`);
      }

      await prisma.category.delete({
        where: { 
          id: params.id,
          companyId: session.user.companyId 
        }
      });
    });
    
    return NextResponse.json({ message: "Categoría eliminada correctamente" });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    
    if (error.message && error.message.includes("No se puede eliminar la categoría porque tiene")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
