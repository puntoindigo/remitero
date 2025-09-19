"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Layout from "@/components/layout/Layout";
import { RemitoService } from "@/lib/services/remitoService";
import { ClientService } from "@/lib/services/clientService";
import { ProductService } from "@/lib/services/productService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RemitoForm, remitoSchema } from "@/lib/validations";
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Users, 
  Package, 
  DollarSign,
  Printer,
  Clock,
  CheckCircle,
  Truck
} from "lucide-react";

interface RemitoItem {
  productId?: string;
  productName: string;
  productDesc?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface Remito {
  id: string;
  number: number;
  client: {
    id: string;
    name: string;
  };
  status: "PENDIENTE" | "PREPARADO" | "ENTREGADO";
  statusAt: string;
  items: RemitoItem[];
  notes?: string;
  total: number;
  createdAt: string;
  createdBy: {
    name: string;
  };
  history: Array<{
    status: string;
    at: string;
    byUser?: {
      name: string;
    };
  }>;
}

interface Client {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export default function RemitosPage() {
  const { data: session } = useSession();
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRemito, setEditingRemito] = useState<Remito | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [items, setItems] = useState<RemitoItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RemitoForm>({
    resolver: zodResolver(remitoSchema)
  });

  const loadData = async () => {
    if (!session?.user?.companyId) return;
    
    try {
      const [remitosData, clientsData, productsData] = await Promise.all([
        RemitoService.getRemitos(session.user.companyId),
        ClientService.getClients(session.user.companyId),
        ProductService.getProducts(session.user.companyId)
      ]);
      setRemitos(remitosData);
      setClients(clientsData);
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [session?.user?.companyId]);

  const onSubmit = async (data: RemitoForm) => {
    if (!session?.user?.companyId || !session?.user?.id) return;

    try {
      if (editingRemito) {
        // TODO: Implementar actualización de remito
        console.log("Actualizar remito:", editingRemito.id, data);
      } else {
        await RemitoService.createRemito({
          ...data,
          companyId: session.user.companyId,
          createdById: session.user.id
        });
      }
      
      reset();
      setEditingRemito(null);
      setShowForm(false);
      setItems([]);
      await loadData();
    } catch (error) {
      console.error("Error saving remito:", error);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const lineTotal = product.price * quantity;
    const newItem: RemitoItem = {
      productId: product.id,
      productName: product.name,
      productDesc: product.description,
      quantity,
      unitPrice: product.price,
      lineTotal
    };

    setItems(prev => [...prev, newItem]);
    setSelectedProduct("");
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const lineTotal = item.unitPrice * newQuantity;
        return { ...item, quantity: newQuantity, lineTotal };
      }
      return item;
    }));
  };

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const handleEdit = (remito: Remito) => {
    setEditingRemito(remito);
    setValue("clientId", remito.client.id);
    setValue("notes", remito.notes || "");
    setItems(remito.items);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingRemito(null);
    setShowForm(false);
    setItems([]);
    reset();
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.companyId) return;

    try {
      await RemitoService.deleteRemito(id, session.user.companyId);
      await loadData();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      alert(error.message || "Error al eliminar el remito");
    }
  };

  const handleStatusChange = async (id: string, status: "PENDIENTE" | "PREPARADO" | "ENTREGADO") => {
    if (!session?.user?.companyId || !session?.user?.id) return;

    try {
      await RemitoService.updateRemitoStatus(id, status, session.user.companyId, session.user.id);
      await loadData();
    } catch (error: any) {
      alert(error.message || "Error al actualizar el estado");
    }
  };

  const handlePrint = (remito: Remito) => {
    // TODO: Implementar impresión
    console.log("Imprimir remito:", remito);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDIENTE":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "PREPARADO":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "ENTREGADO":
        return <Truck className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800";
      case "PREPARADO":
        return "bg-blue-100 text-blue-800";
      case "ENTREGADO":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Remitos</h1>
          <p className="mt-2 text-gray-600">
            Administra los remitos de entrega
          </p>
        </div>

        {/* Botón para nuevo remito */}
        {!showForm && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Remito
            </button>
          </div>
        )}

        {/* Formulario de remito */}
        {showForm && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {editingRemito ? `Editar Remito #${editingRemito.number}` : "Nuevo Remito"}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                      Cliente *
                    </label>
                    <select
                      {...register("clientId")}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Seleccionar cliente</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                    {errors.clientId && (
                      <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Observaciones
                    </label>
                    <input
                      {...register("notes")}
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Notas adicionales"
                    />
                  </div>
                </div>

                {/* Agregar productos */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Productos</h4>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Producto
                      </label>
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Seleccionar producto</option>
                        {products
                          .filter(p => !items.some(item => item.productId === p.id))
                          .map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ${product.price.toFixed(2)}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </button>
                    </div>
                  </div>

                  {/* Lista de productos agregados */}
                  {items.length > 0 && (
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Producto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cantidad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Precio Unit.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th className="relative px-6 py-3">
                              <span className="sr-only">Acciones</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.productName}
                                {item.productDesc && (
                                  <div className="text-sm text-gray-500">{item.productDesc}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value) || 1)}
                                  className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${item.unitPrice.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${item.lineTotal.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Total */}
                  {items.length > 0 && (
                    <div className="mt-4 flex justify-end">
                      <div className="text-lg font-medium text-gray-900">
                        Total: ${total.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Guardando..." : editingRemito ? "Actualizar" : "Crear"} Remito
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de remitos */}
        {!showForm && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Lista de Remitos
              </h3>
              
              {remitos.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay remitos</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza creando un nuevo remito.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Número
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {remitos.map((remito) => (
                        <tr key={remito.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{remito.number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {remito.client.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(remito.status)}`}>
                              {getStatusIcon(remito.status)}
                              <span className="ml-1">{remito.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${remito.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(remito.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <select
                                value={remito.status}
                                onChange={(e) => handleStatusChange(remito.id, e.target.value as any)}
                                className="text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="PREPARADO">Preparado</option>
                                <option value="ENTREGADO">Entregado</option>
                              </select>
                              <button
                                onClick={() => handlePrint(remito)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(remito)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(remito.id)}
                                className="text-red-600 hover:text-red-900"
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
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">Confirmar eliminación</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    ¿Estás seguro de que quieres eliminar este remito? Esta acción no se puede deshacer.
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
    </Layout>
  );
}