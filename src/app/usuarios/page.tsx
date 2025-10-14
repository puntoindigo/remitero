"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Plus, Users, Building2, Mail, Phone, Edit, Trash2 } from "lucide-react";
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
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

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

  // Leer companyId de los searchParams si está presente
  const companyIdFromParams = searchParams.get('companyId');
  
  // Efecto para establecer la empresa seleccionada desde los parámetros
  React.useEffect(() => {
    if (companyIdFromParams && shouldShowCompanySelector) {
      setSelectedCompanyId(companyIdFromParams);
    }
  }, [companyIdFromParams, shouldShowCompanySelector, setSelectedCompanyId]);
  
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
        showSuccess("Éxito", "Usuario actualizado correctamente");
      } else {
        await createUsuario(data);
        showSuccess("Éxito", "Usuario creado correctamente");
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
      showSuccess("Éxito", `Impersonación iniciada. Ahora estás viendo como ${usuario.name}`);
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
        <div className="flex gap-3">
          <button
            onClick={() => handleEdit(usuario)}
            className="btn small secondary"
            title="Editar usuario"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteUsuario(usuario)}
            className="btn small danger"
            title="Eliminar usuario"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
          <LoadingSpinner message="Cargando usuarios..." />
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
          companyId={companyId}
        />

        <div className="form-section">
          <h2>Gestión de Usuarios</h2>
          
          {/* Selector de empresa - siempre arriba, ancho completo */}
          {shouldShowCompanySelector && empresas.length > 0 && (
            <div className="company-selector-wrapper" style={{ marginBottom: '1rem' }}>
              <FilterableSelect
                options={[
                  { id: "", name: "Todas las empresas" },
                  ...empresas
                ]}
                value={selectedCompanyId}
                onChange={setSelectedCompanyId}
                placeholder="Seleccionar empresa"
                searchFields={["name"]}
                className="w-full"
              />
            </div>
          )}

          {/* Barra de búsqueda y botón nuevo - siempre visible */}
          <div className="search-and-action-row" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {/* Campo de búsqueda manual */}
              <div style={{ width: '300px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={tableConfig.searchValue || ''}
                  onChange={(e) => tableConfig.onSearchChange?.(e.target.value)}
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
                {(tableConfig.searchValue || '').length > 0 && (
                  <button
                    type="button"
                    onClick={() => tableConfig.onSearchChange?.('')}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#6b7280';
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Limpiar búsqueda"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
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
              Nuevo Usuario
            </button>
          </div>

          {/* DataTable con paginación */}
          <DataTable
            {...tableConfig}
            columns={columns}
            showSearch={false}
            showNewButton={false}
            showActions={false}
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
