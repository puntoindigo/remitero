import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log('TEST POST /api/test-products - Starting');
  
  try {
    const body = await request.json();
    console.log('TEST POST /api/test-products - Body received:', body);
    
    return NextResponse.json({ 
      success: true, 
      message: "Test endpoint working",
      receivedData: body
    });
  } catch (error: any) {
    console.error('TEST POST /api/test-products - Error:', error);
    return NextResponse.json({ 
      error: "Test error",
      message: error.message 
    }, { status: 500 });
  }
}
