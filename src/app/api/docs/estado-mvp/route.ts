import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'docs', 'ESTADO_MVP_PRODUCCION.md');
    
    console.log('📖 [API Estado MVP] process.cwd():', process.cwd());
    console.log('📖 [API Estado MVP] Ruta calculada:', filePath);
    
    const content = await readFile(filePath, 'utf-8');
    
    console.log('✅ [API Estado MVP] Archivo leído exitosamente, tamaño:', content.length);
    
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('❌ [API Estado MVP] Error:', errorMessage);
    if (errorStack) {
      console.error('❌ [API Estado MVP] Stack:', errorStack);
    }
    return NextResponse.json(
      { 
        error: 'Error al leer el archivo',
        details: errorMessage,
        path: join(process.cwd(), 'docs', 'ESTADO_MVP_PRODUCCION.md'),
        cwd: process.cwd(),
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

