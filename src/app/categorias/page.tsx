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
import { useDataWithCompany } from "@/hooks/useDataWithCompany";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";

function CategoriasContent() {
  const { data: session } = useSession();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompany();
  
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
    if (!editingCategoria) return;
    
    try {
      await deleteCategoria(editingCategoria.id);
      handleCancelDelete();
      showSuccess("Categoría eliminada correctamente");
    } catch (error: any) {
      handleCancelDelete();
      showError("Error", error instanceof Error ? error.message : "Error al eliminar categoría");
    }
  };

  // Lógica simplificada: mostrar contenido si hay companyId o si es SUPERADMIN sin impersonar
  const needsCompanySelection = !companyId && session?.user?.role === "SUPERADMIN";

  // Definir columnas para el DataTable
  const columns: DataTableColumn<Categoria>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (categoria) => (
        <div className="categoria-info">
          <div className="categoria-name">{categoria.name}</div>
          {categoria.description && (
            <div className="categoria-description">{categoria.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Fecha de Creación',
      render: (categoria) => formatDate(categoria.createdAt)
    }
  ];

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="form-section">
          <div className="loading">Cargando categorías...</div>
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
                showSearch={true} // Habilitar búsqueda
                showNewButton={true} // Habilitar botón nuevo
              />
              <Pagination {...paginationConfig} />
            </>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        <DeleteConfirmModal
          isOpen={!!showDeleteConfirm}
          onClose={handleCancelDelete}
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
