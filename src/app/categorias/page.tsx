"use client";

import React, { useState, Suspense, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, Package } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { ToastContainer } from "@/components/common/Toast.jsx";
import { CategoriaForm } from "@/components/forms/CategoriaForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useToast } from "@/hooks/useToast.js";
import { 
  useCategoriasQuery,
  useCreateCategoriaMutation,
  useUpdateCategoriaMutation,
  useDeleteCategoriaMutation,
  type Category as Categoria
} from "@/hooks/queries/useCategoriasQuery";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useDataWithCompanySimple } from "@/hooks/useDataWithCompanySimple";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { useCRUDTable } from "@/hooks/useCRUDTable";
import { Pagination } from "@/components/common/Pagination";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useLoading } from "@/hooks/useLoading";
import { ShortcutText } from "@/components/common/ShortcutText";
import { SearchInput } from "@/components/common/SearchInput";
import { LoadingButton } from "@/components/common/LoadingButton";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { useShortcuts } from "@/hooks/useShortcuts";
import { useColorTheme } from "@/contexts/ColorThemeContext";

function CategoriasContent() {
  const currentUser = useCurrentUserSimple();
  const { colors } = useColorTheme();
  
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
  
  // Loading state management
  const { loading: loadingState, startLoading, stopLoading } = useLoading();
  
  const {
    editingItem: editingCategoria,
    showForm,
    isSubmitting,
    handleNew,
    handleEdit,
    handleCloseForm,
    setIsSubmitting,
    showDeleteConfirm,
    handleDeleteRequest,
    handleCancelDelete
  } = useCRUDPage<Categoria>();
  const { modalState, showSuccess, showError, closeModal } = useMessageModal();
  const { toasts, showSuccess: showToastSuccess, showError: showToastError, removeToast } = useToast();
  
  const { empresas } = useEmpresas();
  
  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // 🚀 REACT QUERY: Reemplaza el hook anterior
  const { data: categorias = [], isLoading, error } = useCategoriasQuery(companyId || undefined);
  const createMutation = useCreateCategoriaMutation();
  const updateMutation = useUpdateCategoriaMutation();
  const deleteMutation = useDeleteCategoriaMutation();

  // Función de eliminación con useCallback para evitar problemas de hoisting
  const handleDeleteCategoria = useCallback((categoria: Categoria) => {
    handleDeleteRequest(categoria.id, categoria.name);
  }, [handleDeleteRequest]);

  // Detectar si viene de /nuevo y abrir formulario
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
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
      description: 'Nueva Categoría'
    }
  ], !!companyId && !showForm); // Solo habilitar cuando hay companyId y el form no está abierto

  // Listener para FAB mobile
  useEffect(() => {
    const handleFABClick = (event: any) => {
      if (event.detail?.action === 'newCategoria') {
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
    data: categorias || [],
    loading: isLoading,
    searchFields: ['name', 'description'],
    itemsPerPage: 10,
    onEdit: handleEdit,
    onDelete: handleDeleteCategoria,
    onNew: handleNew,
    getItemId: (categoria) => categoria.id,
    emptyMessage: "No hay categorías",
    emptySubMessage: "Comienza creando una nueva categoría.",
    emptyIcon: <Package className="empty-icon" />,
    newButtonText: "Nueva Categoría",
    searchPlaceholder: "Buscar categorías..."
  });

  // 🚀 REACT QUERY: Submit con mutaciones
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingCategoria) {
        await updateMutation.mutateAsync({ id: editingCategoria.id, data: { ...data, companyId } });
        showSuccess("Categoría actualizada correctamente");
      } else {
        await createMutation.mutateAsync({ ...data, companyId });
        showSuccess("Categoría creada correctamente");
      }
      handleCloseForm();
    } catch (error: any) {
      showError(error.message || "Error al guardar la categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 REACT QUERY: Delete con mutación
  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await deleteMutation.mutateAsync(showDeleteConfirm.id);
      handleCancelDelete();
      showToastSuccess("Categoría eliminada correctamente");
    } catch (error: any) {
      handleCancelDelete();
      showToastError(error instanceof Error ? error.message : "Error al eliminar categoría");
    }
  };

  // Lógica corregida: 
  // - ADMIN y USER siempre tienen companyId (vinculados a empresa)
  // - SUPERADMIN puede no tener empresa seleccionada (necesita seleccionar)
  const needsCompanySelection = !companyId && currentUser?.role === "SUPERADMIN";
  
  // Verificar si hay un problema con los datos del usuario
  const hasDataIssue = !companyId && currentUser?.role !== "SUPERADMIN";

  // Definir columnas para el DataTable
  const columns: DataTableColumn<Categoria>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (categoria) => (
        <div className="categoria-info">
          <div className="categoria-name">{categoria.name}</div>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Registrado',
      render: (categoria) => {
        const date = new Date(categoria.createdAt);
        return date.toLocaleString('es-AR', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        });
      }
    }
  ];

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="form-section">
          <LoadingSpinner message="Cargando categorías..." />
        </div>
      </main>
    );
  }

  // Verificar si hay un problema con los datos del usuario
  if (hasDataIssue) {
    return (
      <main className="main-content">
        <div className="form-section">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error de Configuración</h2>
            <p className="text-gray-600">Tu usuario no está vinculado a ninguna empresa. Contacta al administrador.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="px-4 py-6 sm:px-0">
        {/* Formulario */}
        <CategoriaForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingCategoria={editingCategoria}
        />

        <div className="form-section">
          {/* Selector de empresa - ancho completo */}
          {shouldShowCompanySelector && empresas?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <FilterableSelect
                options={empresas}
                value={selectedCompanyId}
                onChange={setSelectedCompanyId}
                placeholder="Seleccionar empresa"
                searchFields={["name"]}
                className="w-full"
                useThemeColors={true}
              />
            </div>
          )}

          {/* Título Categorías */}
          {!needsCompanySelection && (
            <h2 className="page-title-desktop" style={{ 
              fontSize: '24px', 
              fontWeight: 700, 
              color: '#111827',
              marginBottom: '0.75rem',
              marginTop: '0',
              padding: '0 16px'
            }}>
              Categorías
            </h2>
          )}

          {/* Barra de búsqueda y botón nuevo */}
          {!needsCompanySelection && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between', padding: '0 16px' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar categorías..."
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
                <ShortcutText text="Nueva Categoría" shortcutKey="n" />
              </button>
            </div>
          )}

          {/* DataTable con paginación */}
          {needsCompanySelection ? (
            <div className="empty-state">
              <Package className="empty-icon" />
              <p>Para ver las categorías, primero selecciona una empresa.</p>
            </div>
          ) : (
            <>
              <DataTable
                {...tableConfig}
                columns={columns}
                showSearch={false}
                showNewButton={false}
              />
              <Pagination {...paginationConfig} />
            </>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        <DeleteConfirmModal
          isOpen={!!showDeleteConfirm}
          onCancel={handleCancelDelete}
          onConfirm={handleDelete}
          title="Eliminar Categoría"
          message={`¿Estás seguro de que deseas eliminar la categoría "${showDeleteConfirm?.name}"?`}
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

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </main>
  );
}

export default function CategoriasPage() {
  return (
    <Suspense fallback={
      <main className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    }>
      <CategoriasContent />
    </Suspense>
  );
}
