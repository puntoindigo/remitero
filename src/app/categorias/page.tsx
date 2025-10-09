"use client";

import React, { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Plus, Package } from "lucide-react";
import ActionButtons from "@/components/common/ActionButtons";
import { formatDate } from "@/lib/utils/formatters";
import SearchAndPagination from "@/components/common/SearchAndPagination";
import FilterableSelect from "@/components/common/FilterableSelect";
import { useSearchAndPagination } from "@/hooks/useSearchAndPagination";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { CategoriaForm } from "@/components/forms/CategoriaForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useCategorias, type Categoria } from "@/hooks/useCategorias";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useCRUDPage } from "@/hooks/useCRUDPage";

function CategoriasContent() {
  const { data: session } = useSession();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
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
  const { showSuccess, showError, hideModal, isModalOpen, modalContent } = useMessageModal();
  
  const { empresas } = useEmpresas();
  
  // Determinar qué empresa usar: la seleccionada o la del usuario
  const companyId = session?.user?.role === "SUPERADMIN" 
    ? selectedCompanyId 
    : session?.user?.companyId;

  const { 
    categorias, 
    isLoading, 
    error, 
    createCategoria, 
    updateCategoria, 
    deleteCategoria 
  } = useCategorias(companyId || undefined);

  const {
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handleSearchChange,
    handlePageChange,
    paginatedData: filteredCategorias
  } = useSearchAndPagination({
    data: categorias,
    searchFields: ['name']
  });

  const onSubmit = async (data: { name: string }) => {
    try {
      setIsSubmitting(true);
      
      if (editingCategoria) {
        await updateCategoria(editingCategoria.id, data.name);
        showSuccess("Éxito", "Categoría actualizada correctamente");
      } else {
        await createCategoria(data.name);
        showSuccess("Éxito", "Categoría creada correctamente");
      }
      
      handleCloseForm();
    } catch (error) {
      console.error("Error saving categoria:", error);
      showError("Error", error instanceof Error ? error.message : "Error al guardar categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await deleteCategoria(showDeleteConfirm.id);
      handleCancelDelete();
      showSuccess("Éxito", "Categoría eliminada correctamente");
    } catch (error) {
      console.error("Error deleting categoria:", error);
      handleCancelDelete();
      showError("Error", error instanceof Error ? error.message : "Error al eliminar categoría");
    }
  };

  // Verificar si necesita seleccionar empresa
  const needsCompanySelection = session?.user?.role === "SUPERADMIN" && !selectedCompanyId;

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="form-section">
          <h2>Gestión de Categorías</h2>
          <p>Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <section className="form-section">
        <h2>Gestión de Categorías</h2>
        
        <CategoriaForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingCategoria={editingCategoria}
        />
        
        <div className="form-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Lista de Categorías</h3>
            {!showForm && (
              <button onClick={handleNew} className="primary">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </button>
            )}
          </div>
          
          <SearchAndPagination
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            placeholder="Buscar categorías..."
          >
            {session?.user?.role === "SUPERADMIN" && empresas.length > 0 && (
              <div className="ml-4">
                <FilterableSelect
                  options={empresas}
                  value={selectedCompanyId}
                  onChange={setSelectedCompanyId}
                  placeholder="Seleccionar empresa"
                  searchFields={["name"]}
                  className="w-64"
                />
              </div>
            )}
          </SearchAndPagination>

          {!needsCompanySelection && (
            <>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              {!Array.isArray(filteredCategorias) || filteredCategorias.length === 0 ? (
            <p>No hay categorías registradas.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Productos</th>
                    <th>Registrado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategorias.map((categoria) => (
                    <tr key={categoria.id}>
                      <td>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          {categoria.name}
                        </div>
                      </td>
                      <td>
                        <span className="badge">
                          {categoria.products?.length || 0} productos
                        </span>
                      </td>
                      <td>{new Date(categoria.createdAt).toLocaleString('es-AR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</td>
                      <td>
                        <ActionButtons
                          onEdit={() => handleEdit(categoria)}
                          onDelete={() => handleDeleteRequest(categoria.id, categoria.name)}
                          editTitle="Editar categoría"
                          deleteTitle="Eliminar categoría"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            </>
          )}
        </div>
      </section>

      <MessageModal
        isOpen={isModalOpen}
        onClose={hideModal}
        title={modalContent?.title || ""}
        message={modalContent?.message || ""}
        type={modalContent?.type || "info"}
      />
      
      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
        title="Eliminar categoría"
        message="¿Estás seguro de que deseas eliminar esta categoría?"
        itemName={showDeleteConfirm?.name}
      />
    </main>
  );
}

export default function CategoriasPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CategoriasContent />
    </Suspense>
  );
}