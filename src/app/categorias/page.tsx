"use client";

import React, { useState, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Package } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { CategoriaForm } from "@/components/forms/CategoriaForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useCategorias, type Categoria } from "@/hooks/useCategorias";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useDataWithCompanySimple } from "@/hooks/useDataWithCompanySimple";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ABMHeader } from "@/components/common/ABMHeader";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";

function CategoriasContent() {
  const currentUser = useCurrentUserSimple();
  
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
  
  const {
    editingItem: editingCategoria,
    showForm,
    isSubmitting,
    handleNew,
    handleEdit,
    handleCloseForm,
    setIsSubmitting,
    showDeleteConfirm,
    handleDeleteRequest,
    handleCancelDelete
  } = useCRUDPage<Categoria>();
  const { modalState, showSuccess, showError, closeModal } = useMessageModal();
  
  const { empresas } = useEmpresas();

  const { 
    categorias, 
    isLoading, 
    error, 
    createCategoria, 
    updateCategoria, 
    deleteCategoria 
  } = useCategorias(companyId || undefined);

  // Función de eliminación con useCallback para evitar problemas de hoisting
  const handleDeleteCategoria = useCallback((categoria: Categoria) => {
    handleDeleteRequest(categoria.id, categoria.name);
  }, [handleDeleteRequest]);

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig
  } = useCRUDTable({
    data: categorias || [],
    loading: isLoading,
    searchFields: ['name', 'description'],
    itemsPerPage: 10,
    onEdit: handleEdit,
    onDelete: handleDeleteCategoria,
    onNew: handleNew,
    getItemId: (categoria) => categoria.id,
    emptyMessage: "No hay categorías",
    emptySubMessage: "Comienza creando una nueva categoría.",
    emptyIcon: <Package className="empty-icon" />,
    newButtonText: "Nueva Categoría",
    searchPlaceholder: "Buscar categorías..."
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingCategoria) {
        await updateCategoria(editingCategoria.id, data);
        showSuccess("Categoría actualizada correctamente");
      } else {
        await createCategoria(data);
        showSuccess("Categoría creada correctamente");
      }
      handleCloseForm();
    } catch (error: any) {
      showError("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await deleteCategoria(showDeleteConfirm.id);
      handleCancelDelete();
      showSuccess("Categoría eliminada correctamente");
    } catch (error: any) {
      handleCancelDelete();
      showError("Error", error instanceof Error ? error.message : "Error al eliminar categoría");
    }
  };

  // Lógica corregida: 
  // - ADMIN y USER siempre tienen companyId (vinculados a empresa)
  // - SUPERADMIN puede no tener empresa seleccionada (necesita seleccionar)
  const needsCompanySelection = !companyId && currentUser?.role === "SUPERADMIN";
  
  // Verificar si hay un problema con los datos del usuario
  const hasDataIssue = !companyId && currentUser?.role !== "SUPERADMIN";

  // Definir columnas para el DataTable
  const columns: DataTableColumn<Categoria>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (categoria) => (
        <div className="categoria-info">
          <div className="categoria-name">{categoria.name}</div>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Registrado',
      render: (categoria) => {
        const date = new Date(categoria.createdAt);
        return date.toLocaleString('es-AR', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
      }
    }
  ];

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="form-section">
          <LoadingSpinner message="Cargando categorías..." />
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

  return (
    <main className="main-content">
      <div className="px-4 py-6 sm:px-0">
        {/* Formulario */}
        <CategoriaForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingCategoria={editingCategoria}
        />

        <div className="form-section">
          <h2>Gestión de Categorías</h2>
          
          {/* Header con selector de empresa, búsqueda y botón Nuevo */}
          <ABMHeader
            showCompanySelector={shouldShowCompanySelector}
            companies={empresas}
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={setSelectedCompanyId}
            showNewButton={!!companyId}
            newButtonText="Nueva Categoría"
            onNewClick={handleNew}
            isSubmitting={isSubmitting}
            searchPlaceholder="Buscar categorías..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* DataTable con paginación */}
          {needsCompanySelection ? (
            <div className="empty-state">
              <Package className="empty-icon" />
              <p>Para ver las categorías, primero selecciona una empresa.</p>
            </div>
          ) : (
            <>
              <DataTable
                {...tableConfig}
                columns={columns}
                showSearch={true} // Habilitar búsqueda
                showNewButton={false} // Deshabilitar botón nuevo (ya tenemos uno independiente)
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
          title="Eliminar Categoría"
          message={`¿Estás seguro de que deseas eliminar la categoría "${showDeleteConfirm?.name}"?`}
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

export default function CategoriasPage() {
  return (
    <Suspense fallback={
      <main className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    }>
      <CategoriasContent />
    </Suspense>
  );
}
