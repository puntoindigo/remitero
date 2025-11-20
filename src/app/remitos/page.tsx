"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, FileText, Calendar, User, Package, Printer, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { PrintRemitoModal } from "@/components/common/PrintRemitoModal";
import { ToastContainer } from "@/components/common/Toast.jsx";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useToast } from "@/hooks/useToast.js";
import { useDirectUpdate } from "@/hooks/useDirectUpdate";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { useDataWithCompanySimple } from "@/hooks/useDataWithCompanySimple";
import { useEstadosRemitosQuery } from "@/hooks/queries/useEstadosRemitosQuery";
import { useEmpresas } from "@/hooks/useEmpresas";
import { CompanySelector } from "@/components/common/CompanySelector";
import { useProductosQuery } from "@/hooks/queries/useProductosQuery";
import { useClientesQuery, clienteKeys } from "@/hooks/queries/useClientesQuery";
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
import { useColorTheme } from "@/contexts/ColorThemeContext";
import { useIsMobile } from "@/hooks/useIsMobile";

function RemitosContent() {
  const currentUser = useCurrentUserSimple();
  const { colors } = useColorTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompanySimple();
  
  // 🚀 REACT QUERY: Reemplaza state y fetch
  // Paginación server-side
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const { data: remitosPage, isLoading } = useRemitosQuery(companyId || undefined, page, pageSize);
  const remitos = (remitosPage?.items as any) || [];
  const totalRemitos = remitosPage?.total || remitos?.length || 0;
  const createMutation = useCreateRemitoMutation();
  const updateMutation = useUpdateRemitoMutation();
  const deleteMutation = useDeleteRemitoMutation();
  
  // Estados con React Query (cache + dedupe)
  const { data: estadosActivos = [] } = useEstadosRemitosQuery(companyId || undefined);
  const { empresas, isLoading: empresasLoading } = useEmpresas();
  
  // Productos y clientes con React Query (evita dobles fetch en dev)
  // Definidos más abajo cuando ya tenemos showForm
  const [statusChanging, setStatusChanging] = useState<string | null>(null);
  
  // Filtro de estado: se inicializa desde la URL (si existe); caso contrario, 'all'
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>(() => {
    if (typeof window === 'undefined') return 'all';
    const urlStatus = new URLSearchParams(window.location.search).get('status');
    // Mapeo por nombre/id se hará cuando los estados estén cargados
    return urlStatus ? '' : 'all';
  });
  
  // Filtro de cliente: se inicializa desde la URL (si existe); caso contrario, 'all'
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>(() => {
    if (typeof window === 'undefined') return 'all';
    const urlClient = new URLSearchParams(window.location.search).get('client');
    return urlClient ? urlClient : 'all';
  });
  
  // Estados para modales y confirmaciones
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [remitoToPrint, setRemitoToPrint] = useState<Remito | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [remitoToView, setRemitoToView] = useState<Remito | null>(null);
  
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
    setEditingItem,
    showDeleteConfirm,
    handleDeleteRequest,
    handleCancelDelete
  } = useCRUDPage<Remito>();

  // Ahora que ya conocemos showForm, cargar productos y clientes solo cuando se abre el formulario
  const { data: products = [] } = useProductosQuery(showForm ? (companyId || undefined) : undefined);
  const { data: clients = [], refetch: refetchClientes } = useClientesQuery(showForm ? (companyId || undefined) : undefined);
  
  // Cargar clientes para el filtro (siempre, no solo cuando se abre el formulario)
  const { data: allClients = [] } = useClientesQuery(companyId || undefined);

  const { modalState, showSuccess: showModalSuccess, showError: showModalError, closeModal } = useMessageModal();
  const { toasts, showSuccess: showToastSuccess, showError: showToastError, removeToast } = useToast();
  const { updateStatus } = useDirectUpdate();

  // Función de eliminación con useCallback (después de que handleDeleteRequest esté definido)
  const handleDeleteRemito = useCallback((remito: Remito) => {
    handleDeleteRequest(remito?.id, `Remito #${remito.number}`);
  }, [handleDeleteRequest]);

  const handlePrintRemito = useCallback((remito: Remito) => {
    setRemitoToPrint(remito);
    setShowPrintConfirm(true);
  }, []);

  const handleViewPDF = useCallback((remito: Remito) => {
    setRemitoToView(remito);
    setShowPDFModal(true);
  }, []);

  // Refs para evitar loops infinitos entre URL y estado
  const isUpdatingFromUrl = useRef(false);
  const isInitialClientLoad = useRef(true);
  const isInitialStatusLoad = useRef(true);

  // Si viene ?status= en la URL con nombre (con _ por espacios) o id, mapearlo a id cuando tengamos los estados
  useEffect(() => {
    if (!estadosActivos || estadosActivos.length === 0) return;
    
    // Solo leer de la URL en el mount inicial o cuando cambia la URL externamente
    if (isInitialStatusLoad.current) {
      isInitialStatusLoad.current = false;
      const urlStatus = searchParams.get('status');
      if (urlStatus) {
        const normalizedName = urlStatus.replace(/_/g, ' ').toUpperCase();
        const match = estadosActivos.find(e => e.id === urlStatus || (e.name || '').toUpperCase() === normalizedName);
        if (match && selectedStatusFilter !== match.id) {
          isUpdatingFromUrl.current = true;
          setSelectedStatusFilter(match.id);
          setTimeout(() => { isUpdatingFromUrl.current = false; }, 0);
        }
      } else if (selectedStatusFilter !== 'all') {
        isUpdatingFromUrl.current = true;
        setSelectedStatusFilter('all');
        setTimeout(() => { isUpdatingFromUrl.current = false; }, 0);
      }
    }
  }, [estadosActivos]); // Solo cuando cambian los estados, no cuando cambia selectedStatusFilter

  // Empujar cambios del filtro de estado a la URL usando el NOMBRE (con guiones bajos)
  // Solo cuando el usuario cambia el filtro manualmente, no cuando viene de la URL
  useEffect(() => {
    if (isUpdatingFromUrl.current || isInitialStatusLoad.current) return;
    if (!estadosActivos || estadosActivos.length === 0) return;
    
    const currentParam = searchParams.get('status') || "";
    const params = new URLSearchParams(searchParams as any);
    
    if (selectedStatusFilter && selectedStatusFilter !== 'all') {
      const estado = estadosActivos.find(e => e.id === selectedStatusFilter);
      const statusSlug = (estado?.name || '').trim().replace(/\s+/g, '_').toUpperCase();
      if (statusSlug && currentParam !== statusSlug) {
        params.set('status', statusSlug);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    } else if (currentParam) {
      params.delete('status');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : `${pathname}` , { scroll: false });
    }
  }, [selectedStatusFilter]); // Solo cuando cambia selectedStatusFilter manualmente

  // Actualizar filtro de cliente desde la URL (solo lectura, no escritura)
  useEffect(() => {
    const urlClient = searchParams.get('client');
    if (isInitialClientLoad.current) {
      isInitialClientLoad.current = false;
      if (urlClient && urlClient !== selectedClientFilter) {
        isUpdatingFromUrl.current = true;
        setSelectedClientFilter(urlClient);
        setTimeout(() => { isUpdatingFromUrl.current = false; }, 0);
      }
      return;
    }
    
    // Solo actualizar si la URL cambió externamente
    if (urlClient && urlClient !== selectedClientFilter) {
      isUpdatingFromUrl.current = true;
      setSelectedClientFilter(urlClient);
      setTimeout(() => { isUpdatingFromUrl.current = false; }, 0);
    } else if (!urlClient && selectedClientFilter !== 'all' && selectedClientFilter !== '') {
      isUpdatingFromUrl.current = true;
      setSelectedClientFilter('all');
      setTimeout(() => { isUpdatingFromUrl.current = false; }, 0);
    }
  }, [searchParams]); // Solo cuando cambia searchParams (URL)
  
  // Empujar cambios del filtro de cliente a la URL (solo cuando el usuario cambia el filtro manualmente)
  useEffect(() => {
    if (isUpdatingFromUrl.current || isInitialClientLoad.current) return;
    
    const urlClient = searchParams.get('client') || '';
    
    // Si el estado coincide con la URL, no hacer nada
    if ((selectedClientFilter === 'all' && !urlClient) || 
        (selectedClientFilter !== 'all' && urlClient === selectedClientFilter)) {
      return;
    }
    
    const params = new URLSearchParams(searchParams as any);
    
    if (selectedClientFilter && selectedClientFilter !== 'all') {
      params.set('client', selectedClientFilter);
    } else {
      params.delete('client');
    }
    
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : `${pathname}`, { scroll: false });
  }, [selectedClientFilter]); // Solo cuando cambia selectedClientFilter manualmente

  // Configurar shortcuts de teclado (después de que handleNewRemito y showForm estén definidos)
  // Usar useEffect para asegurar que se ejecute después de la inicialización completa
  useEffect(() => {
    if (!handleNewRemito || !companyId || showForm) return;
    
    // Configurar shortcut manualmente para evitar problemas de inicialización
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        handleNewRemito();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNewRemito, companyId, showForm]);

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

  // Detectar si viene de /nuevo y abrir formulario
  useEffect(() => {
    const openForm = searchParams.get('openForm');
    if (openForm === 'true' && !showForm && companyId) {
      handleNewRemito();
      // Limpiar el parámetro de la URL
      const params = new URLSearchParams(searchParams as any);
      params.delete('openForm');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, companyId, showForm]); // Solo ejecutar cuando cambien searchParams o companyId

  // Filtrar remitos por estado y cliente
  const filteredRemitos = useMemo(() => {
    if (!remitos) return remitos;
    
    let filtered = remitos;
    
    // Filtrar por estado
    if (selectedStatusFilter && selectedStatusFilter !== 'all') {
      const isKnownStatus = (estadosActivos || []).some(e => e.id === selectedStatusFilter);
      if (isKnownStatus) {
        filtered = filtered.filter((remito: Remito) => remito.status?.id === selectedStatusFilter);
      }
    }
    
    // Filtrar por cliente
    if (selectedClientFilter && selectedClientFilter !== 'all') {
      filtered = filtered.filter((remito: Remito) => remito.client?.id === selectedClientFilter);
    }
    
    return filtered;
  }, [remitos, selectedStatusFilter, selectedClientFilter, estadosActivos]);

  // Ya no redirigimos a mobile - la nueva navegación maneja todo

  // Prevenir errores de client-side exception (DESPUÉS de todos los hooks)
  if (!currentUser) {
    return (
      <main className="main-content">
        <div className="form-section">
          <LoadingSpinner message="Cargando usuario..." />
        </div>
      </main>
    );
  }

  // 🚀 REACT QUERY: Ya no necesita loadData ni useEffect
  // React Query se encarga automáticamente del fetching y caching

  // CRUD Table configuration - usar remitos filtrados
  const {
    tableConfig,
    // paginationConfig,
    searchTerm,
    setSearchTerm
  } = useCRUDTable({
    data: filteredRemitos,
    loading: isLoading,
    searchFields: ['number', 'client?.name'],
    itemsPerPage: 10,
    onEdit: async (remito) => {
      try {
        if (!remito?.id) return;
        const resp = await fetch(`/api/remitos/${remito.id}`);
        const full = resp.ok ? await resp.json() : remito;
        setEditingItem(full as any);
        handleEditRemito(full as any);
      } catch {
        handleEditRemito(remito);
      }
    },
    onDelete: handleDeleteRemito,
    onPrint: handlePrintRemito,
    onViewPDF: !isMobile ? handleViewPDF : undefined,
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
        
        // Ofrecer imprimir el remito recién creado solo en desktop
        if (newRemito?.number && !isMobile) {
          setRemitoToPrint(newRemito as any);
          setShowPrintConfirm(true);
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

  // Definir columnas para el DataTable - desktop: número, fecha, cliente, total, estado, acciones
  const columns: DataTableColumn<Remito>[] = isMobile ? [
    // Mobile: unificar número y fecha en una celda
    {
      key: 'number-date',
      label: 'Remito',
      render: (remito) => {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
              #{remito.number}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {formatDateTime(remito.createdAt)}
            </div>
          </div>
        );
      }
    },
    {
      key: 'client',
      label: 'Cliente',
      render: (remito) => remito.client?.name || 'Sin cliente'
    },
    {
      key: 'total',
      label: 'Total',
      render: (remito) => `$ ${remito.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  ] : [
    {
      key: 'number',
      label: 'Número',
      render: (remito) => `#${remito.number}`
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (remito) => formatDateTime(remito.createdAt)
    },
    {
      key: 'client',
      label: 'Cliente',
      render: (remito) => remito.client?.name || 'Sin cliente'
    },
    {
      key: 'total',
      label: 'Total',
      render: (remito) => `$ ${remito.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      key: 'status',
      label: 'Estado',
      render: (remito) => {
        const estado = remito.status && estadosActivos.find(e => e.id === remito.status?.id);
        if (!estado) return 'Sin estado';
        return (
          <span style={{ 
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: `${estado.color}20`,
            color: estado.color,
            fontSize: '12px',
            fontWeight: 500
          }}>
            {estado.name}
          </span>
        );
      }
    }
  ];

  return (
    <>
      {/* Toast notifications - arriba de toda la pantalla */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <main className="main-content">
        <div className="form-section">
        {/* Título Remitos - siempre visible para SUPERADMIN */}
        {currentUser?.role === "SUPERADMIN" && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem',
            padding: '0 16px'
          }}>
            <h2 className="page-title-desktop" style={{ 
              fontSize: isMobile ? '24px' : undefined, 
              fontWeight: isMobile ? 700 : undefined, 
              color: isMobile ? '#111827' : undefined,
              marginBottom: 0,
              marginTop: '0',
              padding: 0
            }}>
              Remitos
            </h2>
            <CompanySelector
              selectedCompanyId={selectedCompanyId}
              setSelectedCompanyId={setSelectedCompanyId}
            />
          </div>
        )}
        {currentUser?.role !== "SUPERADMIN" && (
          <h2 className="page-title-desktop" style={{ 
            fontSize: isMobile ? '24px' : undefined, 
            fontWeight: isMobile ? 700 : undefined, 
            color: isMobile ? '#111827' : undefined,
            marginBottom: '0.75rem',
            marginTop: '0',
            padding: '0 16px'
          }}>
            Remitos
          </h2>
        )}

        {/* Barra de búsqueda y filtros */}
        {!needsCompanySelection && (
          <div style={{ 
            padding: '0 16px',
            marginBottom: '1rem',
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: '0.75rem',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: isMobile ? 'stretch' : 'space-between'
          }}>
            {/* Desktop: todos en una línea, Mobile: columna */}
            <div style={{ width: isMobile ? '100%' : '300px', flexShrink: 0 }}>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar remitos..."
              />
            </div>
            
            <div style={{ width: isMobile ? '100%' : '200px', flexShrink: 0 }}>
              <FilterableSelect
                options={[
                  { id: 'all', name: 'Todos los clientes' },
                  ...(allClients || []).map((cliente) => ({
                    id: cliente.id,
                    name: cliente.name
                  }))
                ]}
                value={selectedClientFilter}
                onChange={(value) => setSelectedClientFilter(value || 'all')}
                placeholder="Cliente"
                searchFields={["name"]}
                useThemeColors={true}
              />
            </div>
            
            <div style={{ width: isMobile ? '100%' : '220px', flexShrink: 0 }}>
              <FilterableSelect
                options={[
                  { id: 'all', name: 'Todos los estados' },
                  ...(estadosActivos || []).map((estado) => ({
                    id: estado.id,
                    name: estado.name,
                    color: estado.color
                  }))
                ]}
                value={selectedStatusFilter}
                onChange={(value) => setSelectedStatusFilter(value || 'all')}
                placeholder="Estado"
                searchFields={["name"]}
                showColors={true}
                searchable={false}
                useThemeColors={true}
              />
            </div>
            
            {/* Botón Nuevo Remito - solo en desktop */}
            {!isMobile && (
              <button
                onClick={handleNewRemito}
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
                Nuevo Remito
              </button>
            )}
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
              onEdit={handleEditRemito}
              onDelete={handleDeleteRemito}
            />
                <Pagination 
                  currentPage={page}
                  totalPages={Math.max(1, Math.ceil(totalRemitos / pageSize))}
                  totalItems={totalRemitos}
                  itemsPerPage={pageSize}
                  onPageChange={(p) => setPage(Math.max(1, p))}
                />
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
          onClientCreated={async (newClient: any) => {
            // Invalidar todas las queries de clientes
            queryClient.invalidateQueries({ 
              queryKey: clienteKeys.lists(),
              exact: false
            });
            // Forzar refetch directo del hook si está disponible y está habilitado
            if (refetchClientes && companyId) {
              try {
                await refetchClientes();
              } catch (error) {
                console.error('Error refetching clientes:', error);
              }
            }
            // Siempre intentar refetch desde queryClient también (fallback seguro)
            try {
              await queryClient.refetchQueries({ 
                queryKey: clienteKeys.list(companyId || undefined),
                exact: false
              });
            } catch (error) {
              console.error('Error refetching clientes from queryClient:', error);
            }
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

        {/* Toast notifications - movido fuera del contenido principal */}

        {/* Modal de confirmación para imprimir */}
        <ConfirmationModal
          isOpen={showPrintConfirm}
          onClose={() => {
            setShowPrintConfirm(false);
            setRemitoToPrint(null);
          }}
          onConfirm={() => {
            if (remitoToPrint?.id) {
              // Usar ID del remito (único globalmente) en lugar del número
              window.open(`/remitos/${remitoToPrint.id}/print`, '_blank');
            }
            setShowPrintConfirm(false);
            setRemitoToPrint(null);
          }}
          title="¿Imprimir remito?"
          message={`¿Deseas imprimir el remito #${remitoToPrint?.number} ahora?`}
          type="info"
          confirmText="Sí, imprimir"
          cancelText="No"
        />

        {/* Modal para ver PDF del remito */}
        {showPDFModal && remitoToView?.id && (
          <PrintRemitoModal
            remitoId={remitoToView.id}
            remitoNumber={remitoToView.number}
            onClose={() => {
              setShowPDFModal(false);
              setRemitoToView(null);
            }}
          />
        )}
      </div>
    </main>
    </>
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
