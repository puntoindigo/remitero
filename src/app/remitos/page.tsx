"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, FileText, Calendar, User, Package } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { ToastContainer } from "@/components/common/Toast.jsx";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useToast } from "@/hooks/useToast.js";
import { useDirectUpdate } from "@/hooks/useDirectUpdate";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { useDataWithCompanySimple } from "@/hooks/useDataWithCompanySimple";
import { useEstadosByCompany } from "@/hooks/useEstadosByCompany";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useProductos } from "@/hooks/useProductos";
import { useClientes } from "@/hooks/useClientes";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ShortcutText } from "@/components/common/ShortcutText";
import { SearchInput } from "@/components/common/SearchInput";
import { useLoading } from "@/hooks/useLoading";
import { LoadingButton } from "@/components/common/LoadingButton";
import { RemitoFormComplete } from "@/components/forms/RemitoFormComplete";
import { useShortcuts } from "@/hooks/useShortcuts";
import {
  useRemitosQuery,
  useCreateRemitoMutation,
  useUpdateRemitoMutation,
  useDeleteRemitoMutation,
  type Remito
} from "@/hooks/queries/useRemitosQuery";
import { useQueryClient } from "@tanstack/react-query";

function RemitosContent() {
  const currentUser = useCurrentUserSimple();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Prevenir errores de client-side exception
  if (!currentUser) {
    return (
      <main className="main-content">
        <div className="form-section">
          <LoadingSpinner message="Cargando usuario..." />
        </div>
      </main>
    );
  }
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompanySimple();
  
  // 🚀 REACT QUERY: Reemplaza state y fetch
  const { data: remitos = [], isLoading } = useRemitosQuery(companyId || undefined);
  const createMutation = useCreateRemitoMutation();
  const updateMutation = useUpdateRemitoMutation();
  const deleteMutation = useDeleteRemitoMutation();
  
  // Hooks condicionales - solo ejecutar si companyId está disponible
  const { estados: estadosActivos } = useEstadosByCompany(companyId || undefined);
  const { empresas } = useEmpresas();
  
  // Hook para productos
  const { productos: products } = useProductos(companyId || undefined);
  
  // Hook para clientes
  const { clientes: clients } = useClientes(companyId || undefined);
  const [statusChanging, setStatusChanging] = useState<string | null>(null);
  
  // Loading state management
  const { loading: loadingState, startLoading, stopLoading } = useLoading();

  // CRUD State Management
  const {
    editingItem: editingRemito,
    showForm,
    isSubmitting,
    handleNew: handleNewRemito,
    handleEdit: handleEditRemito,
    handleCloseForm,
    setIsSubmitting,
    showDeleteConfirm,
    handleDeleteRequest,
    handleCancelDelete
  } = useCRUDPage<Remito>();

  const { modalState, showSuccess: showModalSuccess, showError: showModalError, closeModal } = useMessageModal();
  const { toasts, showSuccess: showToastSuccess, showError: showToastError, removeToast } = useToast();
  const { updateStatus } = useDirectUpdate();

  // Configurar shortcuts de teclado
  useShortcuts([
    {
      key: 'n',
      action: handleNewRemito,
      description: 'Nuevo Remito'
    }
  ], !!companyId && !showForm);

  // Listener para FAB mobile
  useEffect(() => {
    const handleFABClick = (event: any) => {
      if (event.detail?.action === 'newRemito') {
        handleNewRemito();
      }
    };

    window.addEventListener('fabClick', handleFABClick);
    return () => window.removeEventListener('fabClick', handleFABClick);
  }, [handleNewRemito]);

  // 🚀 REACT QUERY: Ya no necesita loadData ni useEffect
  // React Query se encarga automáticamente del fetching y caching

  // Función de eliminación con useCallback para evitar problemas de hoisting
  const handleDeleteRemito = useCallback((remito: Remito) => {
    handleDeleteRequest(remito?.id, `Remito #${remito.number}, []`);
  }, [handleDeleteRequest]);

  const handlePrintRemito = useCallback((remito: Remito) => {
    // Crear iframe oculto para imprimir sin abrir nueva pestaña
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    printIframe.onload = () => {
      try {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
        
        // Remover iframe después de imprimir
        setTimeout(() => {
          document.body.removeChild(printIframe);
        }, 1000);
      } catch (error) {
        console.error('Error al imprimir:', error);
        document.body.removeChild(printIframe);
        showToastError('Error al abrir la impresión');
      }
    };

    printIframe.src = `/remitos/${remito?.id}/print`;
  }, [showToastError]);

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig,
    searchTerm,
    setSearchTerm
  } = useCRUDTable({
    data: remitos,
    loading: isLoading,
    searchFields: ['number', 'client?.name'],
    itemsPerPage: 10,
    onEdit: handleEditRemito,
    onDelete: handleDeleteRemito,
    onPrint: handlePrintRemito,
    onNew: handleNewRemito,
    getItemId: (remito) => remito?.id,
    emptyMessage: "No hay remitos",
    emptySubMessage: "Comienza creando un nuevo remito.",
    emptyIcon: <FileText className="empty-icon" />,
    newButtonText: "Nuevo Remito",
    searchPlaceholder: "Buscar remitos..."
  });

  // 🚀 REACT QUERY: Update status (sin modal, solo refetch silencioso)
  
  const handleStatusChange = async (remitoId: string, newStatusId: string) => {
    console.log('🔄 Cambiando estado:', { remitoId, newStatusId });
    setStatusChanging(remitoId);
    
    try {
      const response = await fetch(`/api/remitos/${remitoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatusId })
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || 'Error al actualizar el estado');
      }

       const result = await response.json();
       console.log('✅ Estado actualizado:', result);
 
       // Invalidar queries para refrescar datos - invalidar todas las queries de remitos
       await queryClient.invalidateQueries({ 
         queryKey: ['remitos'],
         exact: false
       });
       
       // También forzar refetch inmediato
       await queryClient.refetchQueries({ 
         queryKey: ['remitos', companyId],
         exact: false
       });
       
       // Mostrar toast de éxito
       showToastSuccess('Estado actualizado correctamente');
     } catch (error: any) {
       console.error('❌ Error updating status:', error);
       showToastError(error instanceof Error ? error.message : "Error al actualizar el estado");
     } finally {
       setStatusChanging(null);
     }
  };

  // 🚀 REACT QUERY: Delete con mutación
  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await deleteMutation.mutateAsync(showDeleteConfirm.id);
      handleCancelDelete();
      showToastSuccess("Remito eliminado correctamente");
    } catch (error: any) {
      handleCancelDelete();
      showToastError(error instanceof Error ? error.message : "Error al eliminar remito");
    }
  };

  // 🚀 REACT QUERY: Submit con mutaciones
  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingRemito) {
        await updateMutation.mutateAsync({ id: editingRemito.id, data: { ...data, companyId } });
        showToastSuccess("Remito actualizado correctamente");
        handleCloseForm();
      } else {
        const newRemito = await createMutation.mutateAsync({ ...data, companyId });
        showToastSuccess("Remito creado correctamente");
        handleCloseForm();
        
        // Abrir directamente página de impresión
        if (newRemito?.id && typeof newRemito.id === 'string') {
          setTimeout(() => {
            window.open(`/remitos/${newRemito.id}/print`, '_blank');
          }, 300);
        }
      }
    } catch (error: any) {
      console.error('Error al crear/actualizar remito:', error);
      showToastError(error instanceof Error ? error.message : "Error al guardar remito");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lógica simplificada: mostrar contenido si hay companyId o si es SUPERADMIN sin impersonar
  const needsCompanySelection = !companyId && currentUser?.role === "SUPERADMIN";

  // Definir columnas para el DataTable
  const columns: DataTableColumn<Remito>[] = [
    {
      key: 'number',
      label: 'Número',
      render: (remito) => (
        <div className="font-medium">#{remito.number}</div>
      )
    },
    {
      key: 'client',
      label: 'Cliente',
      render: (remito) => (
        <div className="font-medium">{remito.client.name}</div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (remito) => (
        remito.client.email ? (
          <div className="text-sm text-gray-600">{remito.client.email}</div>
        ) : (
          <span className="text-muted">Sin email</span>
        )
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (remito) => {
        // Validación para evitar errores de undefined
        if (!remito.status || !estadosActivos) {
          return <div className="text-gray-500">Sin estado</div>;
        }
        
        const isChanging = statusChanging === remito?.id;
        
        const estadoColor = remito.status?.color || '#9ca3af';
        const estadoName = remito.status?.name || 'Sin estado';
        
        return (
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '32px' }}>
             {/* Indicador de color del estado actual */}
             <div 
               style={{
                 width: '12px',
                 height: '12px',
                 borderRadius: '50%',
                 backgroundColor: estadoColor,
                 flexShrink: 0,
                 border: '1px solid rgba(0,0,0,0.1)'
               }}
               title={estadoName}
             />
             {/* Desplegable de estados con indicador visual y colores */}
             <div className="relative flex-1" style={{ minHeight: '32px' }}>
               <select
                 value={remito.status?.id || ''}
                 onChange={(e) => handleStatusChange(remito?.id, e.target.value)}
                 style={{
                   width: '100%',
                   height: '32px',
                   padding: '6px 32px 6px 12px',
                   borderRadius: '6px',
                   border: `2px solid ${estadoColor}`,
                   backgroundColor: `${estadoColor}15`,
                   color: '#1f2937',
                   fontWeight: '500',
                   fontSize: '14px',
                   cursor: 'pointer',
                   appearance: 'none',
                   backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
                   backgroundRepeat: 'no-repeat',
                   backgroundPosition: 'right 8px center',
                   transition: 'all 0.2s',
                   boxSizing: 'border-box'
                 }}
                 disabled={isChanging}
               >
                 {estadosActivos.map((estado) => {
                   const estadoOptionColor = estado?.color || '#9ca3af';
                   return (
                     <option 
                       key={estado?.id} 
                       value={estado?.id}
                       style={{
                         backgroundColor: `${estadoOptionColor}30`,
                         color: '#1f2937',
                         fontWeight: '500',
                         padding: '8px',
                       }}
                     >
                       {estado?.name}
                     </option>
                   );
                 })}
               </select>
              {isChanging && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded" style={{ height: '32px' }}>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'total',
      label: 'Total',
      render: (remito) => `$${remito.total.toFixed(2)}`
    },
    {
      key: 'createdAt',
      label: 'Registrado',
      render: (remito) => new Date(remito.createdAt).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  ];

  return (
    <main className="main-content">
      <div className="form-section">
        <h2>Gestión de Remitos</h2>
        
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
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar remitos..."
              />
            </div>
            <button
              onClick={handleNewRemito}
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
              <ShortcutText text="Nuevo Remito" shortcutKey="n" />
            </button>
          </div>
        )}

        {/* Contenido principal */}
        {needsCompanySelection ? (
          <div className="empty-state">
            <FileText className="empty-icon" />
            <p>Para ver los remitos, primero selecciona una empresa.</p>
          </div>
        ) : (
          <>
            {/* DataTable con paginación */}
            <DataTable
              {...tableConfig}
              columns={columns}
              showSearch={false}
              showNewButton={false}
            />
            <Pagination {...paginationConfig} />
          </>
        )}

        {/* Formulario de remito */}
        <RemitoFormComplete
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          editingRemito={editingRemito}
          clients={clients || []}
          products={products || []}
          estados={estadosActivos || []}
          companyId={companyId || undefined}
          onClientCreated={() => {
            // El cliente se cargará automáticamente en el próximo refetch
          }}
        />

        {/* Modal de confirmación de eliminación */}
        <DeleteConfirmModal
          isOpen={!!showDeleteConfirm}
          onCancel={handleCancelDelete}
          onConfirm={handleDelete}
          title="Eliminar Remito"
          message={`¿Estás seguro de que deseas eliminar el remito "${showDeleteConfirm?.name}"?`}
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

        {/* Toast notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </main>
  );
}

export default function RemitosPageFixed() {
  return (
    <Suspense fallback={
      <main className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    }>
      <RemitosContent />
    </Suspense>
  );
}
