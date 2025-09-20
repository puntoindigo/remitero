"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import { formatDate } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";

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
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<RemitoForm>({
    resolver: zodResolver(remitoSchema)
  });

  const loadData = async () => {
    if (!session?.user?.companyId) return;
    
    try {
      const [remitosResponse, clientsResponse, productsResponse] = await Promise.all([
        fetch('/api/remitos'),
        fetch('/api/clients'),
        fetch('/api/products')
      ]);

      if (!remitosResponse.ok || !clientsResponse.ok || !productsResponse.ok) {
        throw new Error('Error al cargar los datos');
      }

      const [remitosData, clientsData, productsData] = await Promise.all([
        remitosResponse.json(),
        clientsResponse.json(),
        productsResponse.json()
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
    console.log('=== REMITO SUBMIT DEBUG ===');
    console.log('onSubmit called with data:', data);
    console.log('items:', items);
    console.log('session:', session?.user);
    
    if (!session?.user?.companyId || !session?.user?.id) {
      console.log('Missing session data');
      return;
    }

    if (items.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    try {
      const remitoData = {
        ...data,
        items: items
      };

      console.log('Sending remito data:', remitoData);
      console.log('Items details:', remitoData.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        unitPriceType: typeof item.unitPrice,
        lineTotalType: typeof item.lineTotal
      })));

      const response = await fetch('/api/remitos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(remitoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Response error:', errorData);
        
        if (errorData.details) {
          console.error('Validation details:', errorData.details);
          const errorMessages = errorData.details.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
          throw new Error(`Datos inválidos: ${errorMessages}`);
        }
        
        throw new Error(errorData.error || 'Error al guardar el remito');
      }

      const result = await response.json();
      console.log('Remito saved successfully:', result);

      reset();
      setEditingRemito(null);
      setShowForm(false);
      setItems([]);
      await loadData();
      
      // Mostrar mensaje de éxito y opción de imprimir
      if (confirm('Remito guardado exitosamente. ¿Desea imprimirlo?')) {
        handlePrint(result);
      }
    } catch (error) {
      console.error("Error saving remito:", error);
      alert('Error al guardar el remito: ' + error.message);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const unitPrice = Number(product.price);
    const lineTotal = unitPrice * quantity;
    const newItem: RemitoItem = {
      productId: product.id,
      productName: product.name,
      productDesc: product.description,
      quantity,
      unitPrice,
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
      const response = await fetch(`/api/remitos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el remito');
      }

      await loadData();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      alert(error.message || "Error al eliminar el remito");
    }
  };

  const handleStatusChange = async (id: string, status: "PENDIENTE" | "PREPARADO" | "ENTREGADO") => {
    if (!session?.user?.companyId || !session?.user?.id) return;

    try {
      const response = await fetch(`/api/remitos/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }

      await loadData();
    } catch (error: any) {
      alert(error.message || "Error al actualizar el estado");
    }
  };

  const handlePrint = (remito: Remito) => {
    // Abrir página de impresión en nueva ventana
    const printWindow = window.open(`/remitos/${remito.id}/print`, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
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
        <h2>Gestión de Remitos</h2>
        
        {/* Botón para nuevo remito */}
        {!showForm && (
          <div className="form-actions">
            <button
              onClick={() => setShowForm(true)}
              className="primary"
            >
              <Plus className="h-4 w-4" />
              Nuevo Remito
            </button>
          </div>
        )}

        {/* Formulario de remito */}
        {showForm && (
          <div className="form-section">
            <h3>{editingRemito ? `Editar Remito #${editingRemito.number}` : "Nuevo Remito"}</h3>
            
            <form onSubmit={handleSubmit(onSubmit, (errors) => {
              console.log('Validation errors:', errors);
              alert('Por favor complete todos los campos requeridos');
            })}>
              <div className="form-row">
                <div className="form-group">
                  <label>Cliente *</label>
                  <FilterableSelect
                    options={clients.map(client => ({ id: client.id, name: client.name }))}
                    value={watch("clientId") || ""}
                    onChange={(value) => setValue("clientId", value)}
                    placeholder="Seleccionar cliente"
                    searchFields={["name"]}
                  />
                  {errors.clientId && (
                    <p className="error-message">{errors.clientId.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Observaciones</label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    placeholder="Notas adicionales (opcional)"
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Agregar productos */}
              <div className="form-section">
                <h4>Productos</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Producto</label>
                    <FilterableSelect
                      options={products
                        .filter(p => !items.some(item => item.productId === p.id))
                        .map(product => ({ 
                          id: product.id, 
                          name: `${product.name} - $${Number(product.price).toFixed(2)}` 
                        }))}
                      value={selectedProduct}
                      onChange={setSelectedProduct}
                      placeholder="Seleccionar producto"
                      searchFields={["name"]}
                    />
                  </div>

                  <div className="form-group">
                    <label>Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="form-group">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="primary"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar
                    </button>
                  </div>
                </div>

                {/* Lista de productos agregados */}
                {items.length > 0 && (
                  <table>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              {item.productDesc && (
                                <div className="text-sm text-gray-500">{item.productDesc}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </td>
                          <td>${(Number(item.unitPrice) || 0).toFixed(2)}</td>
                          <td>${(Number(item.lineTotal) || 0).toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="small danger"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Total */}
                {items.length > 0 && (
                  <div className="total-display">
                    <strong>Total: ${(Number(total) || 0).toFixed(2)}</strong>
                  </div>
                )}
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
                  type="button"
                  onClick={async () => {
                    console.log('Button clicked');
                    const formData = getValues();
                    console.log('Form values:', formData);
                    console.log('Items:', items);
                    console.log('Form errors:', errors);
                    
                    // Validar manualmente
                    if (!formData.clientId) {
                      alert('Debe seleccionar un cliente');
                      return;
                    }
                    
                    if (items.length === 0) {
                      alert('Debe agregar al menos un producto');
                      return;
                    }
                    
      // Llamar directamente a onSubmit
      console.log('Calling onSubmit directly...');
      
      // Test de validación manual
      console.log('=== VALIDATION TEST ===');
      console.log('clientId:', formData.clientId, typeof formData.clientId);
      console.log('items length:', items.length);
      items.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          quantityType: typeof item.quantity,
          unitPriceType: typeof item.unitPrice,
          lineTotalType: typeof item.lineTotal
        });
      });
      
      await onSubmit(formData);
                  }}
                  disabled={isSubmitting || items.length === 0}
                  className="primary"
                >
                  <FileText className="h-4 w-4" />
                  {isSubmitting ? "Guardando..." : editingRemito ? "Actualizar" : "Crear"} Remito
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de remitos */}
        {!showForm && (
          <div className="form-section">
            <h3>Lista de Remitos</h3>
            
            {remitos.length === 0 ? (
              <div className="empty-state">
                <FileText className="h-12 w-12 text-gray-400" />
                <h3>No hay remitos</h3>
                <p>Comienza creando un nuevo remito.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {remitos.map((remito) => (
                    <tr key={remito.id}>
                      <td className="font-medium">#{remito.number}</td>
                      <td>{remito.client.name}</td>
                      <td>
                        <span className={`badge ${getStatusColor(remito.status)}`}>
                          {getStatusIcon(remito.status)}
                          <span className="ml-1">{remito.status}</span>
                        </span>
                      </td>
                      <td>${(Number(remito.total) || 0).toFixed(2)}</td>
                      <td>{formatDate(new Date(remito.createdAt))}</td>
                      <td>
                        <div className="action-buttons">
                          <select
                            value={remito.status}
                            onChange={(e) => handleStatusChange(remito.id, e.target.value as any)}
                            className="small"
                          >
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="PREPARADO">Preparado</option>
                            <option value="ENTREGADO">Entregado</option>
                          </select>
                          <button
                            onClick={() => handlePrint(remito)}
                            className="small"
                            title="Imprimir"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(remito)}
                            className="small"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(remito.id)}
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
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content">
                <h3>Confirmar eliminación</h3>
                <p>¿Estás seguro de que quieres eliminar este remito? Esta acción no se puede deshacer.</p>
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