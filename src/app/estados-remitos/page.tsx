"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Plus, Tag, Edit, Trash2 } from "lucide-react";
import ActionButtons from "@/components/common/ActionButtons";
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

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showError("Error de validación", "El nombre del estado es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEstado) {
        await updateEstado(editingEstado.id, formData);
        showSuccess("Estado actualizado", "El estado de remito se ha actualizado correctamente");
      } else {
        await createEstado(formData);
        showSuccess("Estado creado", "El estado de remito se ha creado correctamente");
      }
      
      handleCloseForm();
      resetForm();
    } catch (error) {
      showError("Error", error instanceof Error ? error.message : "Error al guardar el estado");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar eliminación
  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    setIsSubmitting(true);
    try {
      await deleteEstado(showDeleteConfirm);
      showSuccess("Estado eliminado", "El estado de remito se ha eliminado correctamente");
      handleCancelDelete();
    } catch (error) {
      showError("Error", error instanceof Error ? error.message : "Error al eliminar el estado");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#6b7280',
      icon: '📋',
      is_active: true,
      sort_order: 0
    });
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

  // Manejar nuevo estado
  const handleNew = () => {
    resetForm();
    handleNewEstado();
  };

  if (estadosLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando estados de remitos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estados de Remitos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los estados disponibles para los remitos de tu empresa
          </p>
        </div>
        <button
          onClick={handleNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Estado
        </button>
      </div>

      {/* Búsqueda y paginación */}
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

      {/* Tabla de estados */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Predefinido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((estado) => (
              <tr key={estado.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{estado.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {estado.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {estado.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-300 mr-2"
                      style={{ backgroundColor: estado.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{estado.color}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    estado.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {estado.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    estado.is_default 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {estado.is_default ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <ActionButtons
                    onEdit={() => handleEdit(estado)}
                    onDelete={() => handleDeleteRequest(estado.id)}
                    canEdit={!estado.is_default} // No permitir editar estados predefinidos
                    canDelete={!estado.is_default} // No permitir eliminar estados predefinidos
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedData.length === 0 && (
          <div className="text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay estados</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No se encontraron estados que coincidan con la búsqueda.' : 'Comienza creando un nuevo estado de remito.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEstado ? 'Editar Estado' : 'Nuevo Estado'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Color
                    </label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="mt-1 block w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Icono
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="📋"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Estado activo</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Guardando...' : (editingEstado ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
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