"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, FileText, Calendar, User, Package } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useMessageModal } from "@/hooks/useMessageModal";
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
import { ABMHeader } from "@/components/common/ABMHeader";
import { useLoading } from "@/hooks/useLoading";
import { LoadingButton } from "@/components/common/LoadingButton";
import { RemitoFormComplete } from "@/components/forms/RemitoFormComplete";

interface Remito {
  id: string;
  number: string;
  client: {
    id: string;
    name: string;
    email?: string;
  };
  status: {
    id: string;
    name: string;
    color: string;
  };
  total: number;
  createdAt: string;
  updatedAt: string;
}

function RemitosContent() {
  const currentUser = useCurrentUserSimple();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

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

  // Verificar permisos - solo ADMIN y SUPERADMIN pueden acceder
  if (currentUser?.role === 'USER') {
    return (
      <main className="main-content">
        <div className="form-section">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
          </div>
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
  
  const [remitos, setRemitos] = useState<Remito[]>([]);
  
  // Hooks condicionales - solo ejecutar si companyId está disponible
  const { estados: estadosActivos } = useEstadosByCompany(companyId || undefined);
  const { empresas } = useEmpresas();
  
  // Hook para productos
  const { productos: products } = useProductos(companyId || undefined);
  
  // Hook para clientes
  const { clientes: clients, setClientes } = useClientes(companyId || undefined);
  const [isLoading, setIsLoading] = useState(true);
  
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

  const { modalState, showSuccess, showError, closeModal } = useMessageModal();
  const { updateStatus } = useDirectUpdate();

  const loadData = async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/remitos?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setRemitos(data || []);
      }
    } catch (error) {
      console.error('Error loading remitos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  // Función de eliminación con useCallback para evitar problemas de hoisting
  const handleDeleteRemito = useCallback((remito: Remito) => {
    handleDeleteRequest(remito.id, `Remito #${remito.number}`);
  }, [handleDeleteRequest]);

  const handlePrintRemito = useCallback((remito: Remito) => {
    window.open(`/remitos/${remito.id}/print`, '_blank');
  }, []);

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig,
    searchTerm,
    setSearchTerm
  } = useCRUDTable({
    data: remitos,
    loading: isLoading,
    searchFields: ['number', 'client.name'],
    itemsPerPage: 10,
    onEdit: handleEditRemito,
    onDelete: handleDeleteRemito,
    onPrint: handlePrintRemito,
    onNew: handleNewRemito,
    getItemId: (remito) => remito.id,
    emptyMessage: "No hay remitos",
    emptySubMessage: "Comienza creando un nuevo remito.",
    emptyIcon: <FileText className="empty-icon" />,
    newButtonText: "Nuevo Remito",
    searchPlaceholder: "Buscar remitos..."
  });

  const handleStatusChange = async (remitoId: string, newStatusId: string) => {
    try {
      const response = await fetch(`/api/remitos/${remitoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatusId }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }

      await loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      const response = await fetch(`/api/remitos/${showDeleteConfirm.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        handleCancelDelete();
        showSuccess("Remito eliminado correctamente", "Éxito");
        await loadData();
      } else {
        throw new Error('Error al eliminar remito');
      }
    } catch (error: any) {
      handleCancelDelete();
      showError("Error", error instanceof Error ? error.message : "Error al eliminar remito");
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const url = editingRemito ? `/api/remitos/${editingRemito.id}` : '/api/remitos';
      const method = editingRemito ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, companyId })
      });

      if (response.ok) {
        handleCloseForm();
        showSuccess(editingRemito ? "Remito actualizado correctamente" : "Remito creado correctamente", "Éxito");
        await loadData();
        
        // Si es un nuevo remito, abrir la página de impresión
        if (!editingRemito) {
          const newRemito = await response.json();
          window.open(`/remitos/${newRemito.id}/print`, '_blank');
        }
      } else {
        throw new Error('Error al guardar remito');
      }
    } catch (error: any) {
      showError("Error", error instanceof Error ? error.message : "Error al guardar remito");
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
        
        const isChanging = statusChanging === remito.id;
        
        return (
          <div className="remito-status-container">
            {/* Cuadro de color del estado actual */}
            <div 
              className="remito-status-color-box"
              style={{ backgroundColor: remito.status.color || '#ffffff' }}
              title={`Color del estado: ${remito.status.color || '#ffffff'}`}
            />
            
            {/* Desplegable de estados */}
            <div className="relative flex-1">
              <select
                value={remito.status.id}
                onChange={(e) => handleStatusChange(remito.id, e.target.value)}
                className="remito-status-select"
                disabled={isChanging}
              >
                {estadosActivos.map((estado) => (
                  <option 
                    key={estado.id} 
                    value={estado.id}
                  >
                    {estado.name}
                  </option>
                ))}
              </select>
              {isChanging && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
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
        
        {/* Header con selector de empresa, búsqueda y botón Nuevo */}
        <ABMHeader
          showCompanySelector={shouldShowCompanySelector}
          companies={empresas}
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={setSelectedCompanyId}
          showNewButton={!needsCompanySelection}
          newButtonText="Nuevo Remito"
          onNewClick={handleNewRemito}
          isSubmitting={isSubmitting}
          searchPlaceholder="Buscar remitos..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
        />

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
              showSearch={true}
              showNewButton={false} // Deshabilitar botón nuevo (ya tenemos uno independiente)
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
          onClientCreated={(newClient) => {
            // Actualizar la lista de clientes agregando el nuevo cliente al principio
            setClientes(prev => [newClient, ...(prev || [])]);
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
