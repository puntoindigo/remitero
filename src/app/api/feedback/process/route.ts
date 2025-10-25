import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

interface FeedbackData {
  testName: string;
  errorType: string;
  errorDescription: string;
  errorSteps: string;
  errorConsole: string;
  browserInfo: string;
}

interface CodeAnalysis {
  file: string;
  line?: number;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  solution: string;
  codeSnippet?: string;
}

export async function POST(request: NextRequest) {
  try {
    const feedbackData: FeedbackData = await request.json();
    
    // Analizar el código basado en el tipo de error
    const analysis = await analyzeCode(feedbackData);
    
    // Generar solución específica
    const solution = await generateSolution(feedbackData, analysis);
    
    return NextResponse.json({
      success: true,
      analysis,
      solution,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error procesando el feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function analyzeCode(feedback: FeedbackData): Promise<CodeAnalysis[]> {
  const analysis: CodeAnalysis[] = [];
  
  try {
    // Obtener archivos relevantes basados en el tipo de error
    const relevantFiles = await getRelevantFiles(feedback.errorType);
    
    for (const file of relevantFiles) {
      const fileAnalysis = await analyzeFile(file, feedback);
      analysis.push(...fileAnalysis);
    }
    
    // Ordenar por severidad
    analysis.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
    
  } catch (error) {
    console.error('Error analyzing code:', error);
    analysis.push({
      file: 'unknown',
      issue: 'Error analizando el código',
      severity: 'medium',
      solution: 'Revisar manualmente el código para identificar el problema'
    });
  }
  
  return analysis;
}

async function getRelevantFiles(errorType: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    // Obtener archivos de la aplicación
    const appDir = join(process.cwd(), 'src');
    
    // Archivos comunes a revisar
    const commonFiles = [
      'app/layout.tsx',
      'app/page.tsx',
      'middleware.ts',
      'next.config.js',
      'next.config.ts'
    ];
    
    // Archivos específicos según el tipo de error
    switch (errorType) {
      case 'javascript':
        files.push(...await getJsFiles(appDir));
        break;
      case 'network':
        files.push(...await getApiFiles(appDir));
        break;
      case 'ui':
        files.push(...await getComponentFiles(appDir));
        break;
      case 'functionality':
        files.push(...await getHookFiles(appDir));
        break;
      case 'performance':
        files.push(...await getConfigFiles(appDir));
        break;
      default:
        files.push(...commonFiles);
    }
    
  } catch (error) {
    console.error('Error getting relevant files:', error);
  }
  
  return files;
}

async function getJsFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await getJsFiles(fullPath));
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
        files.push(fullPath.replace(process.cwd(), ''));
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }
  return files;
}

async function getApiFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const apiDir = join(dir, 'app', 'api');
    const entries = await readdir(apiDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const routeFile = join(apiDir, entry.name, 'route.ts');
        files.push(routeFile.replace(process.cwd(), ''));
      }
    }
  } catch (error) {
    console.error('Error reading API directory:', error);
  }
  return files;
}

async function getComponentFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const componentsDir = join(dir, 'components');
    const entries = await readdir(componentsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        files.push(...await getJsFiles(join(componentsDir, entry.name)));
      } else if (entry.name.endsWith('.tsx')) {
        files.push(join(componentsDir, entry.name).replace(process.cwd(), ''));
      }
    }
  } catch (error) {
    console.error('Error reading components directory:', error);
  }
  return files;
}

async function getHookFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const hooksDir = join(dir, 'hooks');
    const entries = await readdir(hooksDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        files.push(join(hooksDir, entry.name).replace(process.cwd(), ''));
      }
    }
  } catch (error) {
    console.error('Error reading hooks directory:', error);
  }
  return files;
}

async function getConfigFiles(dir: string): Promise<string[]> {
  return [
    'next.config.js',
    'next.config.ts',
    'package.json',
    'tsconfig.json',
    'tailwind.config.js'
  ];
}

async function analyzeFile(filePath: string, feedback: FeedbackData): Promise<CodeAnalysis[]> {
  const analysis: CodeAnalysis[] = [];
  
  try {
    const fullPath = join(process.cwd(), filePath);
    const content = await readFile(fullPath, 'utf-8');
    const lines = content.split('\n');
    
    // Buscar patrones problemáticos
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Patrones de error comunes
      if (line.includes('console.error') || line.includes('throw new Error')) {
        analysis.push({
          file: filePath,
          line: lineNumber,
          issue: 'Error handling encontrado',
          severity: 'medium',
          solution: 'Revisar el manejo de errores y asegurar que se muestren mensajes informativos al usuario',
          codeSnippet: line.trim()
        });
      }
      
      if (line.includes('undefined') && line.includes('.')) {
        analysis.push({
          file: filePath,
          line: lineNumber,
          issue: 'Posible acceso a propiedad de undefined',
          severity: 'high',
          solution: 'Agregar verificación de null/undefined antes de acceder a propiedades',
          codeSnippet: line.trim()
        });
      }
      
      if (line.includes('useEffect') && !line.includes('[]') && !line.includes('[dependencies]')) {
        analysis.push({
          file: filePath,
          line: lineNumber,
          issue: 'useEffect sin dependencias puede causar loops infinitos',
          severity: 'high',
          solution: 'Agregar array de dependencias apropiado al useEffect',
          codeSnippet: line.trim()
        });
      }
      
      if (line.includes('async') && line.includes('await') && !line.includes('try')) {
        analysis.push({
          file: filePath,
          line: lineNumber,
          issue: 'Función async sin manejo de errores',
          severity: 'medium',
          solution: 'Envolver en try-catch para manejar errores de async/await',
          codeSnippet: line.trim()
        });
      }
      
      if (line.includes('fetch') && !line.includes('catch')) {
        analysis.push({
          file: filePath,
          line: lineNumber,
          issue: 'Fetch sin manejo de errores',
          severity: 'high',
          solution: 'Agregar .catch() para manejar errores de red',
          codeSnippet: line.trim()
        });
      }
    }
    
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error);
    analysis.push({
      file: filePath,
      issue: 'Error leyendo el archivo',
      severity: 'low',
      solution: 'Verificar que el archivo existe y es accesible'
    });
  }
  
  return analysis;
}

async function generateSolution(feedback: FeedbackData, analysis: CodeAnalysis[]): Promise<string> {
  let solution = '';
  
  // Generar solución basada en el análisis
  if (analysis.length > 0) {
    const criticalIssues = analysis.filter(a => a.severity === 'critical');
    const highIssues = analysis.filter(a => a.severity === 'high');
    
    if (criticalIssues.length > 0) {
      solution += '<h5>🚨 Problemas Críticos Encontrados:</h5><ul>';
      criticalIssues.forEach(issue => {
        solution += `<li><strong>${issue.file}:${issue.line}</strong> - ${issue.issue}<br>`;
        solution += `<em>Solución:</em> ${issue.solution}`;
        if (issue.codeSnippet) {
          solution += `<br><code>${issue.codeSnippet}</code>`;
        }
        solution += '</li>';
      });
      solution += '</ul>';
    }
    
    if (highIssues.length > 0) {
      solution += '<h5>⚠️ Problemas de Alta Prioridad:</h5><ul>';
      highIssues.forEach(issue => {
        solution += `<li><strong>${issue.file}:${issue.line}</strong> - ${issue.issue}<br>`;
        solution += `<em>Solución:</em> ${issue.solution}`;
        if (issue.codeSnippet) {
          solution += `<br><code>${issue.codeSnippet}</code>`;
        }
        solution += '</li>';
      });
      solution += '</ul>';
    }
  }
  
  // Agregar solución específica según el tipo de error
  switch (feedback.errorType) {
    case 'javascript':
      solution += '<h5>🔧 Solución para Error de JavaScript:</h5>';
      solution += '<ol><li>Revisar la consola del navegador (F12) para ver errores específicos</li>';
      solution += '<li>Verificar que todas las variables estén definidas</li>';
      solution += '<li>Comprobar la sintaxis del código</li>';
      solution += '<li>Agregar manejo de errores con try-catch</li></ol>';
      break;
      
    case 'network':
      solution += '<h5>🌐 Solución para Error de Red:</h5>';
      solution += '<ol><li>Verificar la conexión a internet</li>';
      solution += '<li>Revisar que las URLs de la API sean correctas</li>';
      solution += '<li>Comprobar que el servidor esté funcionando</li>';
      solution += '<li>Agregar manejo de errores de red en las llamadas fetch</li></ol>';
      break;
      
    case 'ui':
      solution += '<h5>🎨 Solución para Error de Interfaz:</h5>';
      solution += '<ol><li>Verificar que los componentes estén importados correctamente</li>';
      solution += '<li>Revisar que los estilos CSS estén aplicados</li>';
      solution += '<li>Comprobar que los props se estén pasando correctamente</li>';
      solution += '<li>Verificar que no haya errores de renderizado</li></ol>';
      break;
      
    case 'functionality':
      solution += '<h5>⚙️ Solución para Funcionalidad:</h5>';
      solution += '<ol><li>Verificar que los hooks estén funcionando correctamente</li>';
      solution += '<li>Revisar que los estados se estén actualizando</li>';
      solution += '<li>Comprobar que las funciones se estén ejecutando</li>';
      solution += '<li>Agregar logs para debuggear el flujo</li></ol>';
      break;
      
    case 'performance':
      solution += '<h5>⚡ Solución para Rendimiento:</h5>';
      solution += '<ol><li>Optimizar re-renders con useMemo y useCallback</li>';
      solution += '<li>Implementar lazy loading para componentes pesados</li>';
      solution += '<li>Revisar que no haya loops infinitos en useEffect</li>';
      solution += '<li>Optimizar las llamadas a la API</li></ol>';
      break;
  }
  
  // Agregar información del error reportado
  solution += `<h5>📝 Información del Error Reportado:</h5>`;
  solution += `<p><strong>Descripción:</strong> ${feedback.errorDescription}</p>`;
  solution += `<p><strong>Pasos para reproducir:</strong> ${feedback.errorSteps}</p>`;
  if (feedback.errorConsole) {
    solution += `<p><strong>Error en consola:</strong> <code>${feedback.errorConsole}</code></p>`;
  }
  
  return solution;
}
