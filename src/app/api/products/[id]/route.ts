import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PUT /api/products/[id] - Starting");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user);
    
    if (!session?.user?.companyId) {
      console.log("No companyId in session");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const productId = params.id;
    console.log("Product ID:", productId);
    
    const body = await request.json();
    console.log("Request body:", body);

    // Validar solo los campos que se están enviando
    const allowedFields = ['name', 'description', 'price', 'categoryId', 'stock'];
    const filteredData = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {});

    console.log("Filtered data:", filteredData);

    const product = await prisma.product.update({
      where: { 
        id: productId,
        companyId: session.user.companyId 
      },
      data: filteredData,
      include: { category: true }
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
      details: error.message 
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

    await prisma.product.delete({
      where: { 
        id: productId,
        companyId: session.user.companyId 
      }
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