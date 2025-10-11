"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Plus, Tag, Edit, Trash2 } from "lucide-react";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useEstadosRemitos, EstadoRemito, EstadoRemitoFormData } from "@/hooks/useEstadosRemitos";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDataWithCompany } from "@/hooks/useDataWithCompany";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";

function EstadosRemitosContent() {
  const { data: session } = useSession();
  const currentUser = useCurrentUser();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompany();

  // Verificar permisos - solo ADMIN y SUPERADMIN pueden ver esta página
  if (!currentUser || !['ADMIN', 'SUPERADMIN'].includes(currentUser.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Acceso Restringido
          </h2>
          <p className="text-red-600">
            Solo los administradores pueden gestionar estados de remitos.
          </p>
        </div>
      </div>
    );
  }

  // Hook para manejar estado del formulario modal
  const {
    editingItem: editingEstado,
    showForm,
    isSubmitting,
    handleNew: handleNewEstado,
    handleEdit: handleEditEstado,
    handleCloseForm,
    setIsSubmitting,
    showDeleteConfirm,
    handleDeleteRequest,
    handleCancelDelete,
    setEditingItem: setEditingEstado
  } = useCRUDPage<EstadoRemito>();

  const { modalState, showSuccess, showError, closeModal } = useMessageModal();

  // Hook para empresas
  const { empresas } = useEmpresas();

  // Hook para manejar estados de remitos
  const {
    estados,
    isLoading: estadosLoading,
    error: estadosError,
    createEstado,
    updateEstado,
    deleteEstado
  } = useEstadosRemitos(companyId || undefined);

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig
  } = useCRUDTable({
    data: estados || [],
    loading: estadosLoading,
    searchFields: ['name', 'description'],
    itemsPerPage: 10,
    onEdit: handleEditEstado,
    onDelete: handleDeleteRequest,
    onNew: handleNewEstado,
    getItemId: (estado) => estado.id,
    emptyMessage: "No hay estados de remitos",
    emptySubMessage: "Comienza creando un nuevo estado.",
    emptyIcon: <Tag className="empty-icon" />,
    newButtonText: "Nuevo Estado",
    searchPlaceholder: "Buscar estados..."
  });

  const onSubmit = async (data: EstadoRemitoFormData) => {
    setIsSubmitting(true);
    try {
      if (editingEstado) {
        await updateEstado(editingEstado.id, data);
        showSuccess("Estado actualizado correctamente");
      } else {
        await createEstado(data);
        showSuccess("Estado creado correctamente");
      }
      handleCloseForm();
    } catch (error: any) {
      showError("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEstado) return;
    
    try {
      await deleteEstado(editingEstado.id);
      handleCancelDelete();
      showSuccess("Estado eliminado correctamente");
    } catch (error: any) {
      handleCancelDelete();
      showError("Error", error instanceof Error ? error.message : "Error al eliminar estado");
    }
  };

  // Lógica simplificada: mostrar contenido si hay companyId o si es SUPERADMIN sin impersonar
  const needsCompanySelection = !companyId && currentUser?.role === "SUPERADMIN";

  // Definir columnas para el DataTable
  const columns: DataTableColumn<EstadoRemito>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (estado) => (
        <div className="estado-info">
          <div className="estado-name">{estado.name}</div>
          {estado.description && (
            <div className="estado-description">{estado.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'color',
      label: 'Color',
      render: (estado) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: estado.color }}
          ></div>
          <span className="text-sm text-gray-600">{estado.color}</span>
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (estado) => (
        <span className={`badge ${estado.is_active ? 'badge-success' : 'badge-inactive'}`}>
          {estado.is_active ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  if (estadosLoading) {
    return (
      <div className="estados-remitos-container">
        <div className="estados-remitos-header">
          <div className="loading">Cargando estados...</div>
        </div>
      </div>
    );
  }

  if (estadosError) {
    return (
      <div className="estados-remitos-container">
        <div className="estados-remitos-header">
          <div className="error-message">
            Error al cargar los estados: {estadosError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="estados-remitos-container">
      <div className="estados-remitos-header">
        <div>
          <h1>Gestión de Estados de Remitos</h1>
          <p>Administra los estados disponibles para los remitos</p>
        </div>
      </div>

      {/* Formulario Modal */}
      {showForm && (
        <div className="estados-modal-overlay">
          <div className="estados-modal">
            <h2>{editingEstado ? 'Editar Estado' : 'Nuevo Estado'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data: EstadoRemitoFormData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                color: formData.get('color') as string,
                is_active: formData.get('isActive') === 'on'
              };
              onSubmit(data);
            }}>
              <div className="estados-form-row">
                <div className="estados-form-group">
                  <label htmlFor="name">Nombre *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={editingEstado?.name || ''}
                    required
                    placeholder="Ej: Enviado, Entregado, Cancelado"
                  />
                </div>
                <div className="estados-form-group">
                  <label htmlFor="color">Color *</label>
                  <input
                    type="color"
                    id="color"
                    name="color"
                    defaultValue={editingEstado?.color || '#3b82f6'}
                    required
                  />
                </div>
              </div>
              <div className="estados-form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={editingEstado?.description || ''}
                  placeholder="Descripción opcional del estado"
                  rows={3}
                />
              </div>
              <div className="estados-form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editingEstado?.is_active !== false}
                  />
                  Estado activo
                </label>
              </div>
              <div className="estados-modal-actions">
                <button type="button" onClick={handleCloseForm}>
                  Cancelar
                </button>
                <button type="submit" className="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : (editingEstado ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filtros adicionales */}
      <div className="category-filter-wrapper" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        {shouldShowCompanySelector && empresas.length > 0 && (
          <FilterableSelect
            options={empresas}
            value={selectedCompanyId}
            onChange={setSelectedCompanyId}
            placeholder="Seleccionar empresa"
            searchFields={["name"]}
            className="w-64"
          />
        )}
      </div>

      {/* DataTable con paginación */}
      {!needsCompanySelection && (
        <>
          <DataTable
            {...tableConfig}
            columns={columns}
            showSearch={true}
            showNewButton={false} // Ya tenemos el botón arriba
          />
          <Pagination {...paginationConfig} />
        </>
      )}

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleDelete}
        title="Eliminar Estado"
        message={`¿Estás seguro de que deseas eliminar el estado "${editingEstado?.name}"?`}
      />

      {/* Modal de mensajes */}
      <MessageModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        details={modalState.details}
      />
    </div>
  );
}

export default function EstadosRemitosPage() {
  return (
    <Suspense fallback={
      <main className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    }>
      <EstadosRemitosContent />
    </Suspense>
  );
}
