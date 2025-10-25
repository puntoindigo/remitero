#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuración
const BASE_URL = 'http://localhost:8000';
const TIMEOUT = 10000; // 10 segundos

// URLs a verificar
const URLs_TO_CHECK = [
  '/',
  '/auth/login',
  '/empresas',
  '/usuarios',
  '/categorias',
  '/clientes',
  '/productos',
  '/remitos',
  '/estados-remitos',
  '/dashboard'
];

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Función para hacer request HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const fullUrl = new URL(url, BASE_URL);
    const protocol = fullUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: fullUrl.hostname,
      port: fullUrl.port || (fullUrl.protocol === 'https:' ? 443 : 80),
      path: fullUrl.pathname + fullUrl.search,
      method: 'GET',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'URL-Verifier/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 1000), // Solo primeros 1000 caracteres
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (error) => {
      reject({
        url,
        error: error.message,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        url,
        error: 'Request timeout',
        success: false
      });
    });

    req.setTimeout(TIMEOUT);
    req.end();
  });
}

// Función para verificar si hay errores de JavaScript en el HTML
function checkForJSErrors(html) {
  const errors = [];
  
  // Buscar errores comunes de JavaScript
  const errorPatterns = [
    /ReferenceError: (\w+) is not defined/gi,
    /TypeError: Cannot read properties of undefined/gi,
    /SyntaxError:/gi,
    /Uncaught Error:/gi,
    /Cannot read property '(\w+)' of undefined/gi
  ];
  
  errorPatterns.forEach((pattern, index) => {
    const matches = html.match(pattern);
    if (matches) {
      errors.push({
        type: 'JavaScript Error',
        pattern: pattern.source,
        matches: matches
      });
    }
  });
  
  return errors;
}

// Función para verificar si hay errores de compilación
function checkForCompilationErrors(html) {
  const errors = [];
  
  // Buscar errores de compilación de Next.js
  const compilationPatterns = [
    /Failed to compile/gi,
    /Compilation error/gi,
    /Module not found/gi,
    /Cannot resolve module/gi,
    /Unexpected token/gi,
    /Expected/gi
  ];
  
  compilationPatterns.forEach((pattern) => {
    const matches = html.match(pattern);
    if (matches) {
      errors.push({
        type: 'Compilation Error',
        pattern: pattern.source,
        matches: matches
      });
    }
  });
  
  return errors;
}

// Función principal de verificación
async function verifyURLs() {
  console.log(`${colors.bold}${colors.blue}🔍 Verificador de URLs - Sistema de Gestión${colors.reset}\n`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Timeout: ${TIMEOUT}ms\n`);
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (const url of URLs_TO_CHECK) {
    const fullUrl = `${BASE_URL}${url}`;
    process.stdout.write(`Verificando ${fullUrl}... `);
    
    try {
      const result = await makeRequest(fullUrl);
      
      if (result.success) {
        // Verificar errores en el contenido
        const jsErrors = checkForJSErrors(result.data);
        const compilationErrors = checkForCompilationErrors(result.data);
        
        if (jsErrors.length > 0 || compilationErrors.length > 0) {
          console.log(`${colors.red}❌ ERRORES ENCONTRADOS${colors.reset}`);
          errorCount++;
          
          results.push({
            url: fullUrl,
            status: result.status,
            success: false,
            errors: [...jsErrors, ...compilationErrors]
          });
        } else {
          console.log(`${colors.green}✅ OK${colors.reset}`);
          successCount++;
          
          results.push({
            url: fullUrl,
            status: result.status,
            success: true,
            errors: []
          });
        }
      } else {
        console.log(`${colors.red}❌ HTTP ${result.status}${colors.reset}`);
        errorCount++;
        
        results.push({
          url: fullUrl,
          status: result.status,
          success: false,
          errors: [{ type: 'HTTP Error', message: `Status ${result.status}` }]
        });
      }
    } catch (error) {
      console.log(`${colors.red}❌ ERROR${colors.reset}`);
      errorCount++;
      
      results.push({
        url: fullUrl,
        status: 'ERROR',
        success: false,
        errors: [{ type: 'Network Error', message: error.error || error.message }]
      });
    }
    
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Resumen
  console.log(`\n${colors.bold}📊 RESUMEN:${colors.reset}`);
  console.log(`✅ Exitosos: ${colors.green}${successCount}${colors.reset}`);
  console.log(`❌ Con errores: ${colors.red}${errorCount}${colors.reset}`);
  console.log(`📈 Total: ${URLs_TO_CHECK.length}`);
  
  // Mostrar errores detallados
  if (errorCount > 0) {
    console.log(`\n${colors.bold}${colors.red}🚨 ERRORES DETALLADOS:${colors.reset}`);
    
    results
      .filter(result => !result.success)
      .forEach(result => {
        console.log(`\n${colors.red}❌ ${result.url}${colors.reset}`);
        console.log(`   Status: ${result.status}`);
        
        result.errors.forEach(error => {
          console.log(`   ${colors.yellow}⚠️  ${error.type}: ${error.message || error.pattern}${colors.reset}`);
          if (error.matches) {
            console.log(`      Matches: ${error.matches.join(', ')}`);
          }
        });
      });
  }
  
  // Exit code
  process.exit(errorCount > 0 ? 1 : 0);
}

// Ejecutar verificación
if (require.main === module) {
  verifyURLs().catch(error => {
    console.error(`${colors.red}❌ Error fatal: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { verifyURLs, makeRequest, checkForJSErrors, checkForCompilationErrors };
