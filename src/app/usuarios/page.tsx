"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Users, Building2 } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import { useSearchParams } from "next/navigation";
import SearchAndPagination from "@/components/common/SearchAndPagination";
import { useSearchAndPagination } from "@/hooks/useSearchAndPagination";

const userSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  role: z.enum(["ADMIN", "USER"]),
  address: z.string().optional(),
  phone: z.string().optional(),
  companyId: z.string().optional()
});

type UserForm = z.infer<typeof userSchema>;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  address?: string;
  phone?: string;
  company?: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

interface Company {
  id: string;
  name: string;
}

function UsuariosContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const companyId = searchParams?.get('companyId');
  
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Hook para búsqueda y paginación
  const {
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedData,
    handleSearchChange,
    handlePageChange
  } = useSearchAndPagination({
    data: users,
    searchFields: ['name', 'email'],
    itemsPerPage: 10
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema)
  });

  const watchRole = watch("role");

  const loadData = async () => {
    try {
      const [usersResponse, companiesResponse] = await Promise.all([
        fetch('/api/users'),
        session?.user?.role === "SUPERADMIN" ? fetch('/api/companies') : Promise.resolve(null)
      ]);

      if (!usersResponse.ok) {
        throw new Error('Error al cargar los usuarios');
      }

      const usersData = await usersResponse.json();
      setUsers(usersData);

      if (companiesResponse) {
        if (!companiesResponse.ok) {
          throw new Error('Error al cargar las empresas');
        }
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [session?.user?.role]);

  const onSubmit = async (data: UserForm) => {
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el usuario');
      }

      reset();
      setEditingUser(null);
      setShowForm(false);
      await loadData();
    } catch (error: any) {
      console.error("Error saving user:", error);
      alert(error.message || 'Error al guardar el usuario');
    }
  };

  const handleNew = () => {
    setEditingUser(null);
    reset();
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setValue("name", user.name);
    setValue("email", user.email);
    setValue("role", user.role as "ADMIN" | "USER");
    setValue("address", user.address || "");
    setValue("phone", user.phone || "");
    setValue("companyId", user.company?.id || "");
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingUser(null);
    reset();
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el usuario');
      }

      await loadData();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      alert(error.message || "Error al eliminar el usuario");
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

  if (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN") {
    return (
      <main className="main-content">
        <div className="empty-state">
          <h3>No tienes permisos para acceder a esta página</h3>
          <p>Solo los Administradores pueden gestionar usuarios.</p>
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
        <h2>Gestión de Usuarios</h2>
        {companyId && (
          <p>Mostrando usuarios de la empresa seleccionada</p>
        )}
        
        {/* Botón Nuevo */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={handleNew}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </button>
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="form-section">
            <h3>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</h3>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Nombre del usuario"
                />
                {errors.name && (
                  <p className="error-message">{errors.name.message}</p>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="email@ejemplo.com"
                />
                {errors.email && (
                  <p className="error-message">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contraseña {!editingUser && "*"}</label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder={editingUser ? "Dejar vacío para mantener la actual" : "Contraseña"}
                />
                {errors.password && (
                  <p className="error-message">{errors.password.message}</p>
                )}
              </div>

              <div className="form-group">
                <label>Rol</label>
                <select {...register("role")}>
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                  {session?.user?.role === "SUPERADMIN" && <option value="SUPERADMIN">Super Admin</option>}
                </select>
                {errors.role && (
                  <p className="error-message">{errors.role.message}</p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+54 11 1234-5678"
                />
                {errors.phone && (
                  <p className="error-message">{errors.phone.message}</p>
                )}
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  {...register("address")}
                  type="text"
                  placeholder="Av. Corrientes 1234, CABA"
                />
                {errors.address && (
                  <p className="error-message">{errors.address.message}</p>
                )}
              </div>
            </div>

            {session?.user?.role === "SUPERADMIN" && (
              <div className="form-row">
                <div className="form-group">
                  <label>Empresa</label>
                  <select {...register("companyId")} defaultValue={companyId || ""}>
                    <option value="">Seleccionar Empresa</option>
                    {Array.isArray(companies) && companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  {errors.companyId && (
                    <p className="error-message">{errors.companyId.message}</p>
                  )}
                </div>
              </div>
            )}

            <div className="form-actions">
              {editingUser && (
                <button type="button" onClick={handleCancel} className="secondary">
                  Cancelar
                </button>
              )}
              <button type="submit" disabled={isSubmitting} className="primary">
                {isSubmitting ? "Guardando..." : editingUser ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
        )}

        <div className="form-section">
          <h3>Lista de Usuarios</h3>
          
          <SearchAndPagination
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            placeholder="Buscar usuarios..."
          />
          
          {!Array.isArray(users) || users.length === 0 ? (
            <div className="empty-state">
              <Users className="h-12 w-12 text-gray-400" />
              <h3>No hay usuarios</h3>
              <p>Comienza creando un nuevo usuario.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Empresa</th>
                  <th>Fecha de Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(paginatedData) && paginatedData.map((user) => (
                  <tr key={user.id}>
                    <td className="font-medium">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'SUPERADMIN' ? 'bg-red-100 text-red-800' : user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.company?.name || "N/A"}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(user)}
                          className="small"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          className="small danger"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
                <p>¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.</p>
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