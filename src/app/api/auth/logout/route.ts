import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logUserActivity } from "@/lib/user-activity-logger";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      // Registrar logout antes de que la sesión se destruya
      await logUserActivity(session.user.id, 'LOGOUT', 'Cerró sesión');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in logout route:', error);
    return NextResponse.json({ success: true }); // Siempre retornar éxito para no bloquear el logout
  }
}

