import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG SUPABASE CONNECTION ===');
    
    // Test basic connection
    const { data, error } = await supabaseAdmin
      .from('remitos')
      .select('id, status')
      .limit(1);

    console.log('Supabase test result:', { data, error });

    if (error) {
      return NextResponse.json({ 
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Supabase connection working",
      data: data
    });

  } catch (error: any) {
    console.error('=== SUPABASE CONNECTION ERROR ===', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
