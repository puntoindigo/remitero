"use client";

import React, { useState, Suspense } from "react";
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

  const { 
    clientes, 
    isLoading, 
    error, 
    createCliente, 
    updateCliente, 
    deleteCliente 
  } = useClientes(companyId || undefined);

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig
  } = useCRUDTable({
    data: clientes || [],
    loading: isLoading,
    searchFields: ['name', 'email', 'phone', 'address'],
    itemsPerPage: 10,
    onEdit: handleEdit,
    onDelete: handleDeleteRequest,
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
        await createCliente(data);
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
    if (!editingCliente) return;
    
    try {
      await deleteCliente(editingCliente.id);
      handleCancelDelete();
      showSuccess("Cliente eliminado correctamente");
    } catch (error: any) {
      handleCancelDelete();
      showError("Error", error instanceof Error ? error.message : "Error al eliminar cliente");
    }
  };

  // Lógica simplificada: mostrar contenido si hay companyId o si es SUPERADMIN sin impersonar
  const needsCompanySelection = !companyId && session?.user?.role === "SUPERADMIN";

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
          isOpen={showDeleteConfirm}
          onClose={handleCancelDelete}
          onConfirm={handleDelete}
          title="Eliminar Cliente"
          message={`¿Estás seguro de que deseas eliminar el cliente "${editingCliente?.name}"?`}
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
