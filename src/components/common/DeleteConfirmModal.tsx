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
    <>
      <div className="modal-overlay"></div>
      <div className="modal confirm-modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onCancel} className="modal-close" type="button">
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
          {itemName && (
            <p className="font-medium mt-2">"{itemName}"</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="modal-footer">
          <button
            onClick={onCancel}
            className="btn-secondary"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="btn-danger"
            type="button"
          >
            Eliminar
          </button>
        </div>
      </div>
    </>
  );
}

