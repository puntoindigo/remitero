import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withPrisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let session: any = null;
  
  try {
    console.log("PUT /api/products/[id] - Starting - VERSION 2.0.0");
    
    session = await getServerSession(authOptions);
    console.log("Session:", session?.user);
    
    if (!session?.user?.companyId) {
      console.log("No companyId in session");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const productId = params.id;
    console.log("Product ID:", productId);
    
    const body = await request.json();
    console.log("Request body:", body);

    // Simplificar validación - solo permitir stock por ahora
    const updateData: any = {};
    
    if (body.stock) {
      console.log(`Updating stock to: "${body.stock}"`);
      if (body.stock === 'IN_STOCK' || body.stock === 'OUT_OF_STOCK') {
        updateData.stock = body.stock;
      } else {
        throw new Error(`Valor inválido para stock: ${body.stock}`);
      }
    }

    console.log("Update data:", updateData);

    const product = await withPrisma(async (prisma) => {
      return await prisma.product.update({
        where: { 
          id: productId,
          companyId: session.user.companyId 
        },
        data: updateData,
        include: { category: true }
      });
    });

    console.log("Product updated successfully:", product);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error updating product:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ 
      error: "Error interno del servidor", 
      details: error.message,
      debug: {
        productId: params.id,
        sessionCompanyId: session?.user?.companyId,
        errorCode: error.code,
        errorName: error.name
      }
    }, { status: 500 });
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

    const productId = params.id;

    await withPrisma(async (prisma) => {
      return await prisma.product.delete({
        where: { 
          id: productId,
          companyId: session.user.companyId 
        }
      });
    });

    return NextResponse.json({ message: "Producto eliminado correctamente" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}