"use client";

import React, { Suspense, useCallback, useEffect } from "react";
import { Plus, Users, Mail, Phone, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";
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

function ClientesContent() {
  // 🚀 Hook optimizado que carga todo en paralelo
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector,
    empresas,
    needsCompanySelection,
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
  const { empresas } = useEmpresas();

  // 🚀 REACT QUERY: Reemplaza el hook anterior
  const { data: clientes = [], isLoading, error } = useClientesQuery(companyId);
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

  // 🚀 REACT QUERY: Submit con mutaciones
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingCliente) {
        await updateMutation.mutateAsync({ id: editingCliente.id, data });
        showSuccess("Cliente actualizado correctamente");
      } else {
        await createMutation.mutateAsync({ ...data, companyId });
        showSuccess("Cliente creado correctamente");
      }
      handleCloseForm();
    } catch (error: any) {
      showError(error.message || "Error al guardar el cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 REACT QUERY: Delete con mutación
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
          <span className="truncate" style={{ maxWidth: '200px' }}>
            {cliente.address}
          </span>
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
    {
      key: 'createdAt',
      label: 'Fecha de Creación',
      render: (cliente) => formatDate(cliente.createdAt)
    },
  ];

  if (hasDataIssue) {
    return (
      <main className="main-content">
        <div className="form-section">
          <div className="error-message">
            Error: Tu usuario no tiene una empresa asignada. Por favor, contacta al administrador.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="form-section">
        <h2>Gestión de Clientes</h2>

        {/* Selector de empresa - ancho completo */}
        {shouldShowCompanySelector && empresas?.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <FilterableSelect
              options={empresas}
              value={selectedCompanyId}
              onChange={setSelectedCompanyId}
              placeholder="Seleccionar empresa"
              searchFields={["name"]}
              className="w-full"
            />
          </div>
        )}

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

      {/* Modal de formulario */}
      {showForm && (
        <ClienteForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={onSubmit}
          editingCliente={editingCliente}
          isSubmitting={isSubmitting}
        />
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
    </main>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando clientes..." />}>
      <ClientesContent />
    </Suspense>
  );
}

