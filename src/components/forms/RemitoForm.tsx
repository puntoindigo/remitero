"use client";

import React from "react";
import { X } from "lucide-react";

interface RemitoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  editingRemito?: any;
  clients?: any[];
  estados?: any[];
}

export function RemitoForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingRemito,
  clients = [],
  estados = []
}: RemitoFormProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      number: formData.get('number') as string,
      clientId: formData.get('clientId') as string,
      status: formData.get('status') as string,
      notes: formData.get('notes') as string,
      total: parseFloat(formData.get('total') as string) || 0
    };
    onSubmit(data);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{editingRemito ? 'Editar Remito' : 'Nuevo Remito'}</h2>
          <button onClick={onClose} className="close-button">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="number">Número *</label>
            <input
              type="text"
              id="number"
              name="number"
              defaultValue={editingRemito?.number || ''}
              required
              placeholder="Ej: REM-001"
            />
          </div>

          <div className="form-group">
            <label htmlFor="clientId">Cliente *</label>
            <select
              id="clientId"
              name="clientId"
              defaultValue={editingRemito?.client?.id || ''}
              required
            >
              <option value="">Seleccionar cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Estado *</label>
            <select
              id="status"
              name="status"
              defaultValue={editingRemito?.status?.id || ''}
              required
            >
              <option value="">Seleccionar estado</option>
              {estados.map(estado => (
                <option key={estado.id} value={estado.id}>
                  {estado.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="total">Total</label>
            <input
              type="number"
              id="total"
              name="total"
              step="0.01"
              defaultValue={editingRemito?.total || 0}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notas</label>
            <textarea
              id="notes"
              name="notes"
              defaultValue={editingRemito?.notes || ''}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : (editingRemito ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
