"use client";

// Constante para controlar mensajes de debug
const DEBUG = false;

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { RemitoForm, remitoSchema } from "@/lib/validations";
import { 
  Plus, 
  FileText, 
  Users, 
  Package, 
  DollarSign,
  Clock,
  CheckCircle,
  Truck,
  Trash2
} from "lucide-react";
import RemitoActionButtons from "@/components/common/RemitoActionButtons";
import { formatDate } from "@/lib/utils/formatters";
import FilterableSelect from "@/components/common/FilterableSelect";
import { useEstadosRemitos } from "@/hooks/useEstadosRemitos";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEmpresas, type Empresa } from "@/hooks/useEmpresas";
import { useDataWithCompany } from "@/hooks/useDataWithCompany";
import SearchAndPagination from "@/components/common/SearchAndPagination";
import { MessageModal } from "@/components/common/MessageModal";
import { FormModal } from "@/components/common/FormModal";
import { useMessageModal } from "@/hooks/useMessageModal";

interface RemitoItem {
  product_id?: string;
  product_name: string;
  product_desc?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Remito {
  id: string;
  number: number;
  client: {
    id: string;
    name: string;
  };
  status: "PENDIENTE" | "PREPARADO" | "ENTREGADO" | "CANCELADO";
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
  const currentUser = useCurrentUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Hook centralizado para manejo de companyId
  const {
    companyId,
    selectedCompanyId,
    setSelectedCompanyId,
    shouldShowCompanySelector
  } = useDataWithCompany();
  
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const { estadosActivos } = useEstadosRemitos(companyId);
  
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
  const [showPrintConfirm, setShowPrintConfirm] = useState<Remito | null>(null);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  
  // Hook para manejar modales de mensajes
  const { modalState, showSuccess, showError, closeModal } = useMessageModal();

  // Hook para empresas
  const { empresas } = useEmpresas();


  // Verificación de seguridad para evitar errores
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuario...</p>
        </div>
      </div>
    );
  }

  // Verificación adicional para estadosActivos
  if (!Array.isArray(estadosActivos)) {
    console.error('estadosActivos is not an array:', estadosActivos);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estados...</p>
        </div>
      </div>
    );
  }

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
    if (!companyId) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Pasar companyId del usuario actual (considerando impersonation)
      const remitosUrl = companyId ? `/api/remitos?companyId=${companyId}` : "/api/remitos";
      const clientsUrl = companyId ? `/api/clients?companyId=${companyId}` : "/api/clients";
      const productsUrl = companyId ? `/api/products?companyId=${companyId}` : "/api/products";
      
      
      const [remitosResponse, clientsResponse, productsResponse] = await Promise.all([
        fetch(remitosUrl),
        fetch(clientsUrl),
        fetch(productsUrl)
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

      // Validar que remitosData sea un array válido
      const validRemitos = Array.isArray(remitosData) ? remitosData.filter(remito => 
        remito && 
        typeof remito === 'object' && 
        Array.isArray(remito.remitoItems || remito.items)
      ) : [];
      
      setRemitos(validRemitos);
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
  }, [companyId]);

  // Detectar parámetro ?new=true para abrir formulario automáticamente
  useEffect(() => {
    const newParam = searchParams?.get('new');
    if (newParam === 'true') {
      setShowForm(true);
      setEditingRemito(null);
      setItems([]);
      reset();
      // Limpiar el query parameter después de procesarlo
      const newSearchParams = new URLSearchParams(searchParams?.toString());
      newSearchParams.delete('new');
      const newUrl = newSearchParams.toString() 
        ? `${pathname}?${newSearchParams.toString()}` 
        : pathname;
      router.replace(newUrl);
    }
  }, [searchParams, reset, router, pathname]);

  const onSubmit = async (data: RemitoForm) => {
    if (DEBUG) {
      console.log('=== REMITO SUBMIT DEBUG ===');
      console.log('onSubmit called with data:', data);
      console.log('items:', items);
      console.log('session:', session?.user);
    }
    
    if (!companyId || !currentUser?.id) {
      console.log('Missing session data');
      return;
    }

    if (items.length === 0) {
      showError("Error de validación", "Debe agregar al menos un producto");
      return;
    }

    try {
      const remitoData = {
        clientId: data.clientId,
        notes: data.notes || '',
        companyId: companyId, // Incluir companyId para impersonation
        items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_desc: item.product_desc || null,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          line_total: Number(item.line_total)
        }))
      };

      console.log('Sending remito data:', remitoData);
      console.log('Items details:', remitoData.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
        unit_price_type: typeof item.unit_price,
        line_total_type: typeof item.line_total
      })));

      // Skip validation test - proceed directly to save
      if (DEBUG) {
        console.log('=== PROCEEDING DIRECTLY TO SAVE ===');
        console.log('remitoData structure:', {
        clientId: remitoData.clientId,
        notes: remitoData.notes,
        itemsCount: remitoData.items.length,
        items: remitoData.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total
        }))
      });
      }
      
      // Validation fixed - proceed directly to save
      
      // Determine if we're creating or updating
      const isEditing = editingRemito !== null;
      const url = isEditing ? `/api/remitos/${editingRemito.id}` : '/api/remitos';
      const method = isEditing ? 'PUT' : 'POST';
      
      if (DEBUG) {
        console.log(`=== ${isEditing ? 'UPDATING' : 'CREATING'} REMITO ===`);
        console.log('URL:', url);
        console.log('Method:', method);
      }
      
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
      setShowPrintConfirm(result);
    } catch (error) {
      console.error("Error saving remito:", error);
      showError("Error al guardar el remito", (error as Error).message);
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
      product_id: product.id,
      product_name: product.name,
      product_desc: getCleanDescription(product.description || ''),
      quantity: Number(quantity),
      unit_price: Number(unitPrice),
      line_total: Number(lineTotal)
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
        const unitPrice = Number(item.unit_price);
        const lineTotal = Number(unitPrice * newQuantity);
        return { 
          ...item, 
          quantity: Number(newQuantity), 
          unit_price: Number(unitPrice), 
          line_total: Number(lineTotal) 
        };
      }
      return item;
    }));
  };

  const total = (items || []).reduce((sum, item) => sum + Number(item.line_total || 0), 0);

  // Lógica de filtrado y paginación
  const filteredRemitos = (remitos || []).filter(remito => {
    if (!remito || !remito.client) return false;
    
    const matchesSearch = !searchTerm || 
      (remito.client.name && remito.client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (remito.number && remito.number.toString().includes(searchTerm)) ||
      (remito.status && remito.status.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesClient = !selectedClient || (remito.client.id === selectedClient);
    const matchesStatus = !selectedStatus || (remito.status === selectedStatus);
    
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

  const handleEdit = async (remito: Remito) => {
    try {
      // Obtener el remito completo con todos los items
      const response = await fetch(`/api/remitos/${remito.id}`);
      if (!response.ok) {
        throw new Error('Error al cargar el remito');
      }
      const completeRemito = await response.json();
      
      setEditingRemito(completeRemito);
      setValue("clientId", completeRemito.client.id);
      setValue("notes", completeRemito.notes || "");
      
      // Mostrar observaciones si existen
      if (completeRemito.notes) {
        setShowNotes(true);
      }
      
      // Mapear los remitoItems para asegurar que product_id esté correctamente asignado
      const mappedItems = (completeRemito.remitoItems || []).map((item: any) => {
        // Si no hay product_id, intentar encontrarlo en la lista de productos
        let productId = item.product_id || item.products?.id;
        
        if (!productId && item.product_name) {
          // Buscar el producto por nombre en la lista de productos disponibles
          const matchingProduct = products.find(p => p.name === item.product_name);
          productId = matchingProduct?.id;
        }
        
        return {
          ...item,
          product_id: productId
        };
      });
      
      if (DEBUG) {
        console.log('=== DEBUG handleEdit items ===');
        console.log('original remitoItems:', completeRemito.remitoItems);
        console.log('mapped items:', mappedItems);
      }
      
      setItems(mappedItems);
      setShowForm(true);
    } catch (error) {
      console.error('Error loading remito for edit:', error);
      showError("Error", "No se pudo cargar el remito para editar");
    }
  };

  const handleCancel = () => {
    setEditingRemito(null);
    setShowForm(false);
    setItems([]);
    setShowNotes(false);
    reset();
  };

  const handleDelete = async (id: string) => {
    if (!companyId) return;

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

  const handleStatusChange = async (id: string, status: "PENDIENTE" | "PREPARADO" | "ENTREGADO" | "CANCELADO") => {
    if (!companyId || !currentUser?.id) {
      return;
    }

    try {
      const response = await fetch(`/api/remitos/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el estado');
      }

      await loadData();
    } catch (error: any) {
      showError("Error al actualizar el estado", error.message);
    }
  };

  const [printRemito, setPrintRemito] = useState<Remito | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintConfirm = () => {
    if (showPrintConfirm) {
      handlePrint(showPrintConfirm);
      setShowPrintConfirm(null);
    }
  };

  const handlePrintCancel = () => {
    setShowPrintConfirm(null);
  };

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
      const calculatedTotal = items.reduce((sum: number, item: RemitoItem) => {
        return sum + Number(item.line_total || 0);
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
              ${remitoData.client.address ? `<div>${remitoData.client.address}</div>` : ''}
              ${remitoData.client.phone ? `<div>Tel: ${remitoData.client.phone}</div>` : ''}
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
                      <td>${item.product_name}</td>
                      <td>$${Number(item.unit_price).toFixed(2)}</td>
                      <td>$${Number(item.line_total).toFixed(2)}</td>
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
              ${remitoData.client.address ? `<div>${remitoData.client.address}</div>` : ''}
              ${remitoData.client.phone ? `<div>Tel: ${remitoData.client.phone}</div>` : ''}
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
                      <td>${item.product_name}</td>
                      <td>$${Number(item.unit_price).toFixed(2)}</td>
                      <td>$${Number(item.line_total).toFixed(2)}</td>
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
      showError("Error al imprimir el remito", (error as Error).message);
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
      case "CANCELADO":
        return "bg-red-100 text-red-800";
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

  // Lógica simplificada: mostrar contenido si hay companyId o si es SUPERADMIN sin impersonar
  const needsCompanySelection = !companyId && currentUser?.role === "SUPERADMIN";

  return (
    <main className="main-content">
      <section className="form-section">
        <h2>Gestión de Remitos</h2>

        <FormModal
          isOpen={showForm}
          onClose={handleCancel}
          title={editingRemito ? `Editar Remito #${editingRemito.number}` : "Nuevo Remito"}
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log('Validation errors:', errors);
            showError("Error de validación", "Por favor complete todos los campos requeridos");
          })}
          submitText={editingRemito ? "Actualizar" : "Guardar"}
          isSubmitting={isSubmitting}
          modalClassName="remito-modal"
        >
          {/* Cliente en línea horizontal */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ minWidth: '80px', marginBottom: 0 }}>Cliente *</label>
              <div style={{ flex: 1 }}>
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
            </div>
          </div>

          {/* Tabla de productos */}
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Producto</th>
                  <th style={{ width: '80px' }}>Cant.</th>
                  <th style={{ width: '140px' }}>Precio Unit.</th>
                  <th style={{ width: '140px' }}>Total</th>
                  <th style={{ width: '60px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.product_name}</div>
                        {item.product_desc && (
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.product_desc}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value) || 1)}
                        style={{ width: '60px', fontSize: '14px', padding: '4px 8px' }}
                      />
                    </td>
                    <td style={{ fontSize: '14px' }}>{(Number(item.unit_price) || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
                    <td style={{ fontSize: '14px' }}>{(Number(item.line_total) || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</td>
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
                {/* Fila para agregar nuevo producto */}
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <td>
                    <FilterableSelect
                      options={(products || [])
                        .filter(p => !(items || []).some(item => item.product_id === p.id))
                        .map(product => ({ 
                          id: product.id, 
                          name: product.name
                        }))}
                      value={selectedProduct}
                      onChange={(value) => {
                        setSelectedProduct(value);
                        // Auto-agregar producto al seleccionar
                        if (value && quantity > 0) {
                          const product = products.find(p => p.id === value);
                          if (product) {
                            const unitPrice = Number(product.price);
                            const lineTotal = Number(unitPrice * quantity);
                            const newItem: RemitoItem = {
                              product_id: product.id,
                              product_name: product.name,
                              product_desc: product.description || '',
                              quantity: Number(quantity),
                              unit_price: Number(unitPrice),
                              line_total: Number(lineTotal)
                            };
                            setItems(prev => [...prev, newItem]);
                            setSelectedProduct("");
                            setQuantity(1);
                          }
                        }
                      }}
                      placeholder="Agregar producto..."
                      searchFields={["name"]}
                      disabled={!watch("clientId")}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      disabled={!watch("clientId")}
                      style={{ width: '60px', fontSize: '14px', padding: '8px' }}
                    />
                  </td>
                  <td colSpan={3} style={{ fontSize: '14px', color: '#6b7280' }}>
                    {selectedProduct && products.find(p => p.id === selectedProduct) && (
                      <span>
                        Vista previa: {(Number(products.find(p => p.id === selectedProduct)?.price || 0) * quantity).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Total */}
            {items.length > 0 && (
              <div className="total-display">
                <strong>Total: {(Number(total) || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</strong>
              </div>
            )}

          {/* Observaciones colapsables */}
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#2563eb', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'normal',
                padding: '4px 0',
                textDecoration: 'underline'
              }}
            >
              {showNotes ? '− Ocultar observaciones' : '+ Agregar observaciones'}
            </button>
            {showNotes && (
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Notas adicionales (opcional)"
                className="resize-none"
                style={{ marginTop: '0.5rem' }}
              />
            )}
          </div>
        </FormModal>

        {/* Lista de remitos */}
        {!showForm && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Lista de Remitos</h3>
              <button
                onClick={() => setShowForm(true)}
                className="primary"
              >
                <Plus className="h-4 w-4" />
                Nuevo Remito
              </button>
            </div>
            
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
                {shouldShowCompanySelector && empresas.length > 0 && (
                  <FilterableSelect
                    options={empresas}
                    value={selectedCompanyId}
                    onChange={setSelectedCompanyId}
                    placeholder="Seleccionar empresa"
                    searchFields={["name"]}
                    className="w-64"
                  />
                )}
                {!needsCompanySelection && (
                  <>
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
                        ...estadosActivos.map(estado => ({
                          id: estado.id.toUpperCase(),
                          name: `${estado.icon} ${estado.name}`
                        }))
                      ]}
                      value={selectedStatus}
                      onChange={handleStatusFilterChange}
                      placeholder="Filtrar por estado"
                      searchFields={["name"]}
                      className="category-filter-select"
                    />
                  </>
                )}
              </div>
            </SearchAndPagination>

            {!needsCompanySelection && (
              <>
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
                          className={getStatusColor(remito.status)}
                        >
                          {(estadosActivos || []).map(estado => (
                            <option key={estado.id} value={estado.id.toUpperCase()}>
                              {estado.icon} {estado.name}
                            </option>
                          ))}
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
                        <RemitoActionButtons
                          onPrint={() => handlePrint(remito)}
                          onEdit={() => handleEdit(remito)}
                          onDelete={() => setShowDeleteConfirm(remito.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                  </table>
                )}
              </>
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
              DEBUG: IMPRIMIENDO REMITO #{printRemito.number} - {(printRemito.items || printRemito.remitoItems || []).length} items
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
                {(printRemito.client as any).address && <p>{(printRemito.client as any).address}</p>}
                {(printRemito.client as any).phone && <p>Tel: {(printRemito.client as any).phone}</p>}
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
                    {(printRemito.remitoItems || printRemito.items || []).map((item, index) => (
                      <tr key={index}>
                        <td>{item.quantity}</td>
                        <td>{item.product_name}</td>
                        <td>${(Number(item.unit_price) || 0).toFixed(2)}</td>
                        <td>${(Number(item.line_total) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="print-total">
                <p><strong>TOTAL: ${((printRemito.remitoItems || printRemito.items || []).reduce((sum: number, item: RemitoItem) => sum + (Number(item.line_total) || 0), 0)).toFixed(2)}</strong></p>
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
                {(printRemito.client as any).address && <p>{(printRemito.client as any).address}</p>}
                {(printRemito.client as any).phone && <p>Tel: {(printRemito.client as any).phone}</p>}
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
                    {(printRemito.remitoItems || printRemito.items || []).map((item, index) => (
                      <tr key={index}>
                        <td>{item.quantity}</td>
                        <td>{item.product_name}</td>
                        <td>${(Number(item.unit_price) || 0).toFixed(2)}</td>
                        <td>${(Number(item.line_total) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="print-total">
                <p><strong>TOTAL: ${((printRemito.remitoItems || printRemito.items || []).reduce((sum: number, item: RemitoItem) => sum + (Number(item.line_total) || 0), 0)).toFixed(2)}</strong></p>
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

        {/* Modal de confirmación de impresión */}
        {showPrintConfirm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>✅ Remito guardado exitosamente</h3>
              </div>
              <div className="modal-body" style={{ textAlign: 'center' }}>
                <p>El remito ha sido guardado correctamente.</p>
                <p><strong>¿Desea imprimirlo ahora?</strong></p>
              </div>
              <div className="modal-footer" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '16px',
                padding: '20px 0'
              }}>
                <button
                  onClick={handlePrintCancel}
                  className="btn-secondary"
                  style={{ minWidth: '120px' }}
                >
                  No, gracias
                </button>
                <button
                  onClick={handlePrintConfirm}
                  className="btn-primary"
                  style={{ minWidth: '120px' }}
                >
                  Sí, imprimir
                </button>
              </div>
            </div>
          </div>
        )}

          </>
        )}

        {/* Modal de mensajes */}
        <MessageModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
          details={modalState.details}
        />

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