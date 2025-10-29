"use client";

import React, { Suspense, useCallback, useEffect } from "react";
import { Plus, Users, Mail, Phone, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { 
  useClientesQuery, 
  useCreateClienteMutation,
  useUpdateClienteMutation,
  useDeleteClienteMutation,
  type Cliente 
} from "@/hooks/queries/useClientesQuery";
import { OptimizedPageLayout } from "@/components/layout/OptimizedPageLayout";
import { useOptimizedPageData } from "@/hooks/useOptimizedPageData";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ShortcutText } from "@/components/common/ShortcutText";
import { SearchInput } from "@/components/common/SearchInput";
import { useShortcuts } from "@/hooks/useShortcuts";
import { useCRUDPage } from "@/hooks/useCRUDPage";

function ClientesContent() {
  // 🚀 Hook optimizado que carga todo en paralelo
  const {
    companyId,
    canShowContent
  } = useOptimizedPageData();
  
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
  
  // 🚀 REACT QUERY: Reemplaza state y fetch
  const { data: clientes = [], isLoading } = useClientesQuery(companyId);
  const createMutation = useCreateClienteMutation();
  const updateMutation = useUpdateClienteMutation();
  const deleteMutation = useDeleteClienteMutation();

  // Función de eliminación con useCallback
  const handleDeleteCliente = useCallback((cliente: Cliente) => {
    handleDeleteRequest(cliente.id, cliente.name);
  }, [handleDeleteRequest]);

  // Configurar shortcuts de teclado
  useShortcuts([
    {
      key: 'n',
      action: handleNew,
      description: 'Nuevo Cliente'
    }
  ], !!companyId && !showForm);

  // Listener para FAB mobile
  useEffect(() => {
    const handleFABClick = (event: any) => {
      if (event.detail?.action === 'newCliente') {
        handleNew();
      }
    };

    window.addEventListener('fabClick', handleFABClick);
    return () => window.removeEventListener('fabClick', handleFABClick);
  }, [handleNew]);

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig,
    searchTerm: crudSearchTerm,
    setSearchTerm: setCrudSearchTerm
  } = useCRUDTable({
    data: clientes,
    loading: isLoading,
    searchFields: ['name', 'email'],
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
      render: (cliente) => cliente.email ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail className="h-4 w-4 text-gray-400" />
          <span>{cliente.email}</span>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
    {
      key: 'phone',
      label: 'Teléfono',
      render: (cliente) => cliente.phone ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{cliente.phone}</span>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
    {
      key: 'address',
      label: 'Dirección',
      render: (cliente) => cliente.address ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{cliente.address}</span>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
    {
      key: 'createdAt',
      label: 'Registrado',
      render: (cliente) => formatDate(cliente.createdAt)
    }
  ];

  const onSubmit = async (data: { name: string; email?: string; phone?: string; address?: string }) => {
    try {
      setIsSubmitting(true);
      
      if (editingCliente) {
        await updateMutation.mutateAsync({ id: editingCliente.id, data });
        showSuccess("Cliente actualizado correctamente");
      } else {
        await createMutation.mutateAsync(data);
        showSuccess("Cliente creado correctamente");
      }
      
      handleCloseForm();
    } catch (error) {
      console.error("Error saving cliente:", error);
      showError(error instanceof Error ? error.message : "Error al guardar cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await deleteMutation.mutateAsync(showDeleteConfirm.id);
      handleCancelDelete();
      showSuccess("Cliente eliminado correctamente");
    } catch (error: any) {
      handleCancelDelete();
      showError(error instanceof Error ? error.message : "Error al eliminar cliente");
    }
  };

  return (
    <OptimizedPageLayout
      title="Gestión de Clientes"
      emptyStateIcon={<Users className="empty-icon" />}
      emptyStateMessage="Para ver los clientes, primero selecciona una empresa."
    >
      {/* Formulario */}
      <ClienteForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        editingCliente={editingCliente}
        companyId={companyId}
      />

      {/* Barra de búsqueda y botón nuevo */}
      {canShowContent && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <SearchInput
              value={crudSearchTerm}
              onChange={setCrudSearchTerm}
              placeholder="Buscar clientes..."
            />
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
            <ShortcutText text="Nuevo Cliente" shortcutKey="n" />
          </button>
        </div>
      )}

      {/* DataTable con paginación */}
      {canShowContent && (
        <>
          <DataTable
            {...tableConfig}
            columns={columns}
            showSearch={false}
            showNewButton={false}
          />
          <Pagination {...paginationConfig} />
        </>
      )}

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        onCancel={handleCancelDelete}
        onConfirm={handleDelete}
        itemName={showDeleteConfirm?.name || ''}
      />

      {/* Modal de mensajes */}
      <MessageModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />
    </OptimizedPageLayout>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando clientes..." />}>
      <ClientesContent />
    </Suspense>
  );
}
