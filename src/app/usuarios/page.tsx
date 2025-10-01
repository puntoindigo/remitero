"use client";

import React, { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Plus, Users, Building2 } from "lucide-react";
import ActionButtons from "@/components/common/ActionButtons";
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
  
  const { 
    usuarios, 
    isLoading, 
    error, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario 
  } = useUsuarios(selectedCompanyId || companyId || undefined);
  
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

  // Recargar usuarios cuando cambie la empresa seleccionada
  React.useEffect(() => {
    if (session?.user?.role === "SUPERADMIN") {
      // No hacer nada, el hook ya maneja esto
    }
  }, [selectedCompanyId, session?.user?.role]);

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
                    <th>Fecha de Creación</th>
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
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <ActionButtons
                          onEdit={() => handleEdit(user)}
                          onDelete={() => handleDeleteRequest(user.id, user.name)}
                          editTitle="Editar usuario"
                          deleteTitle="Eliminar usuario"
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