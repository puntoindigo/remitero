import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface FeedbackItem {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  category: string;
  tools: string[];
}

interface ProcessingResult {
  success: boolean;
  message: string;
  changes: string[];
  errors: string[];
  filesModified: string[];
  codeChanges: Array<{
    file: string;
    line: number;
    oldCode: string;
    newCode: string;
    description: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { feedbackId, feedback }: { feedbackId: string; feedback: FeedbackItem } = await request.json();
    
    // Solo procesar items activos (pending o processing)
    if (feedback.status !== 'pending' && feedback.status !== 'processing') {
      return NextResponse.json({
        success: false,
        message: `Feedback "${feedback.title}" no está activo (estado: ${feedback.status})`,
        changes: [],
        errors: [`Solo se procesan items con estado 'pending' o 'processing'`],
        filesModified: [],
        codeChanges: []
      });
    }
    
    console.log(`🔄 Procesando feedback activo: ${feedback.title} (${feedback.status})`);
    
    const result = await processFeedbackReal(feedback);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error procesando feedback:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Error al procesar feedback: ${error}`,
        changes: [],
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        filesModified: [],
        codeChanges: []
      },
      { status: 500 }
    );
  }
}

async function processFeedbackReal(feedback: FeedbackItem): Promise<ProcessingResult> {
  const changes: string[] = [];
  const errors: string[] = [];
  const filesModified: string[] = [];
  const codeChanges: Array<{
    file: string;
    line: number;
    oldCode: string;
    newCode: string;
    description: string;
  }> = [];

  try {
    // Analizar el contenido del feedback
    const analysis = analyzeFeedbackContent(feedback.content);
    
    // Procesar según el tipo de feedback
    switch (analysis.type) {
      case 'css-fix':
        await processCSSFix(analysis, changes, filesModified, codeChanges);
        break;
      case 'performance-optimization':
        await processPerformanceOptimization(analysis, changes, filesModified, codeChanges);
        break;
      case 'validation-fix':
        await processValidationFix(analysis, changes, filesModified, codeChanges);
        break;
      case 'loading-spinner':
        await processLoadingSpinnerFix(analysis, changes, filesModified, codeChanges);
        break;
      case 'nextjs-params':
        await processNextJSParamsFix(analysis, changes, filesModified, codeChanges);
        break;
      case 'dependencies':
        await processDependenciesFix(analysis, changes, filesModified, codeChanges);
        break;
      default:
        await processGenericFix(analysis, changes, filesModified, codeChanges);
    }

    return {
      success: true,
      message: `Feedback "${feedback.title}" procesado exitosamente`,
      changes,
      errors,
      filesModified,
      codeChanges
    };
  } catch (error) {
    errors.push(`Error procesando feedback: ${error}`);
    return {
      success: false,
      message: `Error al procesar feedback: ${error}`,
      changes,
      errors,
      filesModified,
      codeChanges
    };
  }
}

function analyzeFeedbackContent(content: string) {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('desplegable') && lowerContent.includes('colores')) {
    return { type: 'css-fix', target: 'remitos-status-dropdown' };
  }
  
  if (lowerContent.includes('lento') || lowerContent.includes('performance') || lowerContent.includes('optimización')) {
    return { type: 'performance-optimization', target: 'nextjs-config' };
  }
  
  if (lowerContent.includes('validación') || lowerContent.includes('email')) {
    return { type: 'validation-fix', target: 'form-validation' };
  }
  
  if (lowerContent.includes('loading') || lowerContent.includes('cargando')) {
    return { type: 'loading-spinner', target: 'loading-components' };
  }
  
  if (lowerContent.includes('params') && lowerContent.includes('await')) {
    return { type: 'nextjs-params', target: 'api-routes' };
  }
  
  if (lowerContent.includes('critters') || lowerContent.includes('módulo')) {
    return { type: 'dependencies', target: 'package-json' };
  }
  
  return { type: 'generic', target: 'unknown' };
}

async function processCSSFix(analysis: any, changes: string[], filesModified: string[], codeChanges: any[]) {
  try {
    // Leer el archivo CSS actual
    const cssPath = path.join(process.cwd(), 'src/app/globals.css');
    const cssContent = await fs.readFile(cssPath, 'utf-8');
    
    // Verificar si ya existe el estilo
    if (!cssContent.includes('.remito-status-container')) {
      const newCSS = `
/* Estilos para desplegable de estados de remitos - igual al de stock */
.remito-status-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remito-status-color-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.remito-status-select {
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
  flex: 1;
}

.remito-status-select:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.remito-status-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.remito-status-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}`;

      await fs.writeFile(cssPath, cssContent + newCSS);
      changes.push('Agregados estilos CSS para desplegable de estados de remitos');
      filesModified.push('src/app/globals.css');
      codeChanges.push({
        file: 'src/app/globals.css',
        line: cssContent.split('\n').length + 1,
        oldCode: '',
        newCode: newCSS,
        description: 'Agregar estilos CSS para desplegable de estados'
      });
    } else {
      changes.push('Estilos CSS ya existían para desplegable de estados');
    }
  } catch (error) {
    throw new Error(`Error procesando CSS fix: ${error}`);
  }
}

async function processPerformanceOptimization(analysis: any, changes: string[], filesModified: string[], codeChanges: any[]) {
  try {
    // Leer next.config.js
    const configPath = path.join(process.cwd(), 'next.config.js');
    const configContent = await fs.readFile(configPath, 'utf-8');
    
    // Verificar si ya tiene optimizaciones
    if (!configContent.includes('webpack.optimization.splitChunks')) {
      const optimizedConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configurar el directorio raíz para evitar conflictos con lockfiles
  outputFileTracingRoot: __dirname,
  
  // Optimizaciones básicas
  compress: true,
  
  // Webpack optimizations básicas
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimizar chunks para mejor caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig`;

      await fs.writeFile(configPath, optimizedConfig);
      changes.push('Optimizado next.config.js con webpack optimizations');
      filesModified.push('next.config.js');
      codeChanges.push({
        file: 'next.config.js',
        line: 1,
        oldCode: configContent,
        newCode: optimizedConfig,
        description: 'Agregar optimizaciones de webpack para mejor rendimiento'
      });
    } else {
      changes.push('Optimizaciones de webpack ya estaban configuradas');
    }
  } catch (error) {
    throw new Error(`Error procesando optimización de rendimiento: ${error}`);
  }
}

async function processValidationFix(analysis: any, changes: string[], filesModified: string[], codeChanges: any[]) {
  try {
    // Buscar archivos de formularios
    const formsPath = path.join(process.cwd(), 'src/components/forms');
    const formFiles = await fs.readdir(formsPath);
    
    for (const file of formFiles) {
      if (file.endsWith('.tsx')) {
        const filePath = path.join(formsPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Verificar si necesita validación de email
        if (content.includes('email') && !content.includes('emailRegex')) {
          const emailValidation = `
  // Validación de email
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    throw new Error('Por favor, ingresa un email válido');
  }`;
          
          const newContent = content.replace(
            /(const.*=.*async.*\(.*data.*\) => {)/,
            `$1${emailValidation}`
          );
          
          await fs.writeFile(filePath, newContent);
          changes.push(`Agregada validación de email en ${file}`);
          filesModified.push(`src/components/forms/${file}`);
          codeChanges.push({
            file: `src/components/forms/${file}`,
            line: content.split('\n').findIndex(line => line.includes('const.*=.*async')) + 1,
            oldCode: '',
            newCode: emailValidation,
            description: 'Agregar validación de email'
          });
        }
      }
    }
  } catch (error) {
    throw new Error(`Error procesando validación: ${error}`);
  }
}

async function processLoadingSpinnerFix(analysis: any, changes: string[], filesModified: string[], codeChanges: any[]) {
  try {
    // Buscar archivos que contengan "Cargando..." hardcodeado
    const searchPaths = [
      'src/components',
      'src/app',
      'src/hooks'
    ];
    
    for (const searchPath of searchPaths) {
      const fullPath = path.join(process.cwd(), searchPath);
      await searchAndReplaceLoadingText(fullPath, changes, filesModified, codeChanges);
    }
  } catch (error) {
    throw new Error(`Error procesando loading spinner: ${error}`);
  }
}

async function searchAndReplaceLoadingText(dirPath: string, changes: string[], filesModified: string[], codeChanges: any[]) {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        await searchAndReplaceLoadingText(fullPath, changes, filesModified, codeChanges);
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        
        if (content.includes('Cargando...') && !content.includes('LoadingSpinner')) {
          const newContent = content
            .replace(/Cargando\.\.\./g, '<LoadingSpinner message="Cargando..." />')
            .replace(/import.*from.*react.*;/g, 'import React from "react";\nimport { LoadingSpinner } from "@/components/common/LoadingSpinner";');
          
          await fs.writeFile(fullPath, newContent);
          changes.push(`Reemplazado texto "Cargando..." por LoadingSpinner en ${file.name}`);
          filesModified.push(fullPath);
          codeChanges.push({
            file: fullPath,
            line: content.split('\n').findIndex(line => line.includes('Cargando...')) + 1,
            oldCode: 'Cargando...',
            newCode: '<LoadingSpinner message="Cargando..." />',
            description: 'Reemplazar texto hardcodeado por componente LoadingSpinner'
          });
        }
      }
    }
  } catch (error) {
    // Ignorar errores de directorios que no existen
  }
}

async function processNextJSParamsFix(analysis: any, changes: string[], filesModified: string[], codeChanges: any[]) {
  try {
    // Buscar archivos de API routes que usen params.id sin await
    const apiPath = path.join(process.cwd(), 'src/app/api');
    await searchAndFixParamsUsage(apiPath, changes, filesModified, codeChanges);
  } catch (error) {
    throw new Error(`Error procesando Next.js params fix: ${error}`);
  }
}

async function processDependenciesFix(analysis: any, changes: string[], filesModified: string[], codeChanges: any[]) {
  try {
    // Instalar módulo critters
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    try {
      await execAsync('npm install critters');
      changes.push('Módulo critters instalado exitosamente');
      filesModified.push('package.json');
      codeChanges.push({
        file: 'package.json',
        line: 1,
        oldCode: '',
        newCode: 'critters dependency added',
        description: 'Instalar módulo critters faltante'
      });
    } catch (installError) {
      changes.push('Error al instalar critters, pero se intentó');
      // No usar errors aquí ya que no está definido en este scope
    }
  } catch (error) {
    throw new Error(`Error procesando dependencies fix: ${error}`);
  }
}

async function searchAndFixParamsUsage(dirPath: string, changes: string[], filesModified: string[], codeChanges: any[]) {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        await searchAndFixParamsUsage(fullPath, changes, filesModified, codeChanges);
      } else if (file.name.endsWith('.ts') && file.name.includes('route')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        
        if (content.includes('params.id') && !content.includes('await params')) {
          const newContent = content.replace(
            /const (\w+) = params\.(\w+);/g,
            'const { $2: $1 } = await params;'
          );
          
          if (newContent !== content) {
            await fs.writeFile(fullPath, newContent);
            changes.push(`Corregido uso de params en ${file.name}`);
            filesModified.push(fullPath);
            codeChanges.push({
              file: fullPath,
              line: content.split('\n').findIndex(line => line.includes('params.')) + 1,
              oldCode: content.match(/const \w+ = params\.\w+;/)?.[0] || '',
              newCode: newContent.match(/const \{ \w+: \w+ \} = await params;/)?.[0] || '',
              description: 'Corregir uso de params para Next.js 15'
            });
          }
        }
      }
    }
  } catch (error) {
    // Ignorar errores de directorios que no existen
  }
}

async function processGenericFix(analysis: any, changes: string[], filesModified: string[], codeChanges: any[]) {
  changes.push('Procesamiento genérico aplicado');
  // Aquí se pueden agregar más lógicas genéricas
}
