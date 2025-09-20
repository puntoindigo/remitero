import { NextRequest, NextResponse } from "next/server";
import { remitoSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST REMITO VALIDATION START ===');
    
    const body = await request.json();
    console.log('Received data type:', typeof body);
    console.log('Received data keys:', Object.keys(body || {}));
    
    // Test validation
    const validatedData = remitoSchema.parse(body);
    console.log('Validation successful');
    
    return NextResponse.json({ 
      success: true, 
      message: "Validation passed"
    });
  } catch (error: any) {
    console.error('=== VALIDATION ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === "ZodError") {
      console.error('Zod errors:', error.errors);
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Server error", 
      message: error.message
    }, { status: 500 });
  }
}
