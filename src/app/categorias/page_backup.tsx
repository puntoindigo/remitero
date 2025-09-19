"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Building2, Users } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import Link from "next/link";

const companySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

type CompanyForm = z.infer<typeof companySchema>;

interface Company {
  id: string;
  name: string;
  createdAt: Date;
}

export default function EmpresasPage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema)
  });

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (!response.ok) {
        throw new Error('Error al cargar las empresas');
      }
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error("Error loading companies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const onSubmit = async (data: CompanyForm) => {
    try {
      const url = editingCompany ? `/api/companies/${editingCompany.id}` : '/api/companies';
      const method = editingCompany ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la empresa');
      }

      reset();
      setEditingCompany(null);
      await loadCompanies();
    } catch (error: any) {
      console.error("Error saving company:", error);
      alert(error.message || 'Error al guardar la empresa');
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setValue("name", company.name);
  };

  const handleCancel = () => {
    setEditingCompany(null);
    reset();
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la empresa');
      }

      await loadCompanies();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      alert(error.message || "Error al eliminar la empresa");
    }
  };

  // Verificar permisos
  if (!session) {
    return (
      <main className="main-content">
        <div className="empty-state">
          <h3>Cargando...</h3>
        </div>
      </main>
    );
  }

  if (session.user.role !== "SUPERADMIN") {
    return (
      <main className="main-content">
        <div className="empty-state">
          <h3>No tienes permisos para acceder a esta página</h3>
          <p>Solo los Super Administradores pueden gestionar empresas.</p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <section className="form-section">
        <h2>Gestión de Empresas</h2>
        
        <div className="form-section">
          <h3>{editingCompany ? "Editar Empresa" : "Nueva Empresa"}</h3>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre de la Empresa</label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Nombre de la empresa"
                />
                {errors.name && (
                  <p className="error-message">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="form-actions">
              {editingCompany && (
                <button type="button" onClick={handleCancel} className="secondary">
                  Cancelar
                </button>
              )}
              <button type="submit" disabled={isSubmitting} className="primary">
                {isSubmitting ? "Guardando..." : editingCompany ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>

        <div className="form-section">
          <h3>Lista de Empresas</h3>
          
          {!Array.isArray(companies) || companies.length === 0 ? (
            <div className="empty-state">
              <Building2 className="h-12 w-12 text-gray-400" />
              <h3>No hay empresas</h3>
              <p>Comienza creando una nueva empresa.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fecha de Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(companies) && companies.map((company) => (
                  <tr key={company.id}>
                    <td className="font-medium">{company.name}</td>
                    <td>{formatDate(company.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(company)}
                          className="small"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(company.id)}
                          className="small danger"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <Link 
                          href={`/usuarios?companyId=${company.id}`} 
                          className="btn-link"
                          title="Ver Usuarios"
                        >
                          <Users className="h-4 w-4" />
                          Ver Usuarios
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content">
                <h3>Confirmar eliminación</h3>
                <p>¿Estás seguro de que quieres eliminar esta empresa? Esta acción no se puede deshacer.</p>
                <div className="modal-actions">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="danger"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}