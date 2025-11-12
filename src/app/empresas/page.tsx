"use client";

import React, { useState, Suspense, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Building2, Users, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { EmpresaForm } from "@/components/forms/EmpresaForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useCRUDPage } from "@/hooks/useCRUDPage";
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

function EmpresasContent() {
  const { data: session } = useSession();
  const { colors } = useColorTheme();
  const router = useRouter();
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
  
  // Loading state management
  const { loading: loadingState, startLoading, stopLoading } = useLoading();
  
  const { 
    empresas, 
    isLoading, 
    error, 
    createEmpresa, 
    updateEmpresa, 
    deleteEmpresa 
  } = useEmpresas();

  // Función de eliminación con useCallback para evitar problemas de hoisting
  const handleDeleteEmpresa = useCallback((empresa: Empresa) => {
    handleDeleteRequest(empresa.id, empresa.name);
  }, [handleDeleteRequest]);

  // Configurar shortcuts de teclado
  useShortcuts([
    {
      key: 'n',
      action: handleNew,
      description: 'Nueva Empresa'
    }
  ], !showForm);

  // Listener para FAB mobile
  useEffect(() => {
    const handleFABClick = (event: any) => {
      if (event.detail?.action === 'newEmpresa') {
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
    data: empresas,
    loading: isLoading,
    searchFields: ['name'],
    itemsPerPage: 10,
    onEdit: handleEdit,
    onDelete: handleDeleteEmpresa,
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
        <div className="action-buttons">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/usuarios?companyId=${empresa.id}`);
            }}
            className="action-button"
            title="Ver usuarios de esta empresa"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              padding: '6px 12px',
              background: colors.gradient,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
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
            <Users className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(empresa);
            }}
            className="action-button edit-button"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEmpresa(empresa);
            }}
            className="action-button delete-button"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
      showError(error instanceof Error ? error.message : "Error al guardar empresa");
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
      showError(error instanceof Error ? error.message : "Error al eliminar empresa");
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
          <h2 className="gestion-header" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: '#111827' }}>Gestión</h2>
          <LoadingSpinner message="Cargando empresas..." />
        </div>
      </main>
    );
  }

  return (
    <>
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
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {/* Barra de búsqueda y botón nuevo */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <SearchInput
                value={tableConfig.searchValue || ''}
                onChange={(value) => tableConfig.onSearchChange?.(value)}
                placeholder="Buscar empresas..."
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
              <ShortcutText text="Nueva Empresa" shortcutKey="n" />
            </button>
          </div>
          
          <DataTable
            {...tableConfig}
            columns={columns}
            showSearch={false}
            showNewButton={false}
            showActions={false}
            onEdit={(empresa) => handleEdit(empresa)}
            onDelete={(empresa) => handleDeleteRequest(empresa.id, empresa.name)}
            actionsColumnLabel="Acciones"
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
    </>
  );
}

export default function EmpresasPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando empresas..." />}>
      <EmpresasContent />
    </Suspense>
  );
}