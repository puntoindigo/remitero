"use client";

import React, { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Plus, Building2, Users } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import Link from "next/link";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { EmpresaForm } from "@/components/forms/EmpresaForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";

function EmpresasContent() {
  const { data: session } = useSession();
  const {
    editingItem: editingCompany,
    showForm,
    isSubmitting,
    handleNew,
    handleEdit,
    handleCloseForm,
    setIsSubmitting,
    showDeleteConfirm,
    handleDeleteRequest,
    handleCancelDelete
  } = useCRUDPage<Empresa>();
  const { modalState, showSuccess, showError, closeModal } = useMessageModal();
  
  const { 
    empresas, 
    isLoading, 
    error, 
    createEmpresa, 
    updateEmpresa, 
    deleteEmpresa 
  } = useEmpresas();

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig
  } = useCRUDTable({
    data: empresas,
    loading: isLoading,
    searchFields: ['name'],
    itemsPerPage: 10,
    onEdit: handleEdit,
    onDelete: (empresa) => handleDeleteRequest(empresa.id, empresa.name),
    onNew: handleNew,
    getItemId: (empresa) => empresa.id,
    emptyMessage: "No hay empresas",
    emptySubMessage: "Comienza creando una nueva empresa.",
    emptyIcon: <Building2 className="empty-icon" />,
    newButtonText: "Nueva Empresa",
    searchPlaceholder: "Buscar empresas..."
  });

  // Definir columnas del DataTable
  const columns: DataTableColumn<Empresa>[] = [
    { 
      key: 'name', 
      label: 'Nombre',
      render: (empresa) => (
        <div className="empresa-info">
          <div className="empresa-name">{empresa.name}</div>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Registrado',
      render: (empresa) => new Date(empresa.createdAt).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (empresa) => (
        <div className="flex gap-2">
          <Link
            href={`/usuarios?companyId=${empresa.id}`}
            className="btn small primary"
            title="Ver usuarios de esta empresa"
          >
            <Users className="h-4 w-4 mr-2" />
            Ver Usuarios
          </Link>
        </div>
      )
    }
  ];

  const onSubmit = async (data: { name: string }) => {
    try {
      setIsSubmitting(true);
      
      if (editingCompany) {
        await updateEmpresa(editingCompany.id, data.name);
        showSuccess("Éxito", "Empresa actualizada correctamente");
      } else {
        await createEmpresa(data.name);
        showSuccess("Éxito", "Empresa creada correctamente");
      }
      
      handleCloseForm();
    } catch (error) {
      console.error("Error saving company:", error);
      showError("Error", error instanceof Error ? error.message : "Error al guardar empresa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await deleteEmpresa(showDeleteConfirm.id);
      handleCancelDelete();
      showSuccess("Éxito", "Empresa eliminada correctamente");
    } catch (error) {
      console.error("Error deleting company:", error);
      handleCancelDelete();
      showError("Error", error instanceof Error ? error.message : "Error al eliminar empresa");
    }
  };

  if (session?.user?.role !== "SUPERADMIN") {
    return (
      <main className="main-content">
        <div className="form-section">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta sección.</p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="form-section">
          <h2>Gestión de Empresas</h2>
          <p>Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <section className="form-section">
        <h2>Gestión de Empresas</h2>
        
        <EmpresaForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingEmpresa={editingCompany}
        />
        
        <div className="form-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Lista de Empresas</h3>
            {!showForm && (
              <button onClick={handleNew} className="primary">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Empresa
              </button>
            )}
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <DataTable
            {...tableConfig}
            columns={columns}
            showSearch={true}
            showNewButton={true}
          />
          <Pagination {...paginationConfig} />
        </div>
      </section>

      <MessageModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        details={modalState.details}
      />
      
      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
        title="Eliminar empresa"
        message="¿Estás seguro de que deseas eliminar esta empresa?"
        itemName={showDeleteConfirm?.name}
      />
    </main>
  );
}

export default function EmpresasPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EmpresasContent />
    </Suspense>
  );
}