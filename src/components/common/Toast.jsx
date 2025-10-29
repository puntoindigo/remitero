"use client";

import { useEffect } from 'react';

export function Toast({ toast, onRemove }) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  const styles = {
    success: {
      bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      border: '#f59e0b',
      shadow: 'rgba(245, 158, 11, 0.3)',
      icon: '✓',
      iconColor: '#047857'
    },
    error: {
      bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      border: '#ef4444',
      shadow: 'rgba(239, 68, 68, 0.3)',
      icon: '✕',
      iconColor: '#dc2626'
    },
    info: {
      bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      border: '#3b82f6',
      shadow: 'rgba(59, 130, 246, 0.3)',
      icon: 'ℹ',
      iconColor: '#2563eb'
    },
    warning: {
      bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      border: '#f59e0b',
      shadow: 'rgba(245, 158, 11, 0.3)',
      icon: '⚠',
      iconColor: '#d97706'
    },
  };

  const style = styles[toast.type];

  return (
    <div
      style={{
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: '0 0 12px 12px',
        boxShadow: `0 10px 25px ${style.shadow}, 0 6px 10px rgba(0,0,0,0.1)`,
        padding: '16px 20px',
        minWidth: '320px',
        maxWidth: '450px',
        position: 'relative',
        animation: 'slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      {/* Tape effect en la parte superior */}
      <div
        style={{
          position: 'absolute',
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '20px',
          background: 'rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '2px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      />

      {/* Icon */}
      <span 
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: style.iconColor,
          lineHeight: '1',
          flexShrink: 0,
        }}
      >
        {style.icon}
      </span>

      {/* Message */}
      <div style={{ flex: 1, paddingTop: '2px' }}>
        <p style={{ 
          margin: 0, 
          color: '#1f2937',
          fontSize: '15px',
          fontWeight: '500',
          lineHeight: '1.5',
        }}>
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#6b7280',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: 'pointer',
          padding: '0',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(0,0,0,0.1)';
          e.target.style.color = '#374151';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'transparent';
          e.target.style.color = '#6b7280';
        }}
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          0% {
            transform: translateX(400px) rotate(5deg);
            opacity: 0;
          }
          60% {
            transform: translateX(-10px) rotate(-2deg);
            opacity: 1;
          }
          100% {
            transform: translateX(0) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

