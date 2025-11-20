"use client";

import React, { useState, Suspense, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Building2, Users, Edit, Trash2, Copy } from "lucide-react";
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
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [empresaToDuplicate, setEmpresaToDuplicate] = useState<Empresa | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicateOptions, setDuplicateOptions] = useState({
    estados: false,
    categorias: false,
    productos: false,
    clientes: false,
    remitos: false,
    usuarios: false
  });
  const [isDuplicating, setIsDuplicating] = useState(false);
  
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
              setEmpresaToDuplicate(empresa);
              setDuplicateName(`${empresa.name} (copia)`);
              setShowDuplicateModal(true);
            }}
            className="action-button"
            title="Duplicar empresa"
            style={{
              background: '#f0f9ff',
              color: '#0369a1',
              borderColor: '#bae6fd'
            }}
          >
            <Copy className="h-4 w-4" />
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
          <LoadingSpinner message="Cargando empresas..." />
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="main-content">
        <section className="form-section">
        
        <EmpresaForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingEmpresa={editingCompany}
        />
        
        <div className="form-section">
          {/* Título Empresas */}
          <h2 className="page-title-desktop" style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            color: '#111827',
            marginBottom: '0.75rem',
            marginTop: '0',
            padding: '0 16px'
          }}>
            Empresas
          </h2>
          
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

      {/* Modal para duplicar empresa */}
      {showDuplicateModal && empresaToDuplicate && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
          onClick={() => {
            setShowDuplicateModal(false);
            setEmpresaToDuplicate(null);
            setDuplicateName("");
            setDuplicateOptions({
              estados: false,
              categorias: false,
              productos: false,
              clientes: false,
              remitos: false,
              usuarios: false
            });
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
              Duplicar Empresa: {empresaToDuplicate.name}
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Nombre de la nueva empresa *
              </label>
              <input
                type="text"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                placeholder="Nombre de la empresa"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500 }}>
                Seleccionar qué duplicar:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { key: 'estados', label: 'Estados de Remitos' },
                  { key: 'categorias', label: 'Categorías' },
                  { key: 'productos', label: 'Productos' },
                  { key: 'clientes', label: 'Clientes' },
                  { key: 'remitos', label: 'Remitos' },
                  { key: 'usuarios', label: 'Usuarios' }
                ].map((option) => (
                  <label key={option.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={duplicateOptions[option.key as keyof typeof duplicateOptions]}
                      onChange={(e) => setDuplicateOptions({
                        ...duplicateOptions,
                        [option.key]: e.target.checked
                      })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDuplicateModal(false);
                  setEmpresaToDuplicate(null);
                  setDuplicateName("");
                  setDuplicateOptions({
                    estados: false,
                    categorias: false,
                    productos: false,
                    clientes: false,
                    remitos: false,
                    usuarios: false
                  });
                }}
                disabled={isDuplicating}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: isDuplicating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!duplicateName.trim()) {
                    showError("Error", "El nombre de la empresa es requerido");
                    return;
                  }
                  
                  setIsDuplicating(true);
                  try {
                    const response = await fetch(`/api/companies/${empresaToDuplicate.id}/duplicate`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        name: duplicateName.trim(),
                        ...duplicateOptions
                      }),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                      throw new Error(result.message || 'Error al duplicar la empresa');
                    }

                    showSuccess("Éxito", "Empresa duplicada correctamente");
                    setShowDuplicateModal(false);
                    setEmpresaToDuplicate(null);
                    setDuplicateName("");
                    setDuplicateOptions({
                      estados: false,
                      categorias: false,
                      productos: false,
                      clientes: false,
                      remitos: false,
                      usuarios: false
                    });
                    // Recargar empresas
                    window.location.reload();
                  } catch (error: any) {
                    showError("Error", error.message || 'Error al duplicar la empresa');
                  } finally {
                    setIsDuplicating(false);
                  }
                }}
                disabled={isDuplicating || !duplicateName.trim()}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: isDuplicating || !duplicateName.trim() ? '#9ca3af' : colors.gradient,
                  color: 'white',
                  cursor: isDuplicating || !duplicateName.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {isDuplicating ? 'Duplicando...' : 'Duplicar'}
              </button>
            </div>
          </div>
        </div>
      )}
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