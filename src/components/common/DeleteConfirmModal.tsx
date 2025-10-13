"use client";

import React from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Confirmar eliminación",
  message = "¿Estás seguro de que deseas eliminar este elemento?",
  itemName
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        className="confirm-modal"
        style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          maxWidth: '400px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 10001
        }}
      >
        <div className="modal-header" style={{ padding: '20px 20px 0 20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>{title}</h3>
          <button 
            onClick={onCancel} 
            className="modal-close" 
            type="button"
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>
        <div className="modal-body" style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 10px 0', color: '#374151' }}>{message}</p>
          {itemName && (
            <p style={{ margin: '10px 0', fontWeight: '500', color: '#111827' }}>"{itemName}"</p>
          )}
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="modal-footer" style={{ padding: '0 20px 20px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            className="btn-secondary"
            type="button"
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="btn-danger"
            type="button"
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: '#dc2626',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

