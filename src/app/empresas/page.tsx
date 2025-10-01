"use client";

import React, { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Plus, Building2, Users } from "lucide-react";
import ActionButtons from "@/components/common/ActionButtons";
import { formatDate } from "@/lib/utils/formatters";
import Link from "next/link";
import { MessageModal } from "@/components/common/MessageModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { EmpresaForm } from "@/components/forms/EmpresaForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useCRUDPage } from "@/hooks/useCRUDPage";

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
  const { showSuccess, showError, hideModal, isModalOpen, modalContent } = useMessageModal();
  
  const { 
    empresas, 
    isLoading, 
    error, 
    createEmpresa, 
    updateEmpresa, 
    deleteEmpresa 
  } = useEmpresas();

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
          
          {!Array.isArray(empresas) || empresas.length === 0 ? (
            <p>No hay empresas registradas.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Usuarios</th>
                    <th>Fecha de Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((company) => (
                    <tr key={company.id}>
                      <td>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2" />
                          {company.name}
                        </div>
                      </td>
                      <td>
                        <Link 
                          href={`/usuarios?companyId=${company.id}`}
                          className="view-users-link"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Ver Usuarios
                        </Link>
                      </td>
                      <td>{formatDate(company.createdAt)}</td>
                      <td>
                        <ActionButtons
                          onEdit={() => handleEdit(company)}
                          onDelete={() => handleDeleteRequest(company.id, company.name)}
                          editTitle="Editar empresa"
                          deleteTitle="Eliminar empresa"
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