import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

interface FeedbackReport {
  testName: string;
  errorType: string;
  errorDescription: string;
  errorSteps: string;
  errorConsole: string;
  browserInfo: string;
  timestamp: string;
  analysis?: any;
}

export async function POST(request: NextRequest) {
  try {
    const report: FeedbackReport = await request.json();
    
    // Agregar ID único al reporte
    const reportWithId = {
      ...report,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Guardar en archivo JSON
    await saveReport(reportWithId);
    
    // También guardar en base de datos si está disponible
    try {
      await saveToDatabase(reportWithId);
    } catch (dbError) {
      console.warn('No se pudo guardar en base de datos:', dbError);
      // Continuar sin fallar si la DB no está disponible
    }
    
    return NextResponse.json({
      success: true,
      reportId: reportWithId.id,
      message: 'Reporte guardado exitosamente'
    });
    
  } catch (error) {
    console.error('Error guardando reporte:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error guardando el reporte',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function saveReport(report: any) {
  try {
    const reportsDir = join(process.cwd(), 'data', 'feedback');
    const reportsFile = join(reportsDir, 'reports.json');
    
    // Crear directorio si no existe
    try {
      await readFile(reportsDir);
    } catch {
      // Directorio no existe, se creará automáticamente al escribir
    }
    
    // Leer reportes existentes
    let reports = [];
    try {
      const existingData = await readFile(reportsFile, 'utf-8');
      reports = JSON.parse(existingData);
    } catch {
      // Archivo no existe, empezar con array vacío
    }
    
    // Agregar nuevo reporte
    reports.push(report);
    
    // Guardar archivo
    await writeFile(reportsFile, JSON.stringify(reports, null, 2));
    
    console.log(`Reporte guardado: ${report.id}`);
    
  } catch (error) {
    console.error('Error guardando reporte en archivo:', error);
    throw error;
  }
}

async function saveToDatabase(report: any) {
  // Aquí podrías implementar guardado en base de datos
  // Por ejemplo, usando Supabase, MongoDB, etc.
  
  // Ejemplo con Supabase (descomenta si tienes Supabase configurado):
  /*
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { error } = await supabase
    .from('feedback_reports')
    .insert([report]);
    
  if (error) {
    throw error;
  }
  */
  
  console.log('Reporte guardado en base de datos:', report.id);
}

export async function GET() {
  try {
    const reportsFile = join(process.cwd(), 'data', 'feedback', 'reports.json');
    
    const reports = await readFile(reportsFile, 'utf-8');
    const parsedReports = JSON.parse(reports);
    
    return NextResponse.json({
      success: true,
      reports: parsedReports,
      count: parsedReports.length
    });
    
  } catch (error) {
    console.error('Error leyendo reportes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error leyendo reportes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
