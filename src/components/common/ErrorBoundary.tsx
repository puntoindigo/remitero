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
      sendError: null
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
      sendError: null
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

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      sending: false,
      sent: false,
      sendError: null
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
      sendError: null
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

      if (response.ok) {
        this.setState({ sent: true, sending: false });
        
        // Reset sent state after 3 seconds
        setTimeout(() => {
          this.setState({ sent: false });
        }, 3000);
      } else {
        throw new Error('Error al enviar el reporte');
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
                <p className="error-boundary-main-message">
                  Se ha producido un error inesperado en la aplicación.
                </p>
                
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
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
