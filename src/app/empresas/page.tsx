"use client";

import React, { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Plus, Edit, Trash2, Building2, Users } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import Link from "next/link";
import { MessageModal } from "@/components/common/MessageModal";
import { EmpresaForm } from "@/components/forms/EmpresaForm";
import { useMessageModal } from "@/hooks/useMessageModal";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";

function EmpresasContent() {
  const { data: session } = useSession();
  const [editingCompany, setEditingCompany] = useState<Empresa | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError, hideModal, isModalOpen, modalContent } = useMessageModal();
  
  const { 
    empresas, 
    isLoading, 
    error, 
    createEmpresa, 
    updateEmpresa, 
    deleteEmpresa 
  } = useEmpresas();

  const handleNew = () => {
    setEditingCompany(null);
    setShowForm(true);
  };

  const handleEdit = (company: Empresa) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCompany(null);
  };

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
      
      setShowForm(false);
      setEditingCompany(null);
    } catch (error) {
      console.error("Error saving company:", error);
      showError("Error", error instanceof Error ? error.message : "Error al guardar empresa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmpresa(id);
      showSuccess("Éxito", "Empresa eliminada correctamente");
    } catch (error) {
      console.error("Error deleting company:", error);
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
          onClose={handleCancel}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          editingEmpresa={editingCompany}
        />
        
        {!showForm && (
          <div className="form-actions">
            <button onClick={handleNew} className="primary">
              <Plus className="h-4 w-4" />
              Nueva Empresa
            </button>
          </div>
        )}

        <div className="form-section">
          <h3>Lista de Empresas</h3>
          
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
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(company)}
                            className="small primary"
                            title="Editar empresa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
                            className="small danger"
                            title="Eliminar empresa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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