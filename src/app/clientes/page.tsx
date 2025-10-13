"use client";

import React, { useState, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Users, Mail, Phone, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useClientes, type Cliente } from "@/hooks/useClientes";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useDataWithCompany } from "@/hooks/useDataWithCompany";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";

function ClientesContent() {
  const { data: session } = useSession();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompany();
  
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
  const { modalState, showSuccess, showError, closeModal } = useMessageModal();
  
  const { empresas } = useEmpresas();
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    clientes, 
    isLoading, 
    error, 
    createCliente, 
    updateCliente, 
    deleteCliente 
  } = useClientes(companyId || undefined);

  // Función de eliminación con useCallback para evitar problemas de hoisting
  const handleDeleteCliente = useCallback((cliente: Cliente) => {
    handleDeleteRequest(cliente.id, cliente.name);
  }, [handleDeleteRequest]);

  // Filtrar clientes por término de búsqueda
  const filteredClientes = searchTerm 
    ? (clientes || []).filter(cliente => 
        cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cliente.phone && cliente.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cliente.address && cliente.address.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : (clientes || []);

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig
  } = useCRUDTable({
    data: filteredClientes,
    loading: isLoading,
    searchFields: ['name', 'email', 'phone', 'address'],
    itemsPerPage: 10,
    onEdit: handleEdit,
    onDelete: handleDeleteCliente,
    onNew: handleNew,
    getItemId: (cliente) => cliente.id,
    emptyMessage: "No hay clientes",
    emptySubMessage: "Comienza creando un nuevo cliente.",
    emptyIcon: <Users className="empty-icon" />,
    newButtonText: "Nuevo Cliente",
    searchPlaceholder: "Buscar clientes..."
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, data);
        showSuccess("Cliente actualizado correctamente");
      } else {
        await createCliente({ ...data, companyId });
        showSuccess("Cliente creado correctamente");
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
      await deleteCliente(showDeleteConfirm.id);
      handleCancelDelete();
      showSuccess("Cliente eliminado correctamente");
    } catch (error: any) {
      handleCancelDelete();
      showError("Error", error instanceof Error ? error.message : "Error al eliminar cliente");
    }
  };

  // Lógica para mostrar contenido: si hay companyId o si es SUPERADMIN con empresa seleccionada
  const shouldShowContent = companyId !== null;

  // Definir columnas para el DataTable
  const columns: DataTableColumn<Cliente>[] = [
    {
      key: 'name',
      label: 'Cliente',
      render: (cliente) => (
        <div className="cliente-info">
          <div className="cliente-name">{cliente.name}</div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (cliente) => (
        cliente.email ? (
          <div className="cliente-email">
            <Mail className="h-3 w-3 inline mr-2" />
            {cliente.email}
          </div>
        ) : (
          <span className="text-gray-400">Sin email</span>
        )
      )
    },
    {
      key: 'phone',
      label: 'Teléfono',
      render: (cliente) => (
        cliente.phone ? (
          <div className="cliente-phone">
            <Phone className="h-3 w-3 inline mr-2" />
            {cliente.phone}
          </div>
        ) : (
          <span className="text-gray-400">Sin teléfono</span>
        )
      )
    },
    {
      key: 'address',
      label: 'Dirección',
      render: (cliente) => (
        cliente.address ? (
          <div className="cliente-address">
            <MapPin className="h-3 w-3 inline mr-2" />
            {cliente.address}
          </div>
        ) : (
          <span className="text-gray-400">Sin dirección</span>
        )
      )
    },
    {
      key: 'createdAt',
      label: 'Registrado',
      render: (cliente) => new Date(cliente.createdAt).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  ];

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="form-section">
          <div className="loading">Cargando clientes...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="px-4 py-6 sm:px-0">
        {/* Formulario */}
        <ClienteForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingCliente={editingCliente}
        />

        <div className="form-section">
          <h2>Gestión de Clientes</h2>
          
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
          {shouldShowContent && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '300px', position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Buscar clientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          backgroundImage: 'none'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                        pointerEvents: 'none'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.35-4.35"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleNew}
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
                    Nuevo Cliente
                  </button>
                </div>
              </div>
              
              <DataTable
                {...tableConfig}
                columns={columns}
                showSearch={false} // Deshabilitar búsqueda del DataTable
                showNewButton={false} // Deshabilitar botón nuevo del DataTable
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
          title="Eliminar Cliente"
          message={`¿Estás seguro de que deseas eliminar el cliente "${showDeleteConfirm?.name}"?`}
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

export default function ClientesPage() {
  return (
    <Suspense fallback={
      <main className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    }>
      <ClientesContent />
    </Suspense>
  );
}
