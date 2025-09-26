"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
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
import SearchAndPagination from "@/components/common/SearchAndPagination";

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

function RemitosContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
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
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [itemsPerPage] = useState<number>(10);

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

      // Filtrar productos con stock en el frontend
      const productsWithStock = productsData.filter((product: any) => {
        return product.stock === 'IN_STOCK';
      });

      setRemitos(remitosData);
      setClients(clientsData);
      setProducts(productsWithStock);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [session?.user?.companyId]);

  // Detectar parámetro ?new=true para abrir formulario automáticamente
  useEffect(() => {
    const newParam = searchParams?.get('new');
    if (newParam === 'true') {
      setShowForm(true);
      setEditingRemito(null);
      setItems([]);
      reset();
    }
  }, [searchParams, reset]);

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
      showError("Error de validación", "Debe agregar al menos un producto");
      return;
    }

    try {
      const remitoData = {
        ...data,
        items: items.map(item => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal)
        }))
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

      // Skip validation test - proceed directly to save
      console.log('=== PROCEEDING DIRECTLY TO SAVE ===');
      console.log('remitoData structure:', {
        clientId: remitoData.clientId,
        notes: remitoData.notes,
        itemsCount: remitoData.items.length,
        items: remitoData.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal
        }))
      });
      
      // Validation fixed - proceed directly to save
      
      // Determine if we're creating or updating
      const isEditing = editingRemito !== null;
      const url = isEditing ? `/api/remitos/${editingRemito.id}` : '/api/remitos';
      const method = isEditing ? 'PUT' : 'POST';
      
      console.log(`=== ${isEditing ? 'UPDATING' : 'CREATING'} REMITO ===`);
      console.log('URL:', url);
      console.log('Method:', method);
      
      const response = await fetch(url, {
        method,
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
      console.log(`Remito ${isEditing ? 'updated' : 'saved'} successfully:`, result);

      reset();
      setEditingRemito(null);
      setShowForm(false);
      setItems([]);
      await loadData();
      
      // Mostrar mensaje de éxito y opción de imprimir
      const action = isEditing ? 'actualizado' : 'guardado';
      if (confirm(`Remito ${action} exitosamente. ¿Desea imprimirlo?`)) {
        handlePrint(result);
      }
    } catch (error) {
      console.error("Error saving remito:", error);
      showError("Error al guardar el remito", error.message);
    }
  };

  const getCleanDescription = (description: string | null) => {
    if (!description) return null;
    // La descripción ya no contiene información de stock
    return description;
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const unitPrice = Number(product.price);
    const lineTotal = Number(unitPrice * quantity);
    const newItem: RemitoItem = {
      productId: product.id,
      productName: product.name,
      productDesc: getCleanDescription(product.description),
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      lineTotal: Number(lineTotal)
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
        const unitPrice = Number(item.unitPrice);
        const lineTotal = Number(unitPrice * newQuantity);
        return { 
          ...item, 
          quantity: Number(newQuantity), 
          unitPrice: Number(unitPrice), 
          lineTotal: Number(lineTotal) 
        };
      }
      return item;
    }));
  };

  const total = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);

  // Lógica de filtrado y paginación
  const filteredRemitos = remitos.filter(remito => {
    const matchesSearch = !searchTerm || 
      remito.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      remito.number.toString().includes(searchTerm) ||
      remito.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClient = !selectedClient || remito.client.id === selectedClient;
    const matchesStatus = !selectedStatus || remito.status === selectedStatus;
    
    return matchesSearch && matchesClient && matchesStatus;
  });

  const paginatedRemitos = filteredRemitos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateURL({ search: value });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClientFilterChange = (clientId: string) => {
    setSelectedClient(clientId);
    setCurrentPage(1);
    updateURL({ client: clientId });
  };

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    updateURL({ status: status });
  };

  const updateURL = (params: { search?: string; client?: string; status?: string }) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== '') {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    window.history.replaceState({}, '', url.toString());
  };

  // Actualizar totales cuando cambien los filtros
  useEffect(() => {
    setTotalItems(filteredRemitos.length);
    setTotalPages(Math.ceil(filteredRemitos.length / itemsPerPage));
  }, [filteredRemitos.length, itemsPerPage]);

  // Manejar filtro por cliente desde URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('client');
    const status = urlParams.get('status');
    
    if (clientId) {
      setSelectedClient(clientId);
    }
    if (status) {
      setSelectedStatus(status);
    }
  }, []);

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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el remito');
      }

      await loadData();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      showError("Error al eliminar el remito", error.message);
      setShowDeleteConfirm(null); // Cerrar el modal después del error
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
      showError("Error al actualizar el estado", error.message);
    }
  };

  const [printRemito, setPrintRemito] = useState<Remito | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async (remito: Remito) => {
    try {
      // Crear una nueva ventana para imprimir
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showError("Error de impresión", "No se pudo abrir la ventana de impresión. Verifica que los pop-ups estén permitidos.");
        return;
      }

      // Usar los datos del remito que ya tenemos
      const remitoData = remito;
      
      // Calcular el total correctamente
      const items = remitoData.remitoItems || remitoData.items || [];
      const calculatedTotal = items.reduce((sum: number, item: any) => {
        return sum + Number(item.line_total || item.lineTotal || 0);
      }, 0);

      // Generar el HTML de impresión
      const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Remito ${remitoData.number}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              font-size: 12px;
              background: white;
            }
            .print-container {
              display: flex;
              width: 100%;
              min-height: 100vh;
            }
            .print-original, .print-copy {
              width: 50%;
              padding: 15px;
              box-sizing: border-box;
              border-right: 2px dashed #000;
            }
            .print-copy {
              border-right: none;
            }
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .print-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .print-subtitle {
              font-size: 14px;
            }
            .print-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .print-table th, .print-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            .print-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .print-total {
              text-align: right;
              font-weight: bold;
              font-size: 14px;
              margin-top: 10px;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .print-container { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-original">
              <div class="print-header">
                <div class="print-title">DISTRIBUIDORA RUBEN</div>
                <div class="print-subtitle">REMITO DE ENTREGA</div>
              </div>
              <div class="print-info">
                <div>N°: ${remitoData.number}</div>
                <div>Fecha: ${new Date(remitoData.createdAt).toLocaleDateString('es-AR')}</div>
              </div>
              <div><strong>CLIENTE:</strong> ${remitoData.client.name}</div>
              <table class="print-table">
                <thead>
                  <tr>
                    <th>Cant.</th>
                    <th>Descripción</th>
                    <th>Precio Unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((item: any) => `
                    <tr>
                      <td>${item.quantity}</td>
                      <td>${item.product_name || item.productName}</td>
                      <td>$${Number(item.unit_price || item.unitPrice).toFixed(2)}</td>
                      <td>$${Number(item.line_total || item.lineTotal).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div class="print-total">
                TOTAL: $${calculatedTotal.toFixed(2)}
              </div>
            </div>
            <div class="print-copy">
              <div class="print-header">
                <div class="print-title">DISTRIBUIDORA RUBEN</div>
                <div class="print-subtitle">REMITO DE ENTREGA</div>
              </div>
              <div class="print-info">
                <div>N°: ${remitoData.number}</div>
                <div>Fecha: ${new Date(remitoData.createdAt).toLocaleDateString('es-AR')}</div>
              </div>
              <div><strong>CLIENTE:</strong> ${remitoData.client.name}</div>
              <table class="print-table">
                <thead>
                  <tr>
                    <th>Cant.</th>
                    <th>Descripción</th>
                    <th>Precio Unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((item: any) => `
                    <tr>
                      <td>${item.quantity}</td>
                      <td>${item.product_name || item.productName}</td>
                      <td>$${Number(item.unit_price || item.unitPrice).toFixed(2)}</td>
                      <td>$${Number(item.line_total || item.lineTotal).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div class="print-total">
                TOTAL: $${calculatedTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Escribir el HTML en la nueva ventana
      printWindow.document.write(printHTML);
      printWindow.document.close();

      // Imprimir después de cargar
      printWindow.onload = () => {
        // Enfocar la ventana principal para minimizar la de impresión
        window.focus();
        // Imprimir inmediatamente
        printWindow.print();
        // Cerrar inmediatamente después de iniciar la impresión
        setTimeout(() => {
          printWindow.close();
        }, 50);
      };

    } catch (error) {
      console.error('Error al imprimir:', error);
      showError("Error al imprimir el remito", error.message);
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
              showError("Error de validación", "Por favor complete todos los campos requeridos");
            })}>
              <div className="form-row">
                <div className="form-group">
                  <label className="label-aligned">Cliente *</label>
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
                  <label className="label-aligned">Observaciones</label>
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
                  <div className="form-group-step">
                    <label>Producto</label>
                    <FilterableSelect
                      options={products
                        .filter(p => !items.some(item => item.productId === p.id))
                        .map(product => ({ 
                          id: product.id, 
                          name: product.name
                        }))}
                      value={selectedProduct}
                      onChange={(value) => {
                        setSelectedProduct(value);
                        // Focus en cantidad después de seleccionar producto
                        setTimeout(() => {
                          const quantityInput = document.querySelector('input[type="number"]') as HTMLInputElement;
                          if (quantityInput) {
                            quantityInput.focus();
                            quantityInput.select();
                          }
                        }, 100);
                      }}
                      placeholder="Seleccionar producto"
                      searchFields={["name"]}
                      disabled={!watch("clientId")}
                    />
                  </div>

                  <div className="form-group-step">
                    <label>Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      disabled={!watch("clientId") || !selectedProduct}
                    />
                  </div>

                  <div className="form-group-step">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className={`primary add-button ${!watch("clientId") || !selectedProduct || quantity <= 0 ? 'disabled' : ''}`}
                      disabled={!watch("clientId") || !selectedProduct || quantity <= 0}
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
                          <td>{(Number(item.unitPrice) || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                          <td>{(Number(item.lineTotal) || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
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
                    <strong>Total: {(Number(total) || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</strong>
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
                      showError("Error de validación", "Debe seleccionar un cliente");
                      return;
                    }
                    
                    if (items.length === 0) {
                      showError("Error de validación", "Debe agregar al menos un producto");
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
            
            <SearchAndPagination
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              placeholder="Buscar por número..."
            >
              <div className="category-filter-wrapper" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <FilterableSelect
                  options={[
                    { id: "", name: "Todos los clientes" },
                    ...clients.map(client => ({ id: client.id, name: client.name }))
                  ]}
                  value={selectedClient}
                  onChange={handleClientFilterChange}
                  placeholder="Filtrar por cliente"
                  searchFields={["name"]}
                  className="category-filter-select"
                />
                <FilterableSelect
                  options={[
                    { id: "", name: "Todos los estados" },
                    { id: "PENDIENTE", name: "🕐 Pendiente" },
                    { id: "PREPARADO", name: "✅ Preparado" },
                    { id: "ENTREGADO", name: "🚚 Entregado" }
                  ]}
                  value={selectedStatus}
                  onChange={handleStatusFilterChange}
                  placeholder="Filtrar por estado"
                  searchFields={["name"]}
                  className="category-filter-select"
                />
              </div>
            </SearchAndPagination>
            
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
                    <th>Registrado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRemitos.map((remito) => (
                    <tr key={remito.id}>
                      <td className="font-medium">#{remito.number}</td>
                      <td>{remito.client.name}</td>
                      <td>
                        <select
                          value={remito.status}
                          onChange={(e) => handleStatusChange(remito.id, e.target.value as any)}
                          className={`status-select ${getStatusColor(remito.status)}`}
                        >
                          <option value="PENDIENTE">🕐 Pendiente</option>
                          <option value="PREPARADO">✅ Preparado</option>
                          <option value="ENTREGADO">🚚 Entregado</option>
                        </select>
                      </td>
                      <td>{(Number(remito.total) || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                      <td>{new Date(remito.createdAt).toLocaleString('es-AR', {
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
                            className="small"
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

        {/* Contenido de impresión directo en la página */}
        {isPrinting && printRemito && (
          <div className="print-container print-only" style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'white', 
            zIndex: 9999,
            display: 'flex'
          }}>
            {/* Indicador temporal de debug */}
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              left: '10px', 
              background: 'red', 
              color: 'white', 
              padding: '10px', 
              zIndex: 10000 
            }}>
              DEBUG: IMPRIMIENDO REMITO #{printRemito.number} - {printRemito.items.length} items
            </div>
            
            {/* Original Copy - Left Half */}
            <div className="print-original">
              <div className="print-header">
                <h1>DISTRIBUIDORA RUBEN</h1>
                <h2>REMITO DE ENTREGA</h2>
                <div className="print-info">
                  <p><strong>N°:</strong> {printRemito.number}</p>
                  <p><strong>Fecha:</strong> {new Date(printRemito.createdAt).toLocaleDateString('es-AR')}</p>
                </div>
              </div>

              <div className="print-client">
                <h3>CLIENTE:</h3>
                <p><strong>{printRemito.client.name}</strong></p>
                {printRemito.client.address && <p>{printRemito.client.address}</p>}
                {printRemito.client.phone && <p>Tel: {printRemito.client.phone}</p>}
              </div>

              <div className="print-items">
                <table className="print-table">
                  <thead>
                    <tr>
                      <th>Cant.</th>
                      <th>Descripción</th>
                      <th>Precio Unit.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printRemito.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.quantity}</td>
                        <td>{item.productName}</td>
                        <td>${(Number(item.unitPrice) || 0).toFixed(2)}</td>
                        <td>${(Number(item.lineTotal) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="print-total">
                <p><strong>TOTAL: ${(printRemito.items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0)).toFixed(2)}</strong></p>
              </div>

              {printRemito.notes && (
                <div className="print-notes">
                  <p><strong>Observaciones:</strong></p>
                  <p>{printRemito.notes}</p>
                </div>
              )}
            </div>

            {/* Client Copy - Right Half */}
            <div className="print-copy">
              <div className="print-header">
                <h1>DISTRIBUIDORA RUBEN</h1>
                <h2>REMITO DE ENTREGA</h2>
                <div className="print-info">
                  <p><strong>N°:</strong> {printRemito.number}</p>
                  <p><strong>Fecha:</strong> {new Date(printRemito.createdAt).toLocaleDateString('es-AR')}</p>
                </div>
              </div>

              <div className="print-client">
                <h3>CLIENTE:</h3>
                <p><strong>{printRemito.client.name}</strong></p>
                {printRemito.client.address && <p>{printRemito.client.address}</p>}
                {printRemito.client.phone && <p>Tel: {printRemito.client.phone}</p>}
              </div>

              <div className="print-items">
                <table className="print-table">
                  <thead>
                    <tr>
                      <th>Cant.</th>
                      <th>Descripción</th>
                      <th>Precio Unit.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printRemito.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.quantity}</td>
                        <td>{item.productName}</td>
                        <td>${(Number(item.unitPrice) || 0).toFixed(2)}</td>
                        <td>${(Number(item.lineTotal) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="print-total">
                <p><strong>TOTAL: ${(printRemito.items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0)).toFixed(2)}</strong></p>
              </div>

              {printRemito.notes && (
                <div className="print-notes">
                  <p><strong>Observaciones:</strong></p>
                  <p>{printRemito.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </section>
    </main>
  );
}

export default function RemitosPage() {
  return (
    <Suspense fallback={
      <main className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    }>
      <RemitosContent />
    </Suspense>
  );
}