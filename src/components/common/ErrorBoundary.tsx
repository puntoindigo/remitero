"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
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
      errorInfo: null
    });
  };

  handleClose = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
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
