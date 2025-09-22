"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { ClientForm, clientSchema } from "@/lib/validations";
import { Plus, Edit, Trash2, Users, Mail, Phone, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import SearchAndPagination from "@/components/common/SearchAndPagination";
import { useSearchAndPagination } from "@/hooks/useSearchAndPagination";

interface Client {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  remitos: { id: string }[];
  createdAt: Date;
}

function ClientesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
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
    data: clients,
    searchFields: ['name', 'email', 'phone'],
    itemsPerPage: 10
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema)
  });

  const loadClients = async () => {
    if (!session?.user?.companyId) return;
    
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Error al cargar los clientes');
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [session?.user?.companyId]);

  // Detectar parámetro ?new=true para abrir formulario automáticamente
  useEffect(() => {
    const newParam = searchParams?.get('new');
    if (newParam === 'true') {
      setShowForm(true);
      setEditingClient(null);
      reset();
    }
  }, [searchParams, reset]);

  const onSubmit = async (data: ClientForm) => {
    if (!session?.user?.companyId) return;

    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
      const method = editingClient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el cliente');
      }
      
      reset();
      setEditingClient(null);
      setShowForm(false);
      await loadClients();
    } catch (error) {
      console.error("Error saving client:", error);
      alert(error instanceof Error ? error.message : 'Error al guardar el cliente');
    }
  };

  const handleNew = () => {
    setEditingClient(null);
    reset();
    setShowForm(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setValue("name", client.name);
    setValue("address", client.address || "");
    setValue("phone", client.phone || "");
    setValue("email", client.email || "");
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingClient(null);
    reset();
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.companyId) return;

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el cliente');
      }

      await loadClients();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      alert(error.message || "Error al eliminar el cliente");
    }
  };

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
      <div className="px-4 py-6 sm:px-0">

        {/* Formulario */}
        {showForm && (
          <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del cliente *</label>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="Ingresa el nombre del cliente"
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
                    placeholder="cliente@email.com"
                  />
                  {errors.email && (
                    <p className="error-message">{errors.email.message}</p>
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

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Guardando..." : editingClient ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
        )}

        <div className="form-section">
          <h2>Gestión de Clientes</h2>
          
          <div className="form-actions">
            <button
              onClick={() => setShowForm(true)}
              className="primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </button>
          </div>
          
          <h3>Lista de Clientes</h3>
          
          <SearchAndPagination
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            placeholder="Buscar clientes..."
          />
          
          {!Array.isArray(clients) || clients.length === 0 ? (
            <div className="empty-state">
              <Users className="empty-icon" />
              <p className="empty-text">No hay clientes</p>
              <p className="empty-subtext">Comienza creando un nuevo cliente.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Remitos</th>
                  <th>Registrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(paginatedData) && paginatedData.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className="font-medium">{client.name}</div>
                      {client.address && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {client.address}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="space-y-1">
                        {client.email && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-4" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-4" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => router.push(`/remitos?client=${client.id}`)}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {client.remitos?.length || 0} remitos
                      </button>
                    </td>
                    <td>{new Date(client.createdAt).toLocaleString('es-AR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}</td>
                    <td>
                      <div className="action-buttons-spaced">
                        <button
                          onClick={() => handleEdit(client)}
                          className="action-btn edit"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(client.id)}
                          className="action-btn delete"
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">Confirmar eliminación</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    ¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={
      <main className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    }>
      <ClientesContent />
    </Suspense>
  );
}