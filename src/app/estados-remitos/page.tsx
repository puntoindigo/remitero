"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Plus, Tag, Edit, Trash2 } from "lucide-react";
import SearchAndPagination from "@/components/common/SearchAndPagination";
import { useSearchAndPagination } from "@/hooks/useSearchAndPagination";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useEstadosRemitos, EstadoRemito, EstadoRemitoFormData } from "@/hooks/useEstadosRemitos";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function EstadosRemitosContent() {
  const { data: session } = useSession();
  const currentUser = useCurrentUser();

  // Verificar permisos - solo ADMIN puede ver esta página
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Acceso Restringido
          </h2>
          <p className="text-red-600">
            Solo los administradores de empresa pueden gestionar estados de remitos.
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

  // Hook para manejar modales de mensajes
  const { modalState, showSuccess, showError, closeModal } = useMessageModal();

  // Hook para manejar estados de remitos
  const {
    estados,
    isLoading: estadosLoading,
    error: estadosError,
    createEstado,
    updateEstado,
    deleteEstado,
    loadEstados
  } = useEstadosRemitos();

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
    data: estados,
    searchFields: ['name', 'description'],
    itemsPerPage: 10
  });

  // Formulario para crear/editar estados
  const [formData, setFormData] = useState<EstadoRemitoFormData>({
    name: '',
    description: '',
    color: '#6b7280',
    icon: '📋',
    is_active: true,
    sort_order: 0
  });

  // Cargar estados al montar el componente
  useEffect(() => {
    if (currentUser?.companyId) {
      loadEstados();
    }
  }, [currentUser?.companyId]);

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingEstado) {
        await updateEstado(editingEstado.id, formData);
        showSuccess('Estado actualizado correctamente');
      } else {
        await createEstado(formData);
        showSuccess('Estado creado correctamente');
      }
      
      handleCloseForm();
      setFormData({
        name: '',
        description: '',
        color: '#6b7280',
        icon: '📋',
        is_active: true,
        sort_order: 0
      });
    } catch (error) {
      showError('Error al guardar el estado');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar edición
  const handleEdit = (estado: EstadoRemito) => {
    setFormData({
      name: estado.name,
      description: estado.description || '',
      color: estado.color,
      icon: estado.icon,
      is_active: estado.is_active,
      sort_order: estado.sort_order
    });
    handleEditEstado(estado);
  };

  // Manejar eliminación
  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    setIsSubmitting(true);
    try {
      await deleteEstado(showDeleteConfirm);
      showSuccess('Estado eliminado correctamente');
      handleCancelDelete();
    } catch (error) {
      showError('Error al eliminar el estado');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar nuevo estado
  const handleNew = () => {
    setFormData({
      name: '',
      description: '',
      color: '#6b7280',
      icon: '📋',
      is_active: true,
      sort_order: 0
    });
    handleNewEstado();
  };

  // Mostrar error en modal si hay un error de carga
  useEffect(() => {
    if (estadosError) {
      showError('Error al cargar estados', estadosError);
    }
  }, [estadosError]);

  if (estadosLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="estados-remitos-container">
      <div className="estados-remitos-header">
        <div>
          <h1 className="estados-remitos-title">Estados de Remitos</h1>
          <p className="estados-remitos-subtitle">
            Gestiona los estados disponibles para los remitos de tu empresa
          </p>
        </div>
        <button
          onClick={handleNew}
          className="estados-remitos-new-btn"
        >
          <Plus className="w-5 h-5" />
          Nuevo Estado
        </button>
      </div>

      {/* Búsqueda y paginación */}
      <div className="estados-remitos-search">
        <SearchAndPagination
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          placeholder="Buscar estados..."
        />
      </div>

      {/* Tabla de estados */}
      <div className="estados-remitos-table-container">
        <table className="estados-remitos-table">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Descripción</th>
              <th>Color</th>
              <th>Activo</th>
              <th>Predefinido</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((estado) => (
              <tr key={estado.id}>
                <td>
                  <div className="estado-cell">
                    <span className="estado-icon">{estado.icon}</span>
                    <div>
                      <div className="estado-name">{estado.name}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="estado-description">
                    {estado.description || '-'}
                  </div>
                </td>
                <td>
                  <div className="color-preview">
                    <div 
                      className="color-square"
                      style={{ backgroundColor: estado.color }}
                    ></div>
                    <span className="color-code">{estado.color}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${estado.is_active ? 'active' : 'inactive'}`}>
                    {estado.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${estado.is_default ? 'default' : 'custom'}`}>
                    {estado.is_default ? 'Sí' : 'No'}
                  </span>
                </td>
                <td>
                  <div className="estados-remitos-actions">
                    <button
                      onClick={() => handleEdit(estado)}
                      className="edit"
                      title="Editar estado"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(estado.id)}
                      className="delete"
                      title="Eliminar estado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedData.length === 0 && (
          <div className="estados-remitos-empty">
            <Tag className="mx-auto h-12 w-12" />
            <h3>No hay estados</h3>
            <p>
              {searchTerm ? 'No se encontraron estados que coincidan con la búsqueda.' : 'Comienza creando un nuevo estado de remito.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="estados-modal">
          <div className="estados-modal-content">
            <h3 className="estados-modal-title">
              {editingEstado ? 'Editar Estado' : 'Nuevo Estado'}
            </h3>
              
            <form onSubmit={handleSubmit}>
              <div className="estados-form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="estados-form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="estados-form-row">
                <div className="estados-form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>

                <div className="estados-form-group">
                  <label>Icono</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="📋"
                  />
                </div>
              </div>

              <div className="estados-form-group">
                <div className="estados-form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <label>Estado activo</label>
                </div>
              </div>

              <div className="estados-modal-actions">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="cancel"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit"
                >
                  {isSubmitting ? 'Guardando...' : (editingEstado ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleDelete}
        title="Eliminar Estado"
        message="¿Estás seguro de que quieres eliminar este estado? Esta acción no se puede deshacer."
        isLoading={isSubmitting}
      />

      {/* Modal de mensajes */}
      <MessageModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />
    </div>
  );
}

export default function EstadosRemitosPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EstadosRemitosContent />
    </Suspense>
  );
}