"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Tag, Edit, Trash2 } from "lucide-react";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useEstadosRemitos, EstadoRemitoFormData } from "@/hooks/useEstadosRemitos";
import { useEstadosRemitosQuery, estadoKeys, type EstadoRemito as EstadoRemitoQ } from "@/hooks/queries/useEstadosRemitosQuery";
import { useQueryClient } from "@tanstack/react-query";
import { EstadoRemitoForm } from "@/components/forms/EstadoRemitoForm";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { useDataWithCompanySimple } from "@/hooks/useDataWithCompanySimple";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useShortcuts } from "@/hooks/useShortcuts";
import { ShortcutText } from "@/components/common/ShortcutText";
import { SearchInput } from "@/components/common/SearchInput";

function EstadosRemitosContent() {
  const currentUser = useCurrentUserSimple();

  // Prevenir errores de client-side exception
  if (!currentUser) {
    return (
      <main className="main-content">
        <div className="form-section">
          <LoadingSpinner message="Cargando usuario..." />
        </div>
      </main>
    );
  }
  
  // Verificar permisos - solo ADMIN y SUPERADMIN pueden acceder
  if (currentUser?.role === 'USER') {
    return (
      <main className="main-content">
        <div className="form-section">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
          </div>
        </div>
      </main>
    );
  }
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompanySimple();

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
  } = useCRUDPage<EstadoRemitoQ>();

  const { modalState, showSuccess, showError, closeModal } = useMessageModal();

  // Hook para empresas
  const { empresas } = useEmpresas();

  // Hook para manejar estados de remitos
  const queryClient = useQueryClient();
  // Listado cacheado y deduplicado
  const { data: estados = [], isLoading: estadosLoading, error: estadosError } = useEstadosRemitosQuery(companyId || undefined);
  // Mutaciones existentes del hook legacy (solo para crear/actualizar/borrar)
  const { createEstado, updateEstado, deleteEstado } = useEstadosRemitos(companyId || undefined);

  // Configurar shortcuts de teclado
  useShortcuts([
    {
      key: 'n',
      action: handleNewEstado,
      description: 'Nuevo Estado'
    }
  ], !!companyId && !showForm);

  // Listener para FAB mobile
  useEffect(() => {
    const handleFABClick = (event: any) => {
      if (event.detail?.action === 'newEstado') {
        handleNewEstado();
      }
    };

    window.addEventListener('fabClick', handleFABClick);
    return () => window.removeEventListener('fabClick', handleFABClick);
  }, [handleNewEstado]);

  // Función de eliminación con useCallback para evitar problemas de hoisting
  const handleDeleteEstado = useCallback((estado: EstadoRemitoQ) => {
    handleDeleteRequest(estado?.id, estado?.name);
  }, [handleDeleteRequest]);

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
    onDelete: handleDeleteEstado,
    onNew: handleNewEstado,
    getItemId: (estado) => estado?.id,
    emptyMessage: "No hay estados de remitos",
    emptySubMessage: "Comienza creando un nuevo estado.",
    emptyIcon: <Tag className="empty-icon" />,
    newButtonText: "Nuevo Estado",
    searchPlaceholder: "Buscar estados..."
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingEstado) {
        await updateEstado(editingEstado?.id, data);
        showSuccess("Estado actualizado correctamente");
      } else {
        await createEstado(data);
        showSuccess("Estado creado correctamente");
      }
      // Refrescar listado cacheado
      await queryClient.invalidateQueries({ queryKey: estadoKeys.lists() });
      handleCloseForm();
    } catch (error: any) {
      showError(error.message || "Error al guardar el estado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await deleteEstado(showDeleteConfirm?.id);
      await queryClient.invalidateQueries({ queryKey: estadoKeys.lists() });
      handleCancelDelete();
      showSuccess("Estado eliminado correctamente", "Éxito");
    } catch (error: any) {
      handleCancelDelete();
      showError(error instanceof Error ? error.message : "Error al eliminar estado");
    }
  };

  // Lógica corregida: 
  // - ADMIN y USER siempre tienen companyId (vinculados a empresa)
  // - SUPERADMIN puede no tener empresa seleccionada (necesita seleccionar)
  const needsCompanySelection = !companyId && currentUser?.role === "SUPERADMIN";
  
  // Verificar si hay un problema con los datos del usuario
  const hasDataIssue = !companyId && currentUser?.role !== "SUPERADMIN";

  // Definir columnas para el DataTable
  const columns: DataTableColumn<EstadoRemitoQ>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (estado) => (
        <div className="estado-name">{estado?.name}</div>
      )
    },
    {
      key: 'color',
      label: 'Color',
      render: (estado) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
          <div 
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: estado.color, marginRight: '4px' }}
          ></div>
          <span className="text-sm text-gray-600 font-mono">{estado.color}</span>
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Activo',
      render: (estado) => (
        <span className={`badge ${estado.is_active ? 'badge-success' : 'badge-inactive'}`} style={{ padding: '4%' }}>
          {estado.is_active ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Registrado',
      render: (estado) => (
        <div className="text-sm text-gray-600">
          { (estado as any).created_at ? new Date((estado as any).created_at).toLocaleString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) : 'N/A'}
        </div>
      )
    }
  ];

  if (estadosLoading) {
    return (
      <main className="main-content">
        <div className="form-section">
          <LoadingSpinner message="Cargando estados..." />
        </div>
      </main>
    );
  }

  // Verificar si hay un problema con los datos del usuario
  if (hasDataIssue) {
    return (
      <main className="main-content">
        <div className="form-section">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error de Configuración</h2>
            <p className="text-gray-600">Tu usuario no está vinculado a ninguna empresa. Contacta al administrador.</p>
          </div>
        </div>
      </main>
    );
  }

  if (estadosError) {
    return (
      <main className="main-content">
        <div className="form-section">
          <div className="error-message">
            Error al cargar los estados
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="px-4 py-6 sm:px-0">
        {/* Formulario */}
        <EstadoRemitoForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingEstado={editingEstado}
        />

        <div className="form-section">
          <h2>Gestión de Estados de Remitos</h2>
          
          {/* Selector de empresa - ancho completo */}
          {shouldShowCompanySelector && empresas?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <FilterableSelect
                options={empresas}
                value={selectedCompanyId}
                onChange={setSelectedCompanyId}
                placeholder="Seleccionar empresa"
                searchFields={["name"]}
                className="w-full"
              />
            </div>
          )}

          {/* Barra de búsqueda y botón nuevo */}
          {!needsCompanySelection && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <SearchInput
                  value={tableConfig.searchValue || ''}
                  onChange={(value) => tableConfig.onSearchChange?.(value)}
                  placeholder="Buscar estados..."
                />
              </div>
              <button
                onClick={handleNewEstado}
                className="new-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                <Plus className="h-4 w-4" />
                <ShortcutText text="Nuevo Estado" shortcutKey="n" />
              </button>
            </div>
          )}

          {/* DataTable con paginación */}
          {needsCompanySelection ? (
            <div className="empty-state">
              <Tag className="empty-icon" />
              <p>Para ver los estados, primero selecciona una empresa.</p>
            </div>
          ) : (
            <>
              <DataTable
                {...tableConfig}
                columns={columns}
                showSearch={false}
                showNewButton={false}
                onEdit={(estado) => handleEditEstado(estado)}
                onDelete={handleDeleteEstado}
                actionsColumnLabel="Acciones"
              />
              <Pagination {...paginationConfig} />
            </>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        <DeleteConfirmModal
          isOpen={!!showDeleteConfirm}
          onCancel={handleCancelDelete}
          onConfirm={handleDelete}
          title="Eliminar Estado"
          message={`¿Estás seguro de que deseas eliminar el estado "${showDeleteConfirm?.name}"?`}
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
    </main>
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
