"use client";

import React, { Suspense, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, Users, Mail, Phone, MapPin, FileText, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { ToastContainer } from "@/components/common/Toast.jsx";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useToast } from "@/hooks/useToast.js";
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
import { useColorTheme } from "@/contexts/ColorThemeContext";

function ClientesContent() {
  const { colors } = useColorTheme();
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
  const { toasts, showSuccess: showToastSuccess, showError: showToastError, removeToast } = useToast();
  
  // 🚀 REACT QUERY: Reemplaza state y fetch
  const { data: clientes = [], isLoading } = useClientesQuery(companyId || undefined);
  const createMutation = useCreateClienteMutation();
  const updateMutation = useUpdateClienteMutation();
  const deleteMutation = useDeleteClienteMutation();

  // Función de eliminación con useCallback
  const handleDeleteCliente = useCallback((cliente: Cliente) => {
    handleDeleteRequest(cliente.id, cliente.name);
  }, [handleDeleteRequest]);

  // Detectar si viene de /nuevo y abrir formulario
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    const openForm = searchParams.get('openForm');
    if (openForm === 'true' && !showForm && companyId) {
      handleNew();
      // Limpiar el parámetro de la URL
      const params = new URLSearchParams(searchParams as any);
      params.delete('openForm');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, companyId, showForm]); // Solo ejecutar cuando cambien searchParams o companyId

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

  // Definir columnas para el DataTable - desktop tradicional
  const columns: DataTableColumn<Cliente>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (cliente) => cliente.name
    },
    {
      key: 'email',
      label: 'Email',
      render: (cliente) => cliente.email || '-'
    },
    {
      key: 'phone',
      label: 'Teléfono',
      render: (cliente) => cliente.phone || '-'
    },
    {
      key: 'address',
      label: 'Dirección',
      render: (cliente) => cliente.address || '-'
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
      showToastSuccess("Cliente eliminado correctamente");
    } catch (error: any) {
      handleCancelDelete();
      showToastError(error instanceof Error ? error.message : "Error al eliminar cliente");
    }
  };

  return (
    <OptimizedPageLayout
      title="Gestión"
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
      />

      {/* Título y búsqueda */}
      {canShowContent && (
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            color: '#111827',
            marginBottom: '0.75rem',
            padding: '0 16px'
          }}>
            Clientes
          </h2>
          <div style={{ padding: '0 16px' }}>
            <SearchInput
              value={crudSearchTerm}
              onChange={setCrudSearchTerm}
              placeholder="Buscar clientes..."
            />
          </div>
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
            onEdit={handleEdit}
            onDelete={handleDeleteCliente}
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

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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
