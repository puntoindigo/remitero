import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Almacenamiento simple en memoria (en producción usar base de datos)
// Por ahora usamos localStorage del cliente, pero esta API puede servir para sincronización
const tasksStorage = new Map<string, { resolved: boolean; resolvedAt?: string }>();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const taskId = request.nextUrl.searchParams.get("taskId");
    if (taskId) {
      const task = tasksStorage.get(taskId);
      return NextResponse.json({ resolved: task?.resolved || false, resolvedAt: task?.resolvedAt });
    }

    // Retornar todas las tareas del usuario
    const allTasks: Record<string, { resolved: boolean; resolvedAt?: string }> = {};
    tasksStorage.forEach((value, key) => {
      allTasks[key] = value;
    });

    return NextResponse.json(allTasks);
  } catch (error: any) {
    console.error("❌ [API Tasks] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { taskId, resolved } = await request.json();

    if (!taskId || typeof resolved !== "boolean") {
      return NextResponse.json({ error: "taskId y resolved son requeridos" }, { status: 400 });
    }

    tasksStorage.set(taskId, {
      resolved,
      resolvedAt: resolved ? new Date().toISOString() : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ [API Tasks] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

