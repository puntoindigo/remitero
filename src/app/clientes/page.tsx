"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, Users, Mail, Phone, MapPin, FileText, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { useIsMobile } from "@/hooks/useIsMobile";
import { useOptimizedPageData } from "@/hooks/useOptimizedPageData";
import { useDataWithCompanySimple } from "@/hooks/useDataWithCompanySimple";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { CompanySelector } from "@/components/common/CompanySelector";
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
  const isMobile = useIsMobile();
  const currentUser = useCurrentUserSimple();
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompanySimple();
  
  // Para compatibilidad con useOptimizedPageData (solo para canShowContent)
  const {
    canShowContent
  } = useOptimizedPageData();
  
  const {
    editingItem: editingCliente,
    showForm,
    isSubmitting,
    handleNew: handleNewBase,
    handleEdit,
    handleCloseForm,
    setIsSubmitting,
    showDeleteConfirm,
    handleDeleteRequest,
    handleCancelDelete
  } = useCRUDPage<Cliente>();

  const { modalState, showSuccess, showError, closeModal } = useMessageModal();

  // Wrapper para handleNew que verifica companyId
  const handleNew = useCallback(() => {
    if (!companyId) {
      showError("Debes seleccionar una empresa antes de crear un cliente");
      return;
    }
    handleNewBase();
  }, [companyId, handleNewBase, showError]);
  const { toasts, showSuccess: showToastSuccess, showError: showToastError, removeToast } = useToast();
  
  // 🚀 REACT QUERY: Reemplaza state y fetch
  const { data: clientes = [], isLoading } = useClientesQuery(companyId || undefined);
  const createMutation = useCreateClienteMutation();
  const updateMutation = useUpdateClienteMutation();
  const deleteMutation = useDeleteClienteMutation();
  
  // Obtener conteo de remitos por cliente
  const [remitosCounts, setRemitosCounts] = useState<Record<string, number>>({});
  const router = useRouter();
  
  useEffect(() => {
    if (!companyId || clientes.length === 0) return;
    
    const fetchRemitosCounts = async () => {
      try {
        const clientIds = clientes.map(c => c.id);
        const response = await fetch(`/api/remitos?companyId=${companyId}&limit=10000`);
        if (response.ok) {
          const data = await response.json();
          const remitos = data.items || [];
          
          // Contar remitos por cliente
          const counts: Record<string, number> = {};
          remitos.forEach((remito: any) => {
            if (remito.client?.id) {
              counts[remito.client.id] = (counts[remito.client.id] || 0) + 1;
            }
          });
          
          setRemitosCounts(counts);
        }
      } catch (error) {
        console.error('Error fetching remitos counts:', error);
      }
    };
    
    fetchRemitosCounts();
  }, [companyId, clientes]);

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

  // Función para navegar a remitos filtrados por cliente
  const handleViewRemitos = (clienteId: string) => {
    router.push(`/remitos?client=${clienteId}`);
  };

  // Definir columnas para el DataTable - desktop tradicional, mobile sin teléfono y dirección
  const columns: DataTableColumn<Cliente>[] = isMobile ? [
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
      key: 'remitos',
      label: 'Remitos',
      render: (cliente) => {
        const count = remitosCounts[cliente.id] || 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{count}</span>
            {count > 0 && (
              <FileText 
                className="h-4 w-4" 
                style={{ cursor: 'pointer', color: colors.primary }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewRemitos(cliente.id);
                }}
                title="Ver remitos de este cliente"
              />
            )}
          </div>
        );
      }
    }
  ] : [
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
    },
    {
      key: 'remitos',
      label: 'Remitos',
      render: (cliente) => {
        const count = remitosCounts[cliente.id] || 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{count}</span>
            {count > 0 && (
              <FileText 
                className="h-4 w-4" 
                style={{ cursor: 'pointer', color: colors.primary }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewRemitos(cliente.id);
                }}
                title="Ver remitos de este cliente"
              />
            )}
          </div>
        );
      }
    }
  ];

  const onSubmit = async (data: { name: string; email?: string; phone?: string; address?: string }) => {
    try {
      setIsSubmitting(true);
      
      if (editingCliente) {
        await updateMutation.mutateAsync({ id: editingCliente.id, data });
        showSuccess("Cliente actualizado correctamente");
      } else {
        // Para crear, siempre necesitamos companyId (useDataWithCompanySimple ya calcula el efectivo)
        if (!companyId) {
          showError("Debes seleccionar una empresa antes de crear un cliente");
          return;
        }
        await createMutation.mutateAsync({ ...data, companyId });
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
    <main className="main-content">
      <div className="form-section">
      {/* Formulario */}
      <ClienteForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        editingCliente={editingCliente}
      />

      {/* Título y búsqueda - siempre visible para SUPERADMIN */}
      {currentUser?.role === "SUPERADMIN" && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem',
          padding: '0 16px'
        }}>
          <h2 className="page-title-desktop" style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            color: '#111827',
            marginBottom: 0,
            marginTop: '0',
            padding: 0
          }}>
            Clientes
          </h2>
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
          />
        </div>
      )}
      {currentUser?.role !== "SUPERADMIN" && canShowContent && (
        <h2 className="page-title-desktop" style={{ 
          fontSize: '24px', 
          fontWeight: 700, 
          color: '#111827',
          marginBottom: '0.75rem',
          marginTop: '0',
          padding: '0 16px'
        }}>
          Clientes
        </h2>
      )}
      {canShowContent && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            padding: '0 16px',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ flex: 1 }}>
              <SearchInput
                value={crudSearchTerm}
                onChange={setCrudSearchTerm}
                placeholder="Buscar clientes..."
              />
            </div>
            {/* Botón Nuevo Cliente - solo en desktop */}
            {!isMobile && (
              <button
                onClick={handleNew}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '8px 16px',
                  background: colors.gradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Plus className="h-4 w-4" />
                Nuevo Cliente
              </button>
            )}
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
      </div>
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
