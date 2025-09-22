import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({ 
      success: true,
      receivedData: body,
      dataType: typeof body,
      dataKeys: Object.keys(body),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Error parsing request",
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
