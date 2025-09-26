"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { CategoryForm, categorySchema } from "@/lib/validations";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import SearchAndPagination from "@/components/common/SearchAndPagination";
import { useSearchAndPagination } from "@/hooks/useSearchAndPagination";
import { MessageModal } from "@/components/common/MessageModal";
import { useMessageModal } from "@/hooks/useMessageModal";

interface Category {
  id: string;
  name: string;
  products: { id: string }[];
  createdAt: Date;
}

function CategoriasContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Hook para manejar modales de mensajes
  const { modalState, showSuccess, showError, closeModal } = useMessageModal();

  // Hook para búsqueda y paginación
  const {
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedData,
    handleSearchChange,
    handlePageChange
  } = useSearchAndPagination({
    data: categories,
    searchFields: ['name'],
    itemsPerPage: 10
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema)
  });

  const loadCategories = async () => {
    if (!session?.user?.companyId) return;
    
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [session?.user?.companyId]);

  // Detectar parámetro ?new=true para abrir formulario automáticamente
  useEffect(() => {
    const newParam = searchParams?.get('new');
    if (newParam === 'true') {
      setShowForm(true);
      setEditingCategory(null);
      reset();
    }
  }, [searchParams, reset]);

  const onSubmit = async (data: CategoryForm) => {
    if (!session?.user?.companyId) return;

    try {
      let response;
      if (editingCategory) {
        response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        response = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar la categoría");
      }
      
      reset();
      setEditingCategory(null);
      setShowForm(false);
      await loadCategories();
      showSuccess("Categoría guardada correctamente");
    } catch (error: any) {
      console.error("Error saving category:", error);
      showError("Error al guardar la categoría", error.message);
    }
  };

  const handleNew = () => {
    setEditingCategory(null);
    reset();
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setValue("name", category.name);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    reset();
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.companyId) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la categoría');
      }

      await loadCategories();
      setShowDeleteConfirm(null);
      showSuccess("Categoría eliminada correctamente");
    } catch (error: any) {
      showError("Error al eliminar la categoría", error.message);
      setShowDeleteConfirm(null); // Cerrar el modal después del error
    }
  };

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="px-4 py-6 sm:px-0">
        <div className="form-section">
          <h2>Gestión de Categorías</h2>
          
          <div className="form-actions">
            <button
              onClick={handleNew}
              className="primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </button>
          </div>

          {/* Formulario */}
          {showForm && (
          <div className="form-section">
            <h3>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</h3>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre de la categoría</label>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="Ingresa el nombre de la categoría"
                  />
                  {errors.name && (
                    <p className="error-message">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Guardando..." : editingCategory ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
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
          
          {!Array.isArray(categories) || categories.length === 0 ? (
            <div className="empty-state">
              <Package className="empty-icon" />
              <p className="empty-text">No hay categorías</p>
              <p className="empty-subtext">Comienza creando una nueva categoría.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Productos</th>
                  <th>Registrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(paginatedData) && paginatedData.map((category) => (
                  <tr key={category.id}>
                    <td className="font-medium">{category.name}</td>
                    <td>
                      <button
                        onClick={() => router.push(`/productos?category=${category.id}`)}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {category._count?.products || 0} productos
                      </button>
                    </td>
                    <td>{new Date(category.createdAt).toLocaleString('es-AR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(category)}
                          className="action-btn edit"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(category.id)}
                          className="action-btn delete"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content">
                <h3>Confirmar eliminación</h3>
                <p>¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.</p>
                <div className="modal-actions">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="danger"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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