"use client";

import React, { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Plus, Users, Building2 } from "lucide-react";
import UserActionButtons from "@/components/common/UserActionButtons";
import { formatDate } from "@/lib/utils/formatters";
import SearchAndPagination from "@/components/common/SearchAndPagination";
import { useSearchAndPagination } from "@/hooks/useSearchAndPagination";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { UsuarioForm } from "@/components/forms/UsuarioForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useUsuarios, type Usuario } from "@/hooks/useUsuarios";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useCRUDPage } from "@/hooks/useCRUDPage";
import { useImpersonation } from "@/hooks/useImpersonation";

function UsuariosContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  
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
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companyId || "");
  const { showSuccess, showError, hideModal, isModalOpen, modalContent } = useMessageModal();
  const { startImpersonation, canImpersonate } = useImpersonation();
  
  const { 
    usuarios, 
    isLoading, 
    error, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario 
  } = useUsuarios(selectedCompanyId && selectedCompanyId !== "" ? selectedCompanyId : (companyId || undefined));
  
  const { empresas } = useEmpresas();

  const {
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handleSearchChange,
    handlePageChange,
    paginatedData: filteredUsuarios
  } = useSearchAndPagination({
    data: usuarios,
    searchFields: ['name', 'email']
  });

  const onSubmit = async (data: {
    name: string;
    email: string;
    password?: string;
    role: "SUPERADMIN" | "ADMIN" | "USER";
    phone?: string;
    address?: string;
    companyId?: string;
  }) => {
    try {
      setIsSubmitting(true);
      
      if (editingUser) {
        await updateUsuario(editingUser.id, data);
        showSuccess("Éxito", "Usuario actualizado correctamente");
      } else {
        await createUsuario(data);
        showSuccess("Éxito", "Usuario creado correctamente");
      }
      
      handleCloseForm();
    } catch (error) {
      console.error("Error saving user:", error);
      showError("Error", error instanceof Error ? error.message : "Error al guardar usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    
    try {
      await deleteUsuario(showDeleteConfirm.id);
      handleCancelDelete();
      showSuccess("Éxito", "Usuario eliminado correctamente");
    } catch (error) {
      console.error("Error deleting user:", error);
      handleCancelDelete();
      showError("Error", error instanceof Error ? error.message : "Error al eliminar usuario");
    }
  };

  const handleImpersonate = async (usuario: Usuario) => {
    console.log('🎭 handleImpersonate llamado para:', usuario);
    console.log('🔍 Usuario actual:', session?.user);
    
    if (usuario.id === session?.user?.id) {
      console.log('❌ Intentando impersonar cuenta propia');
      showError("Error", "No puedes impersonar tu propia cuenta");
      return;
    }
    
    // Solo SUPERADMIN puede impersonar, y solo a usuarios USER
    if (session?.user?.role !== 'SUPERADMIN') {
      console.log('❌ Solo SUPERADMIN puede impersonar');
      showError("Error", "Solo los superadministradores pueden impersonar usuarios");
      return;
    }
    
    if (usuario.role !== 'USER') {
      console.log('❌ Solo se puede impersonar a usuarios USER');
      showError("Error", "Solo puedes impersonar a usuarios regulares");
      return;
    }

    console.log('✅ Validaciones pasadas, iniciando impersonation...');
    try {
      await startImpersonation(usuario.id);
    } catch (error) {
      console.error('❌ Error al impersonar:', error);
    }
  };

  // Recargar usuarios cuando cambie la empresa seleccionada
  React.useEffect(() => {
    if (session?.user?.role === "SUPERADMIN") {
      // No hacer nada, el hook ya maneja esto
    }
  }, [selectedCompanyId, session?.user?.role]);

  // Verificar permisos - solo ADMIN y SUPERADMIN pueden acceder
  if (!session?.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
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
          <h2>Gestión de Usuarios</h2>
          <p>Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <section className="form-section">
        <h2>Gestión de Usuarios</h2>
        
        {companyId && !selectedCompanyId && (
          <p>Mostrando usuarios de la empresa seleccionada</p>
        )}
        
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Lista de Usuarios</h3>
        {!showForm && (
              <button onClick={handleNew} className="primary">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </button>
            )}
        </div>
          
          <SearchAndPagination
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            placeholder="Buscar usuarios..."
          >
            {session?.user?.role === "SUPERADMIN" && (
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="ml-4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las empresas</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.name}
                  </option>
                ))}
              </select>
            )}
          </SearchAndPagination>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {!Array.isArray(filteredUsuarios) || filteredUsuarios.length === 0 ? (
            <p>No hay usuarios registrados.</p>
          ) : (
            <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Empresa</th>
                    <th>Teléfono</th>
                  <th>Registrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                  {filteredUsuarios.map((user) => (
                  <tr key={user.id}>
                      <td>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {user.name}
                        </div>
                      </td>
                    <td>{user.email}</td>
                    <td>
                        <span className={`badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                      <td>
                        {user.company ? (
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            {user.company.name}
                          </div>
                        ) : (
                          <span className="text-gray-500">Sin empresa</span>
                        )}
                      </td>
                      <td>{user.phone || "-"}</td>
                    <td>{new Date(user.createdAt).toLocaleString('es-AR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                        minute: '2-digit'
                    })}</td>
                    <td>
                        <UserActionButtons
                          onEdit={() => handleEdit(user)}
                          onDelete={() => handleDeleteRequest(user.id, user.name)}
                          onImpersonate={() => handleImpersonate(user)}
                          canImpersonate={canImpersonate}
                          isCurrentUser={user.id === session?.user?.id}
                          isAdmin={user.role === 'ADMIN'}
                          editTitle="Editar usuario"
                          deleteTitle="Eliminar usuario"
                          impersonateTitle="Entrar como este usuario"
                        />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </section>

      <MessageModal
        isOpen={isModalOpen}
        onClose={hideModal}
        title={modalContent?.title || ""}
        message={modalContent?.message || ""}
        type={modalContent?.type || "info"}
      />
      
      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
        title="Eliminar usuario"
        message="¿Estás seguro de que deseas eliminar este usuario?"
        itemName={showDeleteConfirm?.name}
      />
    </main>
  );
}

export default function UsuariosPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <UsuariosContent />
    </Suspense>
  );
}