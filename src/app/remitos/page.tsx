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
import { useDirectUpdate } from "@/hooks/useDirectUpdate";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDataWithCompany } from "@/hooks/useDataWithCompany";
import { useEstadosByCompany } from "@/hooks/useEstadosByCompany";
import { useEmpresas } from "@/hooks/useEmpresas";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";
import { RemitoForm } from "@/components/forms/RemitoForm";

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
  const { estados: estadosActivos } = useEstadosByCompany(companyId);
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
  const { updateStatus, confirmation } = useDirectUpdate();

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
    onDelete: handleDeleteRequest,
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
    const newStatus = estadosActivos?.find(estado => estado.id === newStatusId);
    if (!newStatus) {
      showError("Error", "Estado no encontrado");
      return;
    }

    const updateFunction = async (id: string, statusId: string) => {
      const response = await fetch(`/api/remitos/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: statusId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el estado');
      }

      // Actualizar el estado local
      setRemitos(prevRemitos =>
        prevRemitos.map(remito => {
          if (remito.id === id) {
            const status = estadosActivos?.find(estado => estado.id === statusId);
            return {
              ...remito,
              status: status ? {
                id: status.id,
                name: status.name,
                color: status.color
              } : remito.status
            };
          }
          return remito;
        })
      );

      // Recargar los datos para reflejar el cambio
      await loadData();
    };

    await updateStatus(
      remitoId,
      newStatusId,
      newStatus.name,
      updateFunction,
      {
        onSuccess: (message) => showSuccess(message),
        onError: (error) => showError("Error", error)
      }
    );
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

  const handleSubmit = async (data: any) => {
    if (!companyId) return;

    setIsSubmitting(true);
    try {
      const url = editingRemito ? `/api/remitos/${editingRemito.id}` : '/api/remitos';
      const method = editingRemito ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          companyId: companyId
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el remito');
      }

      await loadData();
      handleCloseForm();
      showSuccess(editingRemito ? "Remito actualizado correctamente" : "Remito creado correctamente");
    } catch (error: any) {
      console.error('Error saving remito:', error);
      showError("Error al guardar el remito", error.message);
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
        <div className="remito-info">
          <div className="remito-number">{remito.number}</div>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (remito) => formatDate(remito.createdAt)
    },
    {
      key: 'client',
      label: 'Cliente',
      render: (remito) => (
        <div className="client-info">
          <div className="client-name">{remito.client.name}</div>
        </div>
      )
    },
    {
      key: 'clientEmail',
      label: 'Email',
      render: (remito) => (
        <div className="client-email">
          {remito.client.email || <span className="text-gray-400">Sin email</span>}
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
          {estadosActivos?.map(estado => (
            <option key={estado.id} value={estado.id}>
              {estado.name}
            </option>
          )) || []}
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
        <div className="loading">Cargando remitos...</div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <section className="form-section">
        <h2>Gestión de Remitos</h2>
        
        {/* Formulario */}
        <RemitoForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          editingRemito={editingRemito}
          clients={clients}
          estados={estadosActivos}
        />
        
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
              showSearch={true}
              showNewButton={false} // Ya tenemos el botón arriba
            />
            <Pagination {...paginationConfig} />
          </>
        )}

        {/* Modal de confirmación de eliminación */}
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={handleCancelDelete}
          onConfirm={handleDelete}
          title="Eliminar Remito"
          message={`¿Estás seguro de que deseas eliminar el remito "${editingRemito?.number}"?`}
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

        {/* Modal de confirmación */}
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          onClose={confirmation.close}
          onConfirm={confirmation.confirm}
          title={confirmation.title}
          message={confirmation.message}
          type={confirmation.type}
          isLoading={confirmation.isLoading}
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
