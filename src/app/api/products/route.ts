import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  categoryId: z.string().optional(),
  stock: z.enum(["IN_STOCK", "OUT_OF_STOCK"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { companyId: session.user.companyId },
      include: { category: true },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        companyId: session.user.companyId
      },
      include: { category: true }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID de producto requerido" }, { status: 400 });
    }

    // Validar solo los campos que se están enviando
    const allowedFields = ['name', 'description', 'price', 'categoryId', 'stock'];
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    const product = await prisma.product.update({
      where: { 
        id: id,
        companyId: session.user.companyId 
      },
      data: filteredData,
      include: { category: true }
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error updating product:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
