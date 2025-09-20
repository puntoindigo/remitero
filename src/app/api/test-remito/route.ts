import { NextRequest, NextResponse } from "next/server";
import { remitoSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Test validation
    const validatedData = remitoSchema.parse(body);
    
    return NextResponse.json({ 
      success: true, 
      message: "Validation passed"
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Server error", 
      message: error.message || "Unknown error"
    }, { status: 500 });
  }
}
