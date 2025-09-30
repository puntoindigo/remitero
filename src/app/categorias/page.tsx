"use client";

import React, { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import SearchAndPagination from "@/components/common/SearchAndPagination";
import { useSearchAndPagination } from "@/hooks/useSearchAndPagination";
import { MessageModal } from "@/components/common/MessageModal";
import { CategoriaForm } from "@/components/forms/CategoriaForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useCategorias, type Categoria } from "@/hooks/useCategorias";

function CategoriasContent() {
  const { data: session } = useSession();
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError, hideModal, isModalOpen, modalContent } = useMessageModal();
  
  const { 
    categorias, 
    isLoading, 
    error, 
    createCategoria, 
    updateCategoria, 
    deleteCategoria 
  } = useCategorias();

  const {
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handleSearchChange,
    handlePageChange,
    filteredData: filteredCategorias
  } = useSearchAndPagination(categorias, searchTerm => 
    categorias.filter(categoria => 
      categoria.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleNew = () => {
    setEditingCategoria(null);
    setShowForm(true);
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategoria(null);
  };

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
      
      setShowForm(false);
      setEditingCategoria(null);
    } catch (error) {
      console.error("Error saving categoria:", error);
      showError("Error", error instanceof Error ? error.message : "Error al guardar categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategoria(id);
      showSuccess("Éxito", "Categoría eliminada correctamente");
    } catch (error) {
      console.error("Error deleting categoria:", error);
      showError("Error", error instanceof Error ? error.message : "Error al eliminar categoría");
    }
  };

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
          onClose={handleCancel}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingCategoria={editingCategoria}
        />
        
        {!showForm && (
          <div className="form-actions">
            <button onClick={handleNew} className="primary">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </button>
          </div>
        )}

        <div className="form-section">
          <h3>Lista de Categorías</h3>
          
          <SearchAndPagination
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            placeholder="Buscar categorías..."
          />
          
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
                    <th>Fecha de Creación</th>
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
                      <td>{formatDate(categoria.createdAt)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(categoria)}
                            className="small primary"
                            title="Editar categoría"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(categoria.id)}
                            className="small danger"
                            title="Eliminar categoría"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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