'use client';

import { useEffect } from 'react';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
}

export function MessageModal({ isOpen, onClose, type, title, message, details }: MessageModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          icon: '❌',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="modal-overlay">
      <div className="modal max-w-md">
        <div className="modal-content">
          <div className={`flex items-center mb-4 p-4 rounded-lg ${styles.bgColor} ${styles.borderColor} border`}>
            <span className={`text-2xl mr-3 ${styles.iconColor}`}>
              {styles.icon}
            </span>
            <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
              {title}
            </h3>
          </div>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            {message}
          </p>
          
          {details && (
            <div className="mb-4 p-3 bg-gray-100 rounded text-sm text-gray-600 font-mono">
              <strong>Detalles:</strong>
              <pre className="whitespace-pre-wrap mt-1">{details}</pre>
            </div>
          )}
          
          <div className="modal-actions">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className={`${styles.buttonColor} text-white px-6 py-2 rounded-md font-medium transition-colors`}
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
