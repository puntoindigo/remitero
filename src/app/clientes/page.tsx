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
import { useDataWithCompanySimple } from "@/hooks/useDataWithCompanySimple";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ABMHeader } from "@/components/common/ABMHeader";
import { useLoading } from "@/hooks/useLoading";
import { LoadingButton } from "@/components/common/LoadingButton";

function ClientesContent() {
  const currentUser = useCurrentUserSimple();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompanySimple();
  
  // Loading state management
  const { loading: loadingState, startLoading, stopLoading } = useLoading();
  
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

  // Función de eliminación con useCallback para evitar problemas de hoisting
  const handleDeleteCliente = useCallback((cliente: Cliente) => {
    handleDeleteRequest(cliente.id, cliente.name);
  }, [handleDeleteRequest]);

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig,
    searchTerm: crudSearchTerm,
    setSearchTerm: setCrudSearchTerm
  } = useCRUDTable({
    data: clientes || [],
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

  // Lógica corregida: 
  // - ADMIN y USER siempre tienen companyId (vinculados a empresa)
  // - SUPERADMIN puede no tener empresa seleccionada (necesita seleccionar)
  const needsCompanySelection = !companyId && currentUser?.role === "SUPERADMIN";
  
  // Verificar si hay un problema con los datos del usuario
  const hasDataIssue = !companyId && currentUser?.role !== "SUPERADMIN";

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
            &nbsp;{cliente.email}
          </div>
        ) : (
          <span className="text-muted">Sin email</span>
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
            &nbsp;{cliente.phone}
          </div>
        ) : (
          <span className="text-muted">Sin teléfono</span>
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
            &nbsp;{cliente.address}
          </div>
        ) : (
          <span className="text-muted">Sin dirección</span>
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
          <LoadingSpinner message="Cargando clientes..." />
        </div>
      </main>
    );
  }

  // Verificar si hay un problema con los datos del usuario
  if (hasDataIssue) {
    return (
      <main className="main-content">
        <div className="form-section">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error de Configuración</h2>
            <p className="text-gray-600">Tu usuario no está vinculado a ninguna empresa. Contacta al administrador.</p>
          </div>
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
          
          {/* Header con selector de empresa, búsqueda y botón Nuevo */}
          <ABMHeader
            showCompanySelector={shouldShowCompanySelector}
            companies={empresas}
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={setSelectedCompanyId}
            showNewButton={!needsCompanySelection}
            newButtonText="Nuevo Cliente"
            onNewClick={handleNew}
            isSubmitting={isSubmitting}
            searchPlaceholder="Buscar clientes..."
            searchValue={crudSearchTerm}
            onSearchChange={setCrudSearchTerm}
          />

          {/* DataTable con paginación */}
          {needsCompanySelection ? (
            <div className="empty-state">
              <Users className="empty-icon" />
              <p>Para ver los clientes, primero selecciona una empresa.</p>
            </div>
          ) : (
            <>
              
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
