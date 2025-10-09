"use client";

import React, { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Plus, Users, Mail, Phone, MapPin } from "lucide-react";
import ActionButtons from "@/components/common/ActionButtons";
import { formatDate } from "@/lib/utils/formatters";
import SearchAndPagination from "@/components/common/SearchAndPagination";
import FilterableSelect from "@/components/common/FilterableSelect";
import { useSearchAndPagination } from "@/hooks/useSearchAndPagination";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useClientes, type Cliente } from "@/hooks/useClientes";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useCRUDPage } from "@/hooks/useCRUDPage";

function ClientesContent() {
  const { data: session } = useSession();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const {
    editingItem: editingCliente,
    showForm,
    isSubmitting,
    handleNew,
    handleEdit,
    handleCloseForm,
    setIsSubmitting,
    showDeleteConfirm,
    handleDeleteRequest,
    handleCancelDelete
  } = useCRUDPage<Cliente>();
  const { showSuccess, showError, hideModal, isModalOpen, modalContent } = useMessageModal();
  
  const { empresas } = useEmpresas();
  
  // Determinar qué empresa usar: la seleccionada o la del usuario
  const companyId = session?.user?.role === "SUPERADMIN" 
    ? selectedCompanyId 
    : session?.user?.companyId;

  const { 
    clientes, 
    isLoading, 
    error, 
    createCliente, 
    updateCliente, 
    deleteCliente 
  } = useClientes(companyId || undefined);

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
      
      handleCloseForm();
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
      handleCancelDelete();
      showSuccess("Éxito", "Cliente eliminado correctamente");
    } catch (error) {
      console.error("Error deleting cliente:", error);
      handleCancelDelete();
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

  // Verificar si necesita seleccionar empresa
  const needsCompanySelection = session?.user?.role === "SUPERADMIN" && !selectedCompanyId;


  return (
    <main className="main-content">
      <div className="px-4 py-6 sm:px-0">
        <ClienteForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingCliente={editingCliente}
        />

        <div className="form-section">
          <h2>Gestión de Clientes</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Lista de Clientes</h3>
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
          >
            {session?.user?.role === "SUPERADMIN" && (
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
                    <th>Registrado</th>
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
                      <td>{new Date(cliente.createdAt).toLocaleString('es-AR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</td>
                      <td>
                        <ActionButtons
                          onEdit={() => handleEdit(cliente)}
                          onDelete={() => handleDeleteRequest(cliente.id, cliente.name)}
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
            </>
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
        onCancel={handleCancelDelete}
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