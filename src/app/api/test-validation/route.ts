import { NextRequest, NextResponse } from "next/server";
import { remitoSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('=== TEST VALIDATION ENDPOINT ===');
    console.log('Received body:', JSON.stringify(body, null, 2));
    console.log('Body type:', typeof body);
    console.log('Body keys:', Object.keys(body));
    
    // Test each field individually
    if (body.clientId) {
      console.log('✅ clientId:', body.clientId, 'type:', typeof body.clientId);
    } else {
      console.log('❌ clientId missing');
    }
    
    if (body.notes !== undefined) {
      console.log('✅ notes:', body.notes, 'type:', typeof body.notes);
    } else {
      console.log('❌ notes missing');
    }
    
    if (body.items && Array.isArray(body.items)) {
      console.log('✅ items array length:', body.items.length);
      body.items.forEach((item: any, index: number) => {
        console.log(`Item ${index}:`, {
          productId: item.productId,
          productName: item.productName,
          productDesc: item.productDesc,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal
        });
      });
    } else {
      console.log('❌ items missing or not array');
    }
    
    // Try validation
    try {
      const validatedData = remitoSchema.parse(body);
      console.log('✅ Validation successful!');
      return NextResponse.json({ 
        success: true,
        message: "Validation passed",
        data: validatedData
      });
    } catch (validationError: any) {
      console.log('❌ Validation failed:');
      console.log('Error name:', validationError.name);
      console.log('Error message:', validationError.message);
      console.log('Validation errors:', validationError.errors);
      
      return NextResponse.json({ 
        success: false,
        error: "Validation failed",
        details: validationError.errors,
        receivedData: body
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      error: "Server error",
      message: error.message
    }, { status: 500 });
  }
}
