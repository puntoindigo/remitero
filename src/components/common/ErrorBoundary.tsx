"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, X, RefreshCw, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      copied: false
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
      copied: false
    });
  };

  handleClose = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false
    });
  };

  handleCopyError = async () => {
    const { error, errorInfo } = this.state;
    
    const errorText = `
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
              
              <div className="error-boundary-actions">
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
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
