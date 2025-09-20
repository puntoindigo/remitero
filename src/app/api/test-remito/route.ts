import { NextRequest, NextResponse } from "next/server";
import { remitoSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('=== TEST REMITO VALIDATION ===');
    console.log('Received data:', JSON.stringify(body, null, 2));
    
    // Test validation
    const validatedData = remitoSchema.parse(body);
    console.log('Validation successful:', JSON.stringify(validatedData, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: "Validation passed",
      data: validatedData 
    });
  } catch (error: any) {
    console.error('=== VALIDATION ERROR ===');
    console.error('Error details:', error);
    
    if (error.name === "ZodError") {
      console.error('Zod errors:', error.errors);
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.errors,
        receivedData: body
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Server error", 
      message: error.message 
    }, { status: 500 });
  }
}
