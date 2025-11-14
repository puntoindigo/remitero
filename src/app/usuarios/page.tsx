"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, Users, Building2, Mail, Phone, Edit, Trash2, Activity } from "lucide-react";
import { StatusToggle } from "@/components/common/StatusToggle";
import { formatDate } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { ToastContainer } from "@/components/common/Toast.jsx";
import { UsuarioForm } from "@/components/forms/UsuarioForm";
import { UserActivityLogModal } from "@/components/common/UserActivityLogModal";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useToast } from "@/hooks/useToast.js";
import { useUsuarios } from "@/hooks/useUsuarios";
import { useUsuariosQuery, type Usuario, usuarioKeys } from "@/hooks/queries/useUsuariosQuery";
import { useQueryClient } from "@tanstack/react-query";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useImpersonation } from "@/hooks/useImpersonation";
import { useDataWithCompanySimple } from "@/hooks/useDataWithCompanySimple";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useLoading } from "@/hooks/useLoading";
import { LoadingButton } from "@/components/common/LoadingButton";
import { useShortcuts } from "@/hooks/useShortcuts";
import { ShortcutText } from "@/components/common/ShortcutText";
import { SearchInput } from "@/components/common/SearchInput";
import { useColorTheme } from "@/contexts/ColorThemeContext";

function UsuariosContent() {
  const currentUser = useCurrentUserSimple();
  const { colors } = useColorTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Bloquear acceso para usuarios con rol USER
  if (currentUser?.role === 'USER') {
    return (
      <main className="main-content">
        <div className="form-section">
          <div className="empty-state">
            <Users className="empty-icon" style={{ color: '#ef4444' }} />
            <h3 style={{ color: '#ef4444', marginTop: '1rem' }}>Acceso Denegado</h3>
            <p>No tienes permisos para ver la gestión de usuarios.</p>
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
  
  // Loading state management
  const { loading: loadingState, startLoading, stopLoading } = useLoading();

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
  const { toasts, showSuccess: showToastSuccess, showError: showToastError, removeToast } = useToast();
  const { startImpersonation, canImpersonate } = useImpersonation();
  const [toggleActiveUser, setToggleActiveUser] = useState<Usuario | null>(null);
  const [selectedUserForLogs, setSelectedUserForLogs] = useState<Usuario | null>(null);
  const [userToResendInvitation, setUserToResendInvitation] = useState<Usuario | null>(null);
  const [isResendingInvitation, setIsResendingInvitation] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: usuarios = [], isLoading, error } = useUsuariosQuery(companyId || undefined);
  
  
  // Reusar mutaciones del hook legacy para operaciones de escritura
  const { createUsuario, updateUsuario, deleteUsuario } = useUsuarios(companyId || undefined);
  
  const { empresas, loadEmpresas, isLoading: empresasLoading } = useEmpresas();
  
  // Cargar empresas cuando se abre el formulario (solo para SUPERADMIN)
  useEffect(() => {
    if (showForm && empresas?.length === 0 && loadEmpresas) {
      loadEmpresas();
    }
  }, [showForm, empresas?.length, loadEmpresas]);

  // Función de eliminación con useCallback para evitar problemas de hoisting
  const handleDeleteUsuario = useCallback((usuario: Usuario) => {
    handleDeleteRequest(usuario?.id, usuario?.name);
  }, [handleDeleteRequest]);

  // Detectar si viene de /nuevo y abrir formulario
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
      description: 'Nuevo Usuario'
    }
  ], !!companyId && !showForm);

  // Listener para FAB mobile
  useEffect(() => {
    const handleFABClick = (event: any) => {
      if (event.detail?.action === 'newUsuario') {
        handleNew();
      }
    };

    window.addEventListener('fabClick', handleFABClick);
    return () => window.removeEventListener('fabClick', handleFABClick);
  }, [handleNew]);

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
    getItemId: (usuario) => usuario?.id,
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
        await updateUsuario(editingUser?.id, data);
        showSuccess("Éxito", "Usuario actualizado correctamente");
      } else {
        await createUsuario(data);
        showSuccess("Éxito", "Usuario creado correctamente");
      }
      // Invalidar la query de React Query para refrescar la lista
      await queryClient.invalidateQueries({ 
        queryKey: usuarioKeys.lists(),
        exact: false
      });
      handleCloseForm();
    } catch (error: any) {
      showError(error.message || "Error al guardar el usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await deleteUsuario(showDeleteConfirm?.id);
      // Invalidar la query de React Query para refrescar la lista
      await queryClient.invalidateQueries({ 
        queryKey: usuarioKeys.lists(),
        exact: false
      });
      handleCancelDelete();
      showToastSuccess("Usuario eliminado correctamente");
    } catch (error: any) {
      handleCancelDelete();
      showToastError(error instanceof Error ? error.message : "Error al eliminar usuario");
    }
  };

  const handleResendInvitation = async () => {
    if (!userToResendInvitation) return;
    
    setIsResendingInvitation(true);
    try {
      const response = await fetch(`/api/users/${userToResendInvitation.id}/resend-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al reenviar invitación');
      }

      setUserToResendInvitation(null);
      showToastSuccess("Invitación reenviada correctamente");
      
      // Invalidar y refetch la query para refrescar la lista y mostrar la nueva actividad
      await queryClient.invalidateQueries({ 
        queryKey: usuarioKeys.lists(),
        exact: false
      });
      // Forzar refetch inmediato
      await queryClient.refetchQueries({ 
        queryKey: usuarioKeys.lists(),
        exact: false
      });
    } catch (error: any) {
      showToastError(error instanceof Error ? error.message : "Error al reenviar invitación");
    } finally {
      setIsResendingInvitation(false);
    }
  };

  const handleImpersonate = async (usuario: Usuario) => {
    if (!canImpersonate(usuario)) {
      showError("No tienes permisos para impersonar a este usuario");
      return;
    }

    try {
      await startImpersonation(usuario?.id);
      showSuccess("Éxito", `Impersonación iniciada. Ahora estás viendo como ${usuario?.name}`);
    } catch (error: any) {
      showError(error.message || "Error al impersonar usuario");
    }
  };

  const handleToggleActive = (usuario: Usuario) => {
    setToggleActiveUser(usuario);
  };

  const confirmToggleActive = async () => {
    if (!toggleActiveUser) return;

    const newActiveState = !(toggleActiveUser.is_active ?? true);
    const action = newActiveState ? 'activar' : 'desactivar';

    try {
      const response = await fetch(`/api/users/${toggleActiveUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: newActiveState
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar el estado del usuario');
      }

      // Invalidar la query para refrescar la lista
      await queryClient.invalidateQueries({ 
        queryKey: usuarioKeys.lists(),
        exact: false
      });

      showSuccess("Éxito", `Usuario ${action === 'activar' ? 'activado' : 'desactivado'} correctamente`);
      setToggleActiveUser(null);
    } catch (error: any) {
      showError(error.message || `Error al ${action} el usuario`);
      setToggleActiveUser(null);
    }
  };

  // Determinar si mostrar columnas de Empresa e Impersonar
  const isSuperAdmin = currentUser?.role === 'SUPERADMIN';
  // Solo mostrar columna Empresa si es SUPERADMIN Y no hay una empresa seleccionada (mostrando todas)
  const showCompanyColumn = isSuperAdmin && (!selectedCompanyId || selectedCompanyId === '');
  
  // Definir columnas para el DataTable
  const columns: DataTableColumn<Usuario>[] = [
    {
      key: 'name',
      label: 'Usuario',
      width: showCompanyColumn ? '120px' : '150px', // Más espacio si no hay columna Empresa
      render: (usuario: Usuario) => (
        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          {usuario?.name}
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (usuario) => (
        usuario?.email ? (
          <div className="email-info">
            <Mail className="h-3 w-3 inline" />
            &nbsp;{usuario?.email}
          </div>
        ) : (
          <span className="text-muted">Sin email</span>
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
      key: 'is_active',
      label: 'Activo',
      render: (usuario: Usuario) => {
        const isActive = usuario.is_active ?? true;
        // No permitir desactivarse a sí mismo
        const canToggle = currentUser?.id !== usuario.id;
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {canToggle ? (
              <StatusToggle
                value={isActive}
                onChange={() => handleToggleActive(usuario)}
                title={isActive ? 'Click para desactivar' : 'Click para activar'}
                size={20}
              />
            ) : (
              <StatusToggle
                value={isActive}
                onChange={() => {}}
                title="No puedes desactivarte a ti mismo"
                size={20}
              />
            )}
          </div>
        );
      }
    },
    // Solo mostrar columna Empresa si es SUPERADMIN y no hay empresa seleccionada
    ...(showCompanyColumn ? [{
      key: 'company',
      label: 'Empresa',
      width: '180px', // Más espacio para nombres de empresa
      render: (usuario: Usuario) => (
        usuario.company ? (
          <div className="company-info">
            {usuario.company.name}
          </div>
        ) : (
          <span className="text-gray-400">Sin empresa</span>
        )
      )
    }] : []),
    {
      key: 'lastActivity',
      label: 'Última actividad',
      render: (usuario: Usuario) => {
        if (usuario.lastActivity) {
          const date = new Date(usuario.lastActivity.createdAt);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          
          let timeAgo = '';
          if (diffMins < 1) {
            timeAgo = 'Hace un momento';
          } else if (diffMins < 60) {
            timeAgo = `Hace ${diffMins} min`;
          } else if (diffHours < 24) {
            timeAgo = `Hace ${diffHours} h`;
          } else if (diffDays < 7) {
            timeAgo = `Hace ${diffDays} d`;
          } else {
            timeAgo = date.toLocaleDateString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          }
          
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {usuario.lastActivity.description}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {timeAgo}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserToResendInvitation(usuario);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#6b7280',
                  }}
                  title="Reenviar invitación"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <Mail className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUserForLogs(usuario);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#6b7280',
                  }}
                  title="Ver log de actividad completo"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <Activity className="h-4 w-4" />
                </button>
                {isSuperAdmin && canImpersonate(usuario) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImpersonate(usuario);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#6b7280',
                    }}
                    title="Impersonar usuario"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }}
                  >
                    <Users className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        }
        
        // Si no hay actividad, mostrar "Alta: [fecha]"
        const altaDate = new Date(usuario.createdAt);
        const altaFormatted = altaDate.toLocaleDateString('es-AR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Alta
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {altaFormatted}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserToResendInvitation(usuario);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                }}
                title="Reenviar invitación"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <Mail className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUserForLogs(usuario);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                }}
                title="Ver log de actividad completo"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <Activity className="h-4 w-4" />
              </button>
              {isSuperAdmin && canImpersonate(usuario) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImpersonate(usuario);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#6b7280',
                  }}
                  title="Impersonar usuario"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <Users className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      }
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
    <>
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
          companyId={companyId || undefined}
        />

        <div className="form-section">
          {/* Selector de empresa - siempre arriba, ancho completo - mostrar inmediatamente incluso si está cargando */}
          {shouldShowCompanySelector && (
            <div className="company-selector-wrapper" style={{ 
              marginBottom: '0', 
              marginTop: 0,
              padding: '0 16px'
            }}>
              <FilterableSelect
                options={[
                  { id: "", name: "Todas las empresas" },
                  ...(empresas || [])
                ]}
                value={selectedCompanyId}
                onChange={setSelectedCompanyId}
                placeholder={empresasLoading ? "Cargando empresas..." : "Seleccionar empresa"}
                searchFields={["name"]}
                className="w-full"
                useThemeColors={true}
                disabled={empresasLoading && (!empresas || empresas.length === 0)}
              />
            </div>
          )}

          {/* Título Usuarios */}
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
              Usuarios
            </h2>
            <CompanySelector
              selectedCompanyId={selectedCompanyId}
              setSelectedCompanyId={setSelectedCompanyId}
            />
          </div>

          {/* Barra de búsqueda y botón nuevo - siempre visible */}
          <div className="search-and-action-row" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <SearchInput
                value={tableConfig.searchValue || ''}
                onChange={(value) => tableConfig.onSearchChange?.(value)}
                placeholder="Buscar usuarios..."
              />
            </div>
            <button
              onClick={handleNew}
              className="btn-primary new-button"
              data-shortcut="n"
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
                minWidth: '100px',
                justifyContent: 'center',
                transition: 'all 0.2s',
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
              <ShortcutText text="Nuevo Usuario" shortcutKey="n" />
            </button>
          </div>

          {/* DataTable con paginación */}
          <DataTable
            {...tableConfig}
            columns={columns}
            showSearch={false}
            showNewButton={false}
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

        {/* Modal de confirmación para toggle activo/inactivo */}
        <DeleteConfirmModal
          isOpen={!!toggleActiveUser}
          onCancel={() => setToggleActiveUser(null)}
          onConfirm={confirmToggleActive}
          title={toggleActiveUser?.is_active ? "Desactivar Usuario" : "Activar Usuario"}
          message={toggleActiveUser?.is_active 
            ? `¿Estás seguro de que deseas desactivar el usuario "${toggleActiveUser?.name}"? El usuario no podrá iniciar sesión.`
            : `¿Estás seguro de que deseas activar el usuario "${toggleActiveUser?.name}"?`}
          confirmButtonText={toggleActiveUser?.is_active ? "Desactivar" : "Activar"}
        />

        {/* Modal de log de actividad */}
        <UserActivityLogModal
          isOpen={!!selectedUserForLogs}
          onClose={() => setSelectedUserForLogs(null)}
          userId={selectedUserForLogs?.id || ''}
          userName={selectedUserForLogs?.name || ''}
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

        {/* Modal de confirmación para reenviar invitación */}
        <ConfirmationModal
          isOpen={!!userToResendInvitation}
          onCancel={() => setUserToResendInvitation(null)}
          onConfirm={handleResendInvitation}
          title="Reenviar Invitación"
          message={`¿Deseas reenviar la invitación al usuario "${userToResendInvitation?.name}" (${userToResendInvitation?.email})?`}
          confirmButtonText="Reenviar"
          isLoading={isResendingInvitation}
        />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      </main>
    </>
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
