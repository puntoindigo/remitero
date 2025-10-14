"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, FileText, Calendar, User, Package } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDataWithCompany } from "@/hooks/useDataWithCompany";
import { useEstadosRemitos } from "@/hooks/useEstadosRemitos";
import { useEmpresas } from "@/hooks/useEmpresas";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

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
  const { data: session } = useSession();
  const currentUser = useCurrentUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompany();
  
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const { estadosActivos } = useEstadosRemitos(companyId);
  const { empresas } = useEmpresas();
  
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Función de eliminación con useCallback para evitar problemas de hoisting
  const handleDeleteRemito = useCallback((remito: Remito) => {
    handleDeleteRequest(remito.id, `REM-${remito.number.toString().padStart(4, '0')}`);
  }, [handleDeleteRequest]);

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig
  } = useCRUDTable({
    data: remitos,
    loading: isLoading,
    searchFields: ['number', 'client.name'],
    itemsPerPage: 10,
    onEdit: handleEditRemito,
    onDelete: handleDeleteRemito,
    onNew: handleNewRemito,
    getItemId: (remito) => remito.id,
    emptyMessage: "No hay remitos",
    emptySubMessage: "Comienza creando un nuevo remito.",
    emptyIcon: <FileText className="empty-icon" />,
    newButtonText: "Nuevo Remito",
    searchPlaceholder: "Buscar remitos..."
  });

  const loadData = async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const [remitosRes, clientsRes] = await Promise.all([
        fetch(`/api/remitos?companyId=${companyId}`),
        fetch(`/api/clients?companyId=${companyId}`)
      ]);

      if (!remitosRes.ok || !clientsRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const [remitosData, clientsData] = await Promise.all([
        remitosRes.json(),
        clientsRes.json()
      ]);

      setRemitos(remitosData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showError("Error", "No se pudieron cargar los remitos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

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

      // Actualizar el estado local
      setRemitos(prevRemitos =>
        prevRemitos.map(remito => {
          if (remito.id === remitoId) {
            const newStatus = estadosActivos.find(estado => estado.id === newStatusId);
            return {
              ...remito,
              status: newStatus ? {
                id: newStatus.id,
                name: newStatus.name,
                color: newStatus.color
              } : remito.status
            };
          }
          return remito;
        })
      );

      showSuccess("Estado actualizado correctamente");
    } catch (error) {
      console.error('Error updating status:', error);
      showError("Error", "No se pudo actualizar el estado del remito");
    }
  };

  const handleDelete = async () => {
    if (!editingRemito) return;

    try {
      const response = await fetch(`/api/remitos/${editingRemito.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el remito');
      }

      await loadData();
      handleCancelDelete();
      showSuccess("Remito eliminado correctamente");
    } catch (error: any) {
      console.error('Error deleting remito:', error);
      handleCancelDelete();
      showError("Error", error.message);
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
        <div className="remito-info">
          <div className="remito-number">{remito.number}</div>
          <div className="remito-date text-sm text-gray-500">
            {formatDate(remito.createdAt)}
          </div>
        </div>
      )
    },
    {
      key: 'client',
      label: 'Cliente',
      render: (remito) => (
        <div className="client-info">
          <div className="client-name">{remito.client.name}</div>
          {remito.client.email && (
            <div className="client-email text-sm text-gray-500">
              {remito.client.email}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (remito) => (
        <select
          value={remito.status.id}
          onChange={(e) => handleStatusChange(remito.id, e.target.value)}
          className="status-select"
          style={{ 
            backgroundColor: remito.status.color + '20',
            borderColor: remito.status.color,
            color: remito.status.color
          }}
        >
          {estadosActivos.map(estado => (
            <option key={estado.id} value={estado.id}>
              {estado.name}
            </option>
          ))}
        </select>
      )
    },
    {
      key: 'total',
      label: 'Total',
      render: (remito) => `$${(Number(remito.total) || 0).toFixed(2)}`
    }
  ];

  if (isLoading) {
    return (
      <main className="main-content">
        <LoadingSpinner message="Cargando remitos..." />
      </main>
    );
  }

  return (
    <main className="main-content">
      <section className="form-section">
        <h2>Gestión de Remitos</h2>
        
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
              showSearch={false} // Ya tenemos filtros arriba
              showNewButton={false} // Ya tenemos el botón arriba
            />
            <Pagination {...paginationConfig} />
          </>
        )}

        {/* Modal de confirmación de eliminación */}
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onCancel={handleCancelDelete}
          onConfirm={handleDelete}
          title="Eliminar Remito"
          message={`¿Estás seguro de que deseas eliminar el remito "${showDeleteConfirm?.name || 'este remito'}"?`}
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
      </section>
    </main>
  );
}

export default function RemitosPage() {
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
