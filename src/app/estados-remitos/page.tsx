"use client";

import React, { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Plus, Tag } from "lucide-react";
import ActionButtons from "@/components/common/ActionButtons";
import SearchAndPagination from "@/components/common/SearchAndPagination";
import { useSearchAndPagination } from "@/hooks/useSearchAndPagination";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useCRUDPage } from "@/hooks/useCRUDPage";

// Tipos para estados de remitos
interface EstadoRemito {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
}

// Estados predefinidos
const ESTADOS_PREDEFINIDOS: EstadoRemito[] = [
  {
    id: 'pendiente',
    name: 'Pendiente',
    description: 'Remito creado, esperando procesamiento',
    color: '#f59e0b',
    icon: '⏰',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'preparado',
    name: 'Preparado',
    description: 'Remito preparado para entrega',
    color: '#10b981',
    icon: '✅',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'entregado',
    name: 'Entregado',
    description: 'Remito entregado al cliente',
    color: '#3b82f6',
    icon: '🚚',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cancelado',
    name: 'Cancelado',
    description: 'Remito cancelado',
    color: '#ef4444',
    icon: '❌',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

function EstadosRemitosContent() {
  const { data: session } = useSession();

  // Verificar permisos - solo SUPERADMIN puede acceder
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return (
      <main className="main-content">
        <div className="form-section">
          <h2>Acceso Denegado</h2>
          <p>Solo los superadministradores pueden acceder a esta sección.</p>
        </div>
      </main>
    );
  }

  // Hook para manejar estado del formulario modal
  const {
    editingItem: editingEstado,
    showForm,
    isSubmitting,
    handleNew,
    handleEdit,
    handleCloseForm,
    setIsSubmitting,
    showDeleteConfirm,
    handleDeleteRequest,
    handleCancelDelete
  } = useCRUDPage<EstadoRemito>();

  const [estados, setEstados] = useState<EstadoRemito[]>(ESTADOS_PREDEFINIDOS);
  const { showSuccess, showError, hideModal, isModalOpen, modalContent } = useMessageModal();

  // Hook para búsqueda y paginación
  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredItems: filteredEstados,
    totalPages
  } = useSearchAndPagination(estados, ['name', 'description']);

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      if (editingEstado) {
        // Actualizar estado existente
        setEstados(prev => prev.map(estado => 
          estado.id === editingEstado.id 
            ? { ...estado, ...data, updatedAt: new Date().toISOString() }
            : estado
        ));
        showSuccess("Éxito", "Estado actualizado correctamente");
      } else {
        // Crear nuevo estado
        const newEstado: EstadoRemito = {
          id: data.name.toLowerCase().replace(/\s+/g, '-'),
          ...data,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        setEstados(prev => [...prev, newEstado]);
        showSuccess("Éxito", "Estado creado correctamente");
      }
      
      handleCloseForm();
    } catch (error) {
      console.error("Error saving estado:", error);
      showError("Error", error instanceof Error ? error.message : "Error al guardar estado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      setEstados(prev => prev.filter(estado => estado.id !== showDeleteConfirm.id));
      handleCancelDelete();
      showSuccess("Éxito", "Estado eliminado correctamente");
    } catch (error) {
      console.error("Error deleting estado:", error);
      handleCancelDelete();
      showError("Error", error instanceof Error ? error.message : "Error al eliminar estado");
    }
  };

  return (
    <main className="main-content">
      <section className="form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Gestión de Estados de Remitos</h2>
          <button
            onClick={handleNew}
            className="btn primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus className="h-4 w-4" />
            Nuevo Estado
          </button>
        </div>

        <SearchAndPagination
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredEstados.length}
          itemsPerPage={itemsPerPage}
          placeholder="Buscar estados..."
        >
          <h3>Lista de Estados</h3>
        </SearchAndPagination>
        
        {!Array.isArray(filteredEstados) || filteredEstados.length === 0 ? (
          <p>No hay estados registrados.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Descripción</th>
                  <th>Color</th>
                  <th>Activo</th>
                  <th>Registrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEstados.map((estado) => (
                  <tr key={estado.id}>
                    <td>
                      <div className="flex items-center">
                        <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>{estado.icon}</span>
                        <span style={{ 
                          color: estado.color, 
                          fontWeight: 'bold' 
                        }}>
                          {estado.name}
                        </span>
                      </div>
                    </td>
                    <td>{estado.description || '-'}</td>
                    <td>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem' 
                      }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: estado.color,
                          borderRadius: '50%',
                          border: '1px solid #ccc'
                        }}></div>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>
                          {estado.color}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${estado.isActive ? 'active' : 'inactive'}`}>
                        {estado.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{new Date(estado.createdAt).toLocaleString('es-AR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</td>
                    <td>
                      <ActionButtons
                        onEdit={() => handleEdit(estado)}
                        onDelete={() => handleDeleteRequest(estado.id, estado.name)}
                        editTitle="Editar estado"
                        deleteTitle="Eliminar estado"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de formulario */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal form-modal">
            <div className="modal-header">
              <h3>{editingEstado ? "Editar Estado" : "Nuevo Estado"}</h3>
              <button onClick={handleCloseForm} className="modal-close">×</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                color: formData.get('color') as string,
                icon: formData.get('icon') as string,
                isActive: formData.get('isActive') === 'on'
              };
              handleFormSubmit(data);
            }}>
              <div className="form-group">
                <label>Nombre del estado *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingEstado?.name || ''}
                  required
                  placeholder="Ej: En Proceso"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="description"
                  defaultValue={editingEstado?.description || ''}
                  placeholder="Descripción del estado..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Color *</label>
                  <input
                    type="color"
                    name="color"
                    defaultValue={editingEstado?.color || '#3b82f6'}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Icono</label>
                  <input
                    type="text"
                    name="icon"
                    defaultValue={editingEstado?.icon || '📋'}
                    placeholder="Emoji o símbolo"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editingEstado?.isActive !== false}
                  />
                  Estado activo
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="btn secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : editingEstado ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MessageModal
        isOpen={isModalOpen}
        onClose={hideModal}
        title={modalContent?.title || ""}
        message={modalContent?.message || ""}
      />

      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleDelete}
        itemName={showDeleteConfirm?.name || ""}
        itemType="estado"
      />
    </main>
  );
}

export default function EstadosRemitosPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EstadosRemitosContent />
    </Suspense>
  );
}
