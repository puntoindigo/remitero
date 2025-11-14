"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, X, RefreshCw, Copy, Check, Send } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  sending: boolean;
  sent: boolean;
  sendError: string | null;
  sendSuccess: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      sending: false,
      sent: false,
      sendError: null,
      sendSuccess: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      copied: false,
      sending: false,
      sent: false,
      sendError: null,
      sendSuccess: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log del error para debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  isChunkLoadError = (): boolean => {
    const { error } = this.state;
    if (!error) return false;
    
    const errorMessage = error.message || '';
    const errorName = error.name || '';
    
    // Detectar errores de carga de chunks
    return (
      errorName === 'ChunkLoadError' ||
      errorMessage.includes('Loading chunk') ||
      errorMessage.includes('Failed to fetch dynamically imported module') ||
      errorMessage.includes('timeout') && errorMessage.includes('chunk')
    );
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      sending: false,
      sent: false,
      sendError: null,
      sendSuccess: null
    });
  };

  handleClose = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      sending: false,
      sent: false,
      sendError: null,
      sendSuccess: null
    });
  };

  getErrorText = () => {
    const { error, errorInfo } = this.state;
    
    return `
ERROR REPORT
============

Message: ${error?.message || 'Unknown error'}

Stack Trace:
${error?.stack || 'No stack trace available'}

Component Stack:
${errorInfo?.componentStack || 'No component stack available'}

Timestamp: ${new Date().toISOString()}
URL: ${typeof window !== 'undefined' ? window.location.href : 'Unknown'}
    `.trim();
  };

  handleCopyError = async () => {
    const errorText = this.getErrorText();

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy error to clipboard:', err);
      // Fallback for older browsers
      if (typeof document !== 'undefined') {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = errorText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          this.setState({ copied: true });
          setTimeout(() => {
            this.setState({ copied: false });
          }, 2000);
        } catch (fallbackErr) {
          console.error('Fallback copy also failed:', fallbackErr);
        }
      }
    }
  };

  handleSendError = async () => {
    const { error, errorInfo } = this.state;
    
    this.setState({ sending: true });

    try {
      let browserInfo = 'Unknown';
      if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
        try {
          browserInfo = `${navigator.userAgent || 'Unknown'} - ${window.innerWidth || 0}x${window.innerHeight || 0}`;
        } catch (e) {
          browserInfo = 'Unknown (error getting info)';
        }
      }

      const reportData = {
        testName: 'Error de Aplicación',
        errorType: 'Application Error',
        errorDescription: error?.message || 'Unknown error',
        errorSteps: `Error ocurrido en: ${typeof window !== 'undefined' ? window.location.href : 'Unknown'}`,
        errorConsole: `
Stack Trace:
${error?.stack || 'No stack trace available'}

Component Stack:
${errorInfo?.componentStack || 'No component stack available'}
        `.trim(),
        browserInfo,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/feedback/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });

      const responseData = await response.json();
      
      if (response.ok && responseData.success) {
        this.setState({ sent: true, sending: false });
        
        // Mostrar mensaje de éxito más visible
        this.setState({ 
          sendError: null,
          sendSuccess: '✅ Error enviado correctamente. Gracias por reportarlo.' 
        });
        
        // Reset estados after 5 seconds
        setTimeout(() => {
          this.setState({ sent: false, sendSuccess: null });
        }, 5000);
      } else {
        throw new Error(responseData.message || 'Error al enviar el reporte');
      }
    } catch (err) {
      console.error('Failed to send error report:', err);
      this.setState({ sending: false });
      // Usar un mensaje visual en lugar de alert para mejor compatibilidad móvil
      if (typeof window !== 'undefined') {
        console.error('No se pudo enviar el error. Por favor, usa el botón "Copiar Error" para compartirlo manualmente.');
      }
      // Mostrar mensaje en el estado para que el usuario lo vea
      this.setState({ 
        sendError: 'No se pudo enviar el error. Por favor, usa el botón "Copiar Error".' 
      });
      setTimeout(() => {
        this.setState({ sendError: null });
      }, 5000);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-overlay">
          <div className="error-boundary-modal">
            <div className="error-boundary-header">
              <div className="error-boundary-title">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <h2>Error de la Aplicación</h2>
              </div>
              <button 
                onClick={this.handleClose}
                className="error-boundary-close"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="error-boundary-content">
              <div className="error-boundary-message">
                {this.isChunkLoadError() ? (
                  <>
                    <p className="error-boundary-main-message" style={{ 
                      fontSize: '16px', 
                      fontWeight: '600',
                      marginBottom: '1rem',
                      color: '#dc2626'
                    }}>
                      ⚠️ Error de Carga de Recursos
                    </p>
                    <p style={{ 
                      marginBottom: '1rem',
                      lineHeight: '1.6',
                      color: '#374151'
                    }}>
                      Parece que hay un problema con la carga de recursos de la aplicación. 
                      Esto suele ocurrir después de una actualización o por problemas de conexión.
                    </p>
                    <p style={{ 
                      marginBottom: '1.5rem',
                      lineHeight: '1.6',
                      color: '#6b7280',
                      fontSize: '14px'
                    }}>
                      <strong>Solución recomendada:</strong> Recarga la página para obtener la versión más reciente de la aplicación.
                    </p>
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fbbf24',
                      borderRadius: '0.375rem',
                      marginBottom: '1rem'
                    }}>
                      <strong style={{ color: '#92400e' }}>💡 Tip:</strong>
                      <span style={{ color: '#78350f', marginLeft: '0.5rem' }}>
                        Si el problema persiste, intenta limpiar la caché del navegador (Ctrl+Shift+Delete o Cmd+Shift+Delete)
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="error-boundary-main-message">
                    Se ha producido un error inesperado en la aplicación.
                  </p>
                )}
                
                {this.state.error && (
                  <div className="error-boundary-details">
                    <h3>Detalles del Error:</h3>
                    <div className="error-boundary-error-box">
                      <strong>Mensaje:</strong> {this.state.error.message}
                    </div>
                    
                    {this.state.error.stack && (
                      <div className="error-boundary-stack">
                        <strong>Stack Trace:</strong>
                        <pre className="error-boundary-stack-pre">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.errorInfo && (
                      <div className="error-boundary-component-stack">
                        <strong>Component Stack:</strong>
                        <pre className="error-boundary-stack-pre">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {this.state.sendSuccess && (
              <div className="error-boundary-success-message" style={{
                padding: '12px 24px',
                backgroundColor: '#f0fdf4',
                borderTop: '1px solid #86efac',
                color: '#16a34a',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {this.state.sendSuccess}
              </div>
            )}
            {this.state.sendError && (
              <div className="error-boundary-error-message" style={{
                padding: '12px 24px',
                backgroundColor: '#fef2f2',
                borderTop: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '14px'
              }}>
                {this.state.sendError}
              </div>
            )}
            
            <div className="error-boundary-actions">
              {this.isChunkLoadError() ? (
                <>
                  <button 
                    onClick={this.handleReload}
                    className="error-boundary-retry-btn"
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontWeight: '600',
                      flex: '1'
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Recargar Página
                  </button>
                  <button 
                    onClick={this.handleCopyError}
                    className="error-boundary-copy-btn"
                  >
                    {this.state.copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar Error
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={this.handleSendError}
                    className="error-boundary-send-btn"
                    disabled={this.state.sending || this.state.sent}
                  >
                    {this.state.sent ? (
                      <>
                        <Check className="h-4 w-4" />
                        ¡Enviado!
                      </>
                    ) : this.state.sending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Enviar Error
                      </>
                    )}
                  </button>
                  <button 
                    onClick={this.handleCopyError}
                    className="error-boundary-copy-btn"
                  >
                    {this.state.copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar Error
                      </>
                    )}
                  </button>
                  <button 
                    onClick={this.handleRetry}
                    className="error-boundary-retry-btn"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                  </button>
                  <button 
                    onClick={this.handleClose}
                    className="error-boundary-close-btn"
                  >
                    Cerrar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
