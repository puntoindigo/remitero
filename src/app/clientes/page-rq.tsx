"use client";

import React, { Suspense, useCallback } from "react";
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
import { useEmpresas } from "@/hooks/useEmpresas";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useDataWithCompanySimple } from "@/hooks/useDataWithCompanySimple";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ShortcutText } from "@/components/common/ShortcutText";
import { useShortcuts } from "@/hooks/useShortcuts";

function ClientesContent() {
  const currentUser = useCurrentUserSimple();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompanySimple();
  
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
      showError("Error", error.message);
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
      showError("Error", error instanceof Error ? error.message : "Error al eliminar cliente");
    }
  };

  const needsCompanySelection = !companyId && currentUser?.role === "SUPERADMIN";
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
        {!needsCompanySelection && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '300px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Buscar clientes..."
                  value={crudSearchTerm}
                  onChange={(e) => setCrudSearchTerm(e.target.value)}
                  className="search-input"
                  style={{
                    width: '100%',
                    padding: '0.5rem 2.5rem 0.5rem 2.5rem',
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
          initialData={editingCliente}
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


