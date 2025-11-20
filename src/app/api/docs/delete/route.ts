import { unlink } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, isInDocs } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Nombre de archivo requerido' },
        { status: 400 }
      );
    }
    
    // No permitir eliminar COMMITS
    if (name === 'COMMITS') {
      return NextResponse.json(
        { error: 'No se puede eliminar el documento de commits' },
        { status: 403 }
      );
    }
    
    const rootDir = process.cwd();
    const filePath = isInDocs 
      ? join(rootDir, 'docs', name)
      : join(rootDir, name);
    
    try {
      await unlink(filePath);
      return NextResponse.json({ 
        success: true,
        message: 'Documento eliminado correctamente'
      });
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return NextResponse.json(
          { error: 'Archivo no encontrado' },
          { status: 404 }
        );
      }
      throw err;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al eliminar documento:', errorMessage);
    return NextResponse.json(
      { error: 'Error al eliminar documento', details: errorMessage },
      { status: 500 }
    );
  }
}

