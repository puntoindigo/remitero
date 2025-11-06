"use client";

import React, { useState } from 'react';
import { usePinnedModals } from '@/hooks/usePinnedModals';
import { useColorTheme } from '@/contexts/ColorThemeContext';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMessageModal } from '@/hooks/useMessageModal';
import { useEmpresas } from '@/hooks/useEmpresas';
import { useCategorias } from '@/hooks/useCategorias';
import { useEstadosRemitos } from '@/hooks/useEstadosRemitos';
import { useClientes } from '@/hooks/useClientes';
import { useProductos } from '@/hooks/useProductos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useCurrentUserSimple } from '@/hooks/useCurrentUserSimple';
import { useSession } from 'next-auth/react';
import { useCategoriasQuery } from '@/hooks/queries/useCategoriasQuery';
import { useEstadosByCompany } from '@/hooks/useEstadosByCompany';
import { useClientesQuery } from '@/hooks/queries/useClientesQuery';
import { useProductosQuery } from '@/hooks/queries/useProductosQuery';
import { EmpresaForm } from '@/components/forms/EmpresaForm';
import { CategoriaForm } from '@/components/forms/CategoriaForm';
import { EstadoRemitoForm } from '@/components/forms/EstadoRemitoForm';
import { ClienteForm } from '@/components/forms/ClienteForm';
import { ProductoForm } from '@/components/forms/ProductoForm';
import { UsuarioForm } from '@/components/forms/UsuarioForm';
import { RemitoFormComplete } from '@/components/forms/RemitoFormComplete';

/**
 * Componente que renderiza los modales anclados al Panel de Control
 */
export function PinnedModalsPanel() {
  const { pinnedModals, isLoaded, unpinModal } = usePinnedModals();
  const { colors } = useColorTheme();
  const router = useRouter();
  const { showSuccess, showError } = useMessageModal();
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();
  const [submittingStates, setSubmittingStates] = useState<Record<string, boolean>>({});
  
  // Verificar si los modales anclados están habilitados
  const pinnedModalsEnabled = (session?.user as any)?.enable_pinned_modals ?? false;
  
  // Si no está habilitado, no mostrar nada
  if (!pinnedModalsEnabled) return null;
  
  // Obtener companyId del usuario actual
  const companyId = currentUser?.companyId || undefined;
  
  // Hooks para datos necesarios
  const { createEmpresa, updateEmpresa } = useEmpresas();
  const { createCategoria, updateCategoria } = useCategorias();
  const { createEstadoRemito, updateEstadoRemito } = useEstadosRemitos();
  const { createCliente, updateCliente } = useClientes();
  const { createProducto, updateProducto } = useProductos();
  const { createUsuario, updateUsuario } = useUsuarios();
  
  // Datos adicionales para formularios que los necesitan
  const { data: categories = [] } = useCategoriasQuery(companyId || undefined);
  const { data: estados = [] } = useEstadosByCompany(companyId || undefined);
  const { data: clients = [] } = useClientesQuery(companyId || undefined);
  const { data: products = [] } = useProductosQuery(companyId || undefined);

  if (!isLoaded || pinnedModals.length === 0) return null;

  // Handlers para cada tipo de formulario
  const createSubmitHandler = (modalId: string, component: string) => {
    return async (data: any) => {
      setSubmittingStates(prev => ({ ...prev, [modalId]: true }));
      try {
        switch (component) {
          case 'EmpresaForm':
            if (pinnedModals.find(m => m.id === modalId)?.props?.editingEmpresa) {
              await updateEmpresa(pinnedModals.find(m => m.id === modalId)!.props.editingEmpresa.id, data);
              showSuccess('Empresa actualizada correctamente');
            } else {
              await createEmpresa(data);
              showSuccess('Empresa creada correctamente');
            }
            break;
          case 'CategoriaForm':
            if (pinnedModals.find(m => m.id === modalId)?.props?.editingCategoria) {
              await updateCategoria(pinnedModals.find(m => m.id === modalId)!.props.editingCategoria.id, data);
              showSuccess('Categoría actualizada correctamente');
            } else {
              await createCategoria(data);
              showSuccess('Categoría creada correctamente');
            }
            break;
          case 'EstadoRemitoForm':
            if (pinnedModals.find(m => m.id === modalId)?.props?.editingEstado) {
              await updateEstadoRemito(pinnedModals.find(m => m.id === modalId)!.props.editingEstado.id, data);
              showSuccess('Estado actualizado correctamente');
            } else {
              await createEstadoRemito(data);
              showSuccess('Estado creado correctamente');
            }
            break;
          case 'ClienteForm':
            if (pinnedModals.find(m => m.id === modalId)?.props?.editingCliente) {
              await updateCliente(pinnedModals.find(m => m.id === modalId)!.props.editingCliente.id, data);
              showSuccess('Cliente actualizado correctamente');
            } else {
              await createCliente(data);
              showSuccess('Cliente creado correctamente');
            }
            break;
          case 'ProductoForm':
            if (pinnedModals.find(m => m.id === modalId)?.props?.editingProduct) {
              await updateProducto(pinnedModals.find(m => m.id === modalId)!.props.editingProduct.id, data);
              showSuccess('Producto actualizado correctamente');
            } else {
              await createProducto(data);
              showSuccess('Producto creado correctamente');
            }
            break;
          case 'UsuarioForm':
            if (pinnedModals.find(m => m.id === modalId)?.props?.editingUser) {
              await updateUsuario(pinnedModals.find(m => m.id === modalId)!.props.editingUser.id, data);
              showSuccess('Usuario actualizado correctamente');
            } else {
              await createUsuario(data);
              showSuccess('Usuario creado correctamente');
            }
            break;
        }
        router.refresh();
      } catch (error: any) {
        showError('Error al guardar', error.message || 'Ocurrió un error');
      } finally {
        setSubmittingStates(prev => ({ ...prev, [modalId]: false }));
      }
    };
  };

  // Mapeo de componentes a sus implementaciones
  const componentMap: Record<string, React.ComponentType<any>> = {
    'RemitoFormComplete': RemitoFormComplete,
    'ProductoForm': ProductoForm,
    'ClienteForm': ClienteForm,
    'UsuarioForm': UsuarioForm,
    'CategoriaForm': CategoriaForm,
    'EstadoRemitoForm': EstadoRemitoForm,
    'EmpresaForm': EmpresaForm,
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1rem',
      }}>
        {pinnedModals.map((pinned) => {
          const Component = componentMap[pinned.component];
          if (!Component) {
            console.warn(`Component ${pinned.component} not found`);
            return null;
          }

          return (
            <div
              key={pinned.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${colors.primary}20`,
                position: 'relative',
              }}
            >
              {/* Botón para desanclar */}
              <button
                onClick={() => unpinModal(pinned.id)}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
                title="Quitar del Panel de Control"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Título */}
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                paddingRight: '2rem',
                color: '#1f2937',
              }}>
                {pinned.title}
              </h4>

              {/* Renderizar el formulario directamente */}
              <div style={{ fontSize: '0.875rem' }}>
                <Component
                  isOpen={true}
                  onClose={() => {}}
                  onSubmit={createSubmitHandler(pinned.id, pinned.component)}
                  isSubmitting={submittingStates[pinned.id] || false}
                  {...pinned.props}
                  // Propiedades adicionales para formularios específicos
                  companyId={companyId}
                  categories={categories}
                  estados={estados}
                  clients={clients}
                  products={products}
                  embedded={true}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

