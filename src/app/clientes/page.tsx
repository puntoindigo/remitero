"use client";

import React, { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Plus, Users, Mail, Phone, MapPin } from "lucide-react";
import ActionButtons from "@/components/common/ActionButtons";
import { formatDate } from "@/lib/utils/formatters";
import SearchAndPagination from "@/components/common/SearchAndPagination";
import { useSearchAndPagination } from "@/hooks/useSearchAndPagination";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useClientes, type Cliente } from "@/hooks/useClientes";

function ClientesContent() {
  const { data: session } = useSession();
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const { showSuccess, showError, hideModal, isModalOpen, modalContent } = useMessageModal();
  
  const { 
    clientes, 
    isLoading, 
    error, 
    createCliente, 
    updateCliente, 
    deleteCliente 
  } = useClientes();

  const {
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handleSearchChange,
    handlePageChange,
    paginatedData: filteredClientes
  } = useSearchAndPagination({
    data: clientes,
    searchFields: ['name', 'email', 'phone']
  });

  const handleNew = () => {
    setEditingCliente(null);
    setShowForm(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCliente(null);
  };

  const onSubmit = async (data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  }) => {
    try {
      setIsSubmitting(true);
      
      if (editingCliente) {
        await updateCliente(editingCliente.id, data);
        showSuccess("Éxito", "Cliente actualizado correctamente");
      } else {
        await createCliente(data);
        showSuccess("Éxito", "Cliente creado correctamente");
      }
      
      setShowForm(false);
      setEditingCliente(null);
    } catch (error) {
      console.error("Error saving cliente:", error);
      showError("Error", error instanceof Error ? error.message : "Error al guardar cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await deleteCliente(showDeleteConfirm.id);
      setShowDeleteConfirm(null);
      showSuccess("Éxito", "Cliente eliminado correctamente");
    } catch (error) {
      console.error("Error deleting cliente:", error);
      setShowDeleteConfirm(null);
      showError("Error", error instanceof Error ? error.message : "Error al eliminar cliente");
    }
  };

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="form-section">
          <h2>Gestión de Clientes</h2>
          <p>Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="px-4 py-6 sm:px-0">
        <ClienteForm
          isOpen={showForm}
          onClose={handleCancel}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingCliente={editingCliente}
        />

        <div className="form-section">
          <h2>Gestión de Clientes</h2>
          
          <div className="form-actions">
            <button onClick={handleNew} className="primary">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </button>
          </div>

          <SearchAndPagination
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            placeholder="Buscar clientes..."
          />
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {!Array.isArray(filteredClientes) || filteredClientes.length === 0 ? (
            <p>No hay clientes registrados.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Dirección</th>
                    <th>Fecha de Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {cliente.name}
                        </div>
                      </td>
                      <td>
                        {cliente.email ? (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {cliente.email}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td>
                        {cliente.phone ? (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {cliente.phone}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td>
                        {cliente.address ? (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {cliente.address}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td>{formatDate(cliente.createdAt)}</td>
                      <td>
                        <ActionButtons
                          onEdit={() => handleEdit(cliente)}
                          onDelete={() => setShowDeleteConfirm({ id: cliente.id, name: cliente.name })}
                          editTitle="Editar cliente"
                          deleteTitle="Eliminar cliente"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
        onCancel={() => setShowDeleteConfirm(null)}
        title="Eliminar cliente"
        message="¿Estás seguro de que deseas eliminar este cliente?"
        itemName={showDeleteConfirm?.name}
      />
    </main>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ClientesContent />
    </Suspense>
  );
}