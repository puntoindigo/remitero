"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Plus, Users, Building2, Mail, Phone } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { UsuarioForm } from "@/components/forms/UsuarioForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useUsuarios, type Usuario } from "@/hooks/useUsuarios";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useImpersonation } from "@/hooks/useImpersonation";
import { useDataWithCompany } from "@/hooks/useDataWithCompany";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";

function UsuariosContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompany();
  
  // Hook para manejar estado del formulario modal
  const {
    editingItem: editingUser,
    showForm,
    isSubmitting,
    handleNew,
    handleEdit,
    handleCloseForm,
    setIsSubmitting,
    showDeleteConfirm,
    handleDeleteRequest,
    handleCancelDelete
  } = useCRUDPage<Usuario>();
  
  const { modalState, showSuccess, showError, closeModal } = useMessageModal();
  const { startImpersonation, canImpersonate } = useImpersonation();
  
  const { 
    usuarios, 
    isLoading, 
    error, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario 
  } = useUsuarios(companyId || undefined);
  
  const { empresas, loadEmpresas } = useEmpresas();
  
  // Cargar empresas cuando se abre el formulario
  useEffect(() => {
    if (showForm && empresas.length === 0) {
      loadEmpresas();
    }
  }, [showForm, empresas.length, loadEmpresas]);

  // Función de eliminación con useCallback para evitar problemas de hoisting
  const handleDeleteUsuario = useCallback((usuario: Usuario) => {
    handleDeleteRequest(usuario.id, usuario.name);
  }, [handleDeleteRequest]);

  // CRUD Table configuration
  const {
    tableConfig,
    paginationConfig
  } = useCRUDTable({
    data: usuarios || [],
    loading: isLoading,
    searchFields: ['name', 'email', 'role'],
    itemsPerPage: 10,
    onEdit: handleEdit,
    onDelete: handleDeleteUsuario,
    onNew: handleNew,
    getItemId: (usuario) => usuario.id,
    emptyMessage: "No hay usuarios",
    emptySubMessage: "Comienza creando un nuevo usuario.",
    emptyIcon: <Users className="empty-icon" />,
    newButtonText: "Nuevo Usuario",
    searchPlaceholder: "Buscar usuarios..."
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await updateUsuario(editingUser.id, data);
        showSuccess("Usuario actualizado correctamente");
      } else {
        await createUsuario(data);
        showSuccess("Usuario creado correctamente");
      }
      handleCloseForm();
    } catch (error: any) {
      showError("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await deleteUsuario(showDeleteConfirm.id);
      handleCancelDelete();
      showSuccess("Usuario eliminado correctamente");
    } catch (error: any) {
      handleCancelDelete();
      showError("Error", error instanceof Error ? error.message : "Error al eliminar usuario");
    }
  };

  const handleImpersonate = async (usuario: Usuario) => {
    if (!canImpersonate(usuario)) {
      showError("Error", "No tienes permisos para impersonar a este usuario");
      return;
    }

    try {
      await startImpersonation(usuario.id);
      showSuccess("Impersonación iniciada", `Ahora estás viendo como ${usuario.name}`);
    } catch (error: any) {
      showError("Error", error.message);
    }
  };

  // Definir columnas para el DataTable
  const columns: DataTableColumn<Usuario>[] = [
    {
      key: 'name',
      label: 'Usuario',
      render: (usuario) => (
        <div className="usuario-info">
          <div className="usuario-name">{usuario.name}</div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (usuario) => (
        usuario.email ? (
          <div className="email-info">
            <Mail className="h-3 w-3 inline" />
            &nbsp;{usuario.email}
          </div>
        ) : (
          <span className="text-gray-400">Sin email</span>
        )
      )
    },
    {
      key: 'role',
      label: 'Rol',
      render: (usuario) => (
        <span className={`badge ${usuario.role === 'SUPERADMIN' ? 'badge-superadmin' : 
          usuario.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`} style={{ padding: '4%' }}>
          {usuario.role}
        </span>
      )
    },
    {
      key: 'company',
      label: 'Empresa',
      render: (usuario) => (
        usuario.company ? (
          <div className="company-info">
            <Building2 className="h-3 w-3 inline" />
            &nbsp;{usuario.company.name}
          </div>
        ) : (
          <span className="text-gray-400">Sin empresa</span>
        )
      )
    },
    {
      key: 'createdAt',
      label: 'Registrado',
      render: (usuario) => new Date(usuario.createdAt).toLocaleString('es-AR', {
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
      render: (usuario) => (
        <div className="flex gap-2">
          {canImpersonate(usuario) && (
            <button
              onClick={() => handleImpersonate(usuario)}
              className="btn small primary"
              title="Impersonar usuario"
            >
              <Users className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="form-section">
          <div className="loading">Cargando usuarios...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="px-4 py-6 sm:px-0">
        {/* Formulario */}
        <UsuarioForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingUser={editingUser}
          companies={empresas}
        />

        <div className="form-section">
          <h2>Gestión de Usuarios</h2>
          
          {/* Filtros adicionales */}
          <div className="category-filter-wrapper" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            {shouldShowCompanySelector && empresas.length > 0 && (
              <FilterableSelect
                options={[
                  { id: "", name: "Todas las empresas" },
                  ...empresas
                ]}
                value={selectedCompanyId}
                onChange={setSelectedCompanyId}
                placeholder="Seleccionar empresa"
                searchFields={["name"]}
                className="w-64"
              />
            )}
          </div>

          {/* DataTable con paginación */}
          <DataTable
            {...tableConfig}
            columns={columns}
            showSearch={true}
            showNewButton={true}
            onEdit={(usuario) => handleEdit(usuario)}
            onDelete={handleDeleteUsuario}
            actionsColumnLabel="Acciones"
          />
          <Pagination {...paginationConfig} />
        </div>

        {/* Modal de confirmación de eliminación */}
        <DeleteConfirmModal
          isOpen={!!showDeleteConfirm}
          onCancel={handleCancelDelete}
          onConfirm={handleDelete}
          title="Eliminar Usuario"
          message={`¿Estás seguro de que deseas eliminar el usuario "${showDeleteConfirm?.name}"?`}
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

export default function UsuariosPage() {
  return (
    <Suspense fallback={
      <main className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    }>
      <UsuariosContent />
    </Suspense>
  );
}
