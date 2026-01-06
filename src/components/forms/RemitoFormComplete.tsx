"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Plus, Pencil } from "lucide-react";
import FilterableSelect from "@/components/common/FilterableSelect";
import { FormModal } from "@/components/common/FormModal";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { remitoSchema, type RemitoForm } from "@/lib/validations";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useIsMobile } from "@/hooks/useIsMobile";

interface RemitoItem {
  product_id?: string;
  product_name: string;
  product_desc?: string;
  product_imageUrl?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  isUnit?: boolean; // Indica si el producto se vende por unidad en lugar de por presentación
  parentIndex?: number; // Índice del item padre si este es una versión "unidad" de otro item
}

interface RemitoFormCompleteProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  editingRemito?: any;
  clients?: any[];
  products?: any[];
  estados?: any[];
  companyId?: string;
  onClientCreated?: (newClient: any) => void;
}

export function RemitoFormComplete({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingRemito,
  clients = [],
  products = [],
  estados = [],
  companyId,
  onClientCreated
}: RemitoFormCompleteProps) {
  const isMobile = useIsMobile();
  const [items, setItems] = useState<RemitoItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showClientForm, setShowClientForm] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");
  const [isSubmittingClient, setIsSubmittingClient] = useState<boolean>(false);
  const [newClientId, setNewClientId] = useState<string | null>(null);
  const [isLoadingRemito, setIsLoadingRemito] = useState<boolean>(false);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [accountPayment, setAccountPayment] = useState<number>(0);
  const [isShippingEnabled, setIsShippingEnabled] = useState<boolean>(false); // Solo para controlar el checkbox, no se envía a la API
  const [editingPriceIndex, setEditingPriceIndex] = useState<number | null>(null); // Índice del item cuyo precio se está editando
  const [editingPriceValue, setEditingPriceValue] = useState<string>(''); // Valor temporal mientras se edita
  const [editingPresentationIndex, setEditingPresentationIndex] = useState<number | null>(null); // Índice del item cuya presentación se está editando

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RemitoForm>({
    resolver: zodResolver(remitoSchema),
    defaultValues: {
      clientId: "",
      status: "",
      notes: ""
    }
  });

  // Efecto para seleccionar el nuevo cliente cuando aparezca en la lista
  useEffect(() => {
    if (newClientId && clients && clients.length > 0) {
      const clientExists = clients.some(c => c?.id === newClientId);
      if (clientExists) {
        // Usar setTimeout para asegurar que el DOM esté actualizado
        setTimeout(() => {
          setValue("clientId", String(newClientId || ""), { shouldValidate: false });
          setNewClientId(null); // Limpiar el ID para evitar re-seleccionar
        }, 50);
      }
    }
  }, [clients, newClientId, setValue]);

  // Cargar datos del remito en edición o resetear para nuevo remito
  useEffect(() => {
    if (editingRemito) {
      // Activar loading y resetear valores para evitar mostrar datos incorrectos
      setIsLoadingRemito(true);
      setItems([]);
      setShippingCost(0);
      setPreviousBalance(0);
      setAccountPayment(0);
      setIsShippingEnabled(false);
      
      // SIEMPRE hacer fetch completo del remito para asegurar que los items se carguen correctamente
      if (editingRemito.id) {
        fetch(`/api/remitos/${editingRemito.id}`)
          .then(resp => {
            if (!resp.ok) {
              throw new Error(`HTTP error! status: ${resp.status}`);
            }
            return resp.json();
          })
          .then(fullRemito => {
            console.log('🔍 Remito completo cargado:', {
              remitoId: fullRemito.id,
              hasItems: !!(fullRemito.items || fullRemito.remitoItems || fullRemito.remito_items),
              itemsCount: (fullRemito.items || fullRemito.remitoItems || fullRemito.remito_items || []).length
            });
            
            // Actualizar el estado del formulario con los datos completos
            setValue("clientId", String(fullRemito.client?.id || fullRemito.clientId || ""));
            const statusId = String(fullRemito.status?.id || fullRemito.status || "");
            setValue("status", statusId);
            setValue("notes", String(fullRemito.notes || ""));
            
            // Cargar campos de envío, saldo anterior y pago a cuenta
            const shippingCostValue = fullRemito.shipping_cost || fullRemito.shippingCost || 0;
            const previousBalanceValue = fullRemito.previous_balance || fullRemito.previousBalance || 0;
            const accountPaymentValue = fullRemito.account_payment || fullRemito.accountPayment || 0;
            
            setShippingCost(shippingCostValue);
            setPreviousBalance(previousBalanceValue);
            setAccountPayment(accountPaymentValue);
            setIsShippingEnabled(shippingCostValue > 0);
            
            // Cargar items del remito (pueden venir como 'items', 'remitoItems' o 'remito_items')
            const fetchedItems = fullRemito.items || fullRemito.remitoItems || fullRemito.remito_items || [];
            
            if (Array.isArray(fetchedItems) && fetchedItems.length > 0) {
              const loadedItems = fetchedItems.map((item: any) => {
                // Verificar explícitamente si is_unit es true (puede venir como boolean, 1, o string "true")
                const isUnitValue = item.is_unit === true || 
                                   item.is_unit === 1 || 
                                   item.is_unit === 'true' ||
                                   item.isUnit === true || 
                                   item.isUnit === 1 ||
                                   item.isUnit === 'true';
                console.log('🔍 Item cargado:', {
                  product_name: item.product_name,
                  'item.is_unit': item.is_unit,
                  'item.isUnit': item.isUnit,
                  'typeof is_unit': typeof item.is_unit,
                  'typeof isUnit': typeof item.isUnit,
                  isUnitValue: isUnitValue,
                  'raw item keys': Object.keys(item),
                  'raw item.is_unit value': item.is_unit
                });
                return {
                  product_id: String(item.product_id || item.productId || item.product?.id || item.products?.id || ''),
                  product_name: String(item.product_name || item.productName || item.product?.name || item.products?.name || ""),
                  product_desc: String(item.product_desc || item.productDesc || item.product?.description || item.products?.description || ""),
                  product_imageUrl: String(item.product?.imageUrl || item.product?.image_url || item.products?.imageUrl || item.products?.image_url || ""),
                  quantity: Number(item.quantity) || 1,
                  unit_price: Number(item.unit_price || item.unitPrice || item.product?.price || item.products?.price) || 0,
                  line_total: Number(item.line_total || item.lineTotal || (item.quantity * (item.unit_price || item.unitPrice))) || 0,
                  isUnit: isUnitValue
                };
              });
              console.log('✅ Items cargados desde fetch:', loadedItems);
              setItems(loadedItems);
            } else {
              console.warn('⚠️ Remito sin items');
              setItems([]);
            }
            
            setShowNotes(!!fullRemito.notes);
            // Desactivar loading cuando todo esté listo
            setIsLoadingRemito(false);
          })
          .catch(error => {
            console.error('❌ Error fetching remito completo:', error);
            // Fallback: intentar usar los datos que ya tenemos
            const remitoItems = editingRemito.items || editingRemito.remitoItems || editingRemito.remito_items || [];
            if (Array.isArray(remitoItems) && remitoItems.length > 0) {
              const loadedItems = remitoItems.map((item: any) => ({
                product_id: String(item.product_id || item.productId || item.product?.id || item.products?.id || ''),
                product_name: String(item.product_name || item.productName || item.product?.name || item.products?.name || ""),
                product_desc: String(item.product_desc || item.productDesc || item.product?.description || item.products?.description || ""),
                product_imageUrl: String(item.product?.imageUrl || item.product?.image_url || item.products?.imageUrl || item.products?.image_url || ""),
                quantity: Number(item.quantity) || 1,
                unit_price: Number(item.unit_price || item.unitPrice || item.product?.price || item.products?.price) || 0,
                line_total: Number(item.line_total || item.lineTotal || (item.quantity * (item.unit_price || item.unitPrice))) || 0,
                isUnit: Boolean(item.is_unit || item.isUnit || false)
              }));
              setItems(loadedItems);
            } else {
              setItems([]);
            }
            setShowNotes(!!editingRemito.notes);
            // Desactivar loading incluso en caso de error
            setIsLoadingRemito(false);
          });
      } else {
        setItems([]);
        setShowNotes(false);
        setIsLoadingRemito(false);
        // Asegurar reset de valores de envío
        setShippingCost(0);
        setPreviousBalance(0);
        setAccountPayment(0);
        setIsShippingEnabled(false);
      }
    } else {
      // Reset para nuevo remito - asegurar que todos los valores estén en 0
      setItems([]);
      setSelectedProduct("");
      setQuantity(1);
      setShowNotes(false);
      setPreviousBalance(0);
      setShippingCost(0);
      setAccountPayment(0);
      setIsShippingEnabled(false);
      setIsLoadingRemito(false);
      // Set default status: buscar "Pendiente" o el que tenga is_default: true
      const defaultStatus = estados.find(e => 
        e.is_default || 
        e.name?.toLowerCase().includes('pendiente')
      ) || estados.find(e => e.is_default);
      const defaultStatusId = defaultStatus ? String(defaultStatus?.id || "") : "";
      reset({
        clientId: "",
        status: defaultStatusId,
        notes: ""
      });
    }
  }, [editingRemito, setValue, reset, estados]);

  // No cargar automáticamente el último costo de envío
  // Solo se cargará cuando el usuario marque el checkbox

  // Calcular total: productos + saldo anterior + costo de envío - pago a cuenta
  const productsTotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0);
  const total = productsTotal + previousBalance + shippingCost - accountPayment;

  const handleAddProduct = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find(p => p?.id === selectedProduct);
    if (!product) return;

    const unitPrice = Number(product.price);
    const lineTotal = unitPrice * quantity;

    const newItem: RemitoItem = {
      product_id: String(product?.id || ''),
      product_name: String(product?.name || ''),
      product_desc: String(product?.description || ''),
      product_imageUrl: String(product?.imageUrl || product?.image_url || ''),
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal
    };

    setItems(prev => [...prev, newItem]);
    setSelectedProduct("");
    setQuantity(1);
    
    // Limpiar error de validación cuando se agrega un producto
    if (validationError) {
      setValidationError("");
    }
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const lineTotal = item.unit_price * newQuantity;
        return { ...item, quantity: newQuantity, line_total: lineTotal, isUnit: item.isUnit };
      }
      return item;
    }));
  };

  const handleUpdateUnitPrice = (index: number, newPrice: number) => {
    if (newPrice < 0) return;

    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const lineTotal = newPrice * item.quantity;
        return { ...item, unit_price: newPrice, line_total: lineTotal, isUnit: item.isUnit };
      }
      return item;
    }));
    setEditingPriceIndex(null);
    setEditingPriceValue('');
  };

  const handleStartEditingPrice = (index: number) => {
    const item = items[index];
    setEditingPriceIndex(index);
    setEditingPriceValue(item.unit_price.toString());
  };

  const handleCancelEditingPrice = () => {
    setEditingPriceIndex(null);
    setEditingPriceValue('');
  };

  const handleConfirmEditingPrice = () => {
    if (editingPriceIndex === null) return;
    const newPrice = parseFloat(editingPriceValue) || 0;
    if (newPrice >= 0) {
      handleUpdateUnitPrice(editingPriceIndex, newPrice);
    } else {
      handleCancelEditingPrice();
    }
  };

  // Extraer el número de la presentación del nombre del producto (ej: "Power x6" -> 6)
  const extractPresentationNumber = (productName: string): number | null => {
    const match = productName.match(/x(\d+)$/i);
    return match ? parseInt(match[1], 10) : null;
  };

  // Extraer el nombre base del producto sin la presentación (ej: "Power x6" -> "Power")
  const extractBaseProductName = (productName: string): string => {
    return productName.replace(/\s*x\d+$/i, '').trim();
  };

  const handleToggleUnitPresentation = (index: number, isUnit: boolean) => {
    if (isUnit) {
      // Crear una nueva línea con el producto por unidad
      const parentItem = items[index];
      const presentationNumber = extractPresentationNumber(parentItem.product_name);
      const baseName = extractBaseProductName(parentItem.product_name);
      let newPrice = 0;
      
      if (presentationNumber && presentationNumber > 0) {
        // Dividir el precio por la cantidad de la presentación
        newPrice = parentItem.unit_price / presentationNumber;
      }
      
      // Crear nuevo item para unidad
      const unitItem: RemitoItem = {
        product_id: parentItem.product_id,
        product_name: baseName,
        product_desc: parentItem.product_desc,
        product_imageUrl: parentItem.product_imageUrl,
        quantity: 1, // Cantidad inicial por defecto
        unit_price: newPrice,
        line_total: newPrice,
        isUnit: true,
        parentIndex: index
      };
      
      // Insertar el nuevo item después del item padre
      setItems(prev => {
        const newItems = [...prev];
        newItems.splice(index + 1, 0, unitItem);
        return newItems;
      });
    } else {
      // Si se desmarca en un item que es unidad, eliminar esa línea
      setItems(prev => prev.filter((_, i) => i !== index));
    }
    setEditingPresentationIndex(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data: RemitoForm) => {
    // Validar que haya al menos un producto
    if (items?.length === 0) {
      setValidationError("⚠️ Debe agregar al menos un producto al remito");
      return;
    }

    // Limpiar error de validación
    setValidationError("");

    const formData = {
      ...data,
      items: items.map(item => {
        const isUnitValue = item.isUnit === true;
        console.log('💾 Item a guardar:', {
          product_name: item.product_name,
          isUnit: item.isUnit,
          isUnitValue: isUnitValue,
          'typeof isUnit': typeof item.isUnit
        });
        return {
          product_id: String(item.product_id || ''),
          product_name: String(item.product_name || ''),
          product_desc: String(item.product_desc || ''),
          quantity: Number(item.quantity || 0),
          unit_price: Number(item.unit_price || 0),
          line_total: Number(item.line_total || 0),
          is_unit: isUnitValue,
          isUnit: isUnitValue // Enviar ambos por si acaso
        };
      }),
      shippingCost: shippingCost || 0, // Si el checkbox no está marcado, shippingCost ya es 0
      previousBalance,
      accountPayment,
      total
    };

    onSubmit(formData);
  };

  const handleNewClient = () => {
    setShowClientForm(true);
  };

  const handleCloseClientForm = () => {
    setShowClientForm(false);
  };

  const handleSubmitClient = async (clientData: any) => {
    if (!companyId) {
      alert('No se puede crear un cliente sin una empresa seleccionada');
      return;
    }
    
    setIsSubmittingClient(true);
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...clientData,
          companyId: companyId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear cliente');
      }

      const newClient = await response.json();
      
      // Guardar el ID del nuevo cliente para seleccionarlo cuando aparezca en la lista
      setNewClientId(newClient?.id);
      
      // Llamar al callback para actualizar la lista de clientes (esto invalidará y refetcheará)
      if (onClientCreated) {
        await onClientCreated(newClient);
      }
      
      // Cerrar el modal de cliente
      setShowClientForm(false);
    } catch (error: any) {
      console.error('Error creating client:', error);
      alert(error.message || 'Error al crear cliente');
    } finally {
      setIsSubmittingClient(false);
    }
  };

  const handleCancel = () => {
    // Resetear todos los valores antes de cerrar
    reset({
      clientId: "",
      status: "",
      notes: ""
    });
    setItems([]);
    setSelectedProduct("");
    setQuantity(1);
    setShowNotes(false);
    setShippingCost(0);
    setPreviousBalance(0);
    setAccountPayment(0);
    setIsShippingEnabled(false);
    setIsLoadingRemito(false);
    onClose();
  };
  
  const handleShippingToggle = async (checked: boolean) => {
    setIsShippingEnabled(checked);
    if (!checked) {
      // Si se desmarca, poner shippingCost en 0
      setShippingCost(0);
    } else {
      // Si se marca y shippingCost es 0, cargar último costo de envío desde la base de datos
      // Solo para nuevos remitos (no cuando se está editando)
      if (companyId && shippingCost === 0 && !editingRemito) {
        try {
          const response = await fetch(`/api/remitos?lastShippingCost=true&companyId=${companyId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.lastShippingCost && data.lastShippingCost > 0) {
              setShippingCost(data.lastShippingCost);
            }
          }
        } catch (error) {
          console.error('Error fetching last shipping cost:', error);
        }
      }
    }
  };

  // Filtrar productos que ya están en el remito
  const availableProducts = products.filter(p => 
    !items.some(item => item.product_id === p?.id)
  );

  return (
    <>
    <FormModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={editingRemito ? `Editar Remito #${editingRemito.number}` : "Nuevo Remito"}
      onSubmit={handleSubmit(handleFormSubmit, (errors) => {
        console.log('Validation errors:', errors);
      })}
      submitText={editingRemito ? "Actualizar" : "Guardar"}
      isSubmitting={isSubmitting}
      modalClassName="remito-modal"
      modalId={editingRemito ? `remito-${editingRemito.id}` : "nuevo-remito"}
      modalComponent="RemitoFormComplete"
      footerLeftContent={
        <div style={{ fontSize: '18px', fontWeight: 500 }}>
          {isLoadingRemito ? (
            <span style={{ color: '#6b7280' }}>Cargando...</span>
          ) : (
            <>Total: {total.toLocaleString('es-AR', { 
              style: 'currency', 
              currency: 'ARS' 
            })}</>
          )}
        </div>
      }
      modalType="form"
      modalProps={{
        clients,
        products,
        estados,
        companyId,
        editingRemito
      }}
    >
      {/* Preloader mientras se cargan los datos del remito */}
      {isLoadingRemito && editingRemito ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '300px',
          padding: '2rem'
        }}>
          <LoadingSpinner message="Cargando remito..." size="lg" />
        </div>
      ) : (
        <>
      {/* Error de validación */}
      {validationError && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.375rem',
          color: '#991b1b',
          fontSize: '0.875rem',
          fontWeight: '500',
          marginBottom: '1rem'
        }}>
          {validationError}
        </div>
      )}
      
      {/* Cliente */}
      <div className="form-group" style={{ marginBottom: '0.5rem' }}>
        <label className="form-label-large" style={{ marginBottom: '0.5rem', display: 'block' }}>
          Cliente *
          {errors?.clientId && (
            <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '0.875rem', fontWeight: 'normal' }}>
              {errors.clientId.message}
            </span>
          )}
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <FilterableSelect
              options={clients.map(client => ({ id: String(client?.id || ''), name: String(client?.name || '') }))}
              value={String(watch("clientId") || "")}
              onChange={(value) => {
                setValue("clientId", String(value || ""), { shouldValidate: true });
                // Limpiar error cuando se selecciona un cliente
                if (value && errors?.clientId) {
                  setValue("clientId", String(value || ""), { shouldValidate: false });
                }
              }}
              placeholder="Seleccionar cliente"
              searchFields={["name"]}
            />
          </div>
          <button
            type="button"
            onClick={handleNewClient}
            className="btn small secondary"
            title="Agregar nuevo cliente"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500',
              minWidth: 'auto',
              height: 'fit-content',
              flexShrink: 0
            }}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabla de productos */}
      <div>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '50%', fontWeight: 400, fontSize: '15px', padding: '12px 8px', textAlign: 'left' }}>Producto</th>
              <th style={{ width: '80px', fontWeight: 400, fontSize: '15px', padding: '12px 8px', textAlign: 'left' }}>Cant.</th>
              <th style={{ width: '140px', fontWeight: 400, fontSize: '15px', padding: '12px 8px', textAlign: 'left' }}>Precio</th>
              <th style={{ width: '140px', fontWeight: 400, fontSize: '15px', padding: '12px 8px', textAlign: 'left' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '12px 8px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {!isMobile && (
                      item.product_imageUrl ? (
                        <img 
                          src={item.product_imageUrl}
                          alt={item.product_name || 'Producto'}
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            objectFit: 'cover',
                            borderRadius: '4px',
                            flexShrink: 0,
                            border: '1px solid #e5e7eb',
                            display: 'block'
                          }}
                          onError={(e) => {
                            // Si la imagen falla al cargar, mostrar placeholder
                            const target = e.target as HTMLImageElement;
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Cpath d='M9 9h6v6H9z'/%3E%3C/svg%3E";
                            target.style.width = '40px';
                            target.style.height = '40px';
                            target.style.opacity = '0.5';
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <img 
                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Cpath d='M9 9h6v6H9z'/%3E%3C/svg%3E"
                          alt="Sin imagen"
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            flexShrink: 0,
                            opacity: 0.5,
                            display: 'block'
                          }}
                        />
                      )
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.product_name}</div>
                      {item.isUnit === true && (
                        <div style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>por unidad</div>
                      )}
                      {item.product_desc && item.isUnit !== true && (
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.product_desc}</div>
                      )}
                    </div>
                    {!item.isUnit && editingPresentationIndex === index ? (
                      // Solo mostrar modo edición si NO es unidad
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={(e) => handleToggleUnitPresentation(index, e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>Agregar por unidad</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditingPresentationIndex(null)}
                          style={{
                            padding: '2px 6px',
                            fontSize: '11px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : !item.isUnit && extractPresentationNumber(item.product_name) !== null ? (
                      // Solo mostrar el lápiz si el producto tiene presentación (x6, x12, etc.) y NO es unidad
                      <button
                        type="button"
                        onClick={() => setEditingPresentationIndex(index)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          opacity: 0.6,
                          transition: 'opacity 0.2s',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.backgroundColor = '#e5e7eb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.opacity = '0.6';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        title="Agregar versión por unidad"
                      >
                        <Pencil className="h-3.5 w-3.5" style={{ color: '#6b7280' }} />
                      </button>
                    ) : null}
                  </div>
                </td>
                <td style={{ padding: '12px 8px', verticalAlign: 'middle' }}>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value) || 1)}
                    style={{ width: '60px', fontSize: '14px', padding: '4px 8px' }}
                  />
                </td>
                <td style={{ fontSize: '14px', padding: '12px 8px', verticalAlign: 'middle' }}>
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile && editingPriceIndex !== index) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (editingPriceIndex !== index) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {editingPriceIndex === index ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingPriceValue}
                          onChange={(e) => {
                            setEditingPriceValue(e.target.value);
                          }}
                          onBlur={handleConfirmEditingPrice}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleConfirmEditingPrice();
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              handleCancelEditingPrice();
                            }
                          }}
                          autoFocus
                          style={{ 
                            width: '100px', 
                            fontSize: '14px', 
                            padding: '4px 8px',
                            border: '1px solid #3b82f6',
                            borderRadius: '4px',
                            textAlign: 'right'
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleConfirmEditingPrice}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px 6px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            flexShrink: 0
                          }}
                          title="Confirmar"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditingPrice}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px 6px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            flexShrink: 0
                          }}
                          title="Cancelar"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <span>
                          {(Number(item.unit_price) || 0).toLocaleString('es-AR', { 
                            style: 'currency', 
                            currency: 'ARS' 
                          })}
                        </span>
                        {!isMobile && (
                          <button
                            type="button"
                            onClick={() => handleStartEditingPrice(index)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '4px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              opacity: 0.6,
                              transition: 'opacity 0.2s',
                              flexShrink: 0
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '1';
                              e.currentTarget.style.backgroundColor = '#e5e7eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '0.6';
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title="Editar precio unitario"
                          >
                            <Pencil className="h-3.5 w-3.5" style={{ color: '#6b7280' }} />
                          </button>
                        )}
                        {isMobile && (
                          <button
                            type="button"
                            onClick={() => handleStartEditingPrice(index)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '4px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                            title="Editar precio unitario"
                          >
                            <Pencil className="h-3.5 w-3.5" style={{ color: '#6b7280' }} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td style={{ 
                  fontSize: '14px', 
                  padding: '12px 8px',
                  verticalAlign: 'middle'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span>
                      {(Number(item.line_total) || 0).toLocaleString('es-AR', { 
                        style: 'currency', 
                        currency: 'ARS' 
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="small danger"
                      style={{ flexShrink: 0 }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {/* Fila para agregar nuevo producto */}
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td style={{ padding: '12px 8px', verticalAlign: 'middle' }}>
                <FilterableSelect
                  options={availableProducts.map(product => ({ 
                    id: product?.id, 
                    name: product?.name
                  }))}
                  value={selectedProduct}
                  onChange={(value) => {
                    setSelectedProduct(value);
                    // Auto-agregar producto al seleccionar
                    if (value && quantity > 0) {
                      const product = products.find(p => p?.id === value);
                      if (product) {
                        const unitPrice = Number(product.price);
                        const lineTotal = unitPrice * quantity;
                        const newItem: RemitoItem = {
                          product_id: String(product?.id || ''),
                          product_name: String(product?.name || ''),
                          product_desc: String(product?.description || ''),
                          product_imageUrl: String(product?.imageUrl || product?.image_url || ''),
                          quantity,
                          unit_price: unitPrice,
                          line_total: lineTotal
                        };
                        setItems(prev => [...prev, newItem]);
                        setSelectedProduct("");
                        setQuantity(1);
                      }
                    }
                  }}
                  placeholder="Seleccionar producto"
                  searchFields={["name"]}
                />
              </td>
              <td style={{ padding: '12px 8px', verticalAlign: 'middle' }}>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  style={{ width: '60px', fontSize: '14px', padding: '4px 8px' }}
                />
              </td>
              <td style={{ fontSize: '14px', padding: '12px 8px', verticalAlign: 'middle' }}>
                {selectedProduct && (
                  (() => {
                    const product = products.find(p => p?.id === selectedProduct);
                    return product ? 
                      (Number(product.price) || 0).toLocaleString('es-AR', { 
                        style: 'currency', 
                        currency: 'ARS' 
                      }) : 
                      '$0,00';
                  })()
                )}
              </td>
              <td style={{ fontSize: '14px', padding: '12px 8px', verticalAlign: 'middle' }}>
                {selectedProduct && (
                  (() => {
                    const product = products.find(p => p?.id === selectedProduct);
                    return product ? 
                      ((Number(product.price) || 0) * quantity).toLocaleString('es-AR', { 
                        style: 'currency', 
                        currency: 'ARS' 
                      }) : 
                      '$0,00';
                  })()
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Observaciones */}
      <div style={{ 
        marginTop: '0.125rem',
        marginBottom: showNotes ? '0' : '0.125rem',
        padding: '0'
      }}>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="small"
          style={{ 
            fontSize: '12px', 
            padding: '0', 
            color: '#3b82f6',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontWeight: '500'
          }}
        >
          {showNotes ? '− Ocultar observaciones' : '+ Agregar observaciones'}
        </button>
      </div>

      {/* Notas (opcional) */}
      {showNotes && (
        <div className="form-group" style={{ marginTop: '0', marginBottom: '0.25rem' }}>
          <textarea
            {...register("notes")}
            placeholder="Observaciones del remito..."
            rows={3}
          />
        </div>
      )}

      {/* Estado, Envío, Saldo Anterior y Pago a cuenta - en una fila */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', 
        gap: '1rem', 
        marginTop: '0.25rem', 
        marginBottom: '0.75rem' 
      }}>
        {/* Estado */}
        <div className="form-group" style={{ marginBottom: '0' }}>
          <label className="form-label-large" style={{ marginBottom: '0.5rem', display: 'block' }}>
            Estado *
            {errors?.status && (
              <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '0.875rem', fontWeight: 'normal' }}>
                {errors.status.message}
              </span>
            )}
          </label>
          <div style={{ width: '100%', minWidth: '200px' }}>
            <FilterableSelect
              options={estados.map(estado => ({ 
                id: String(estado?.id || ''), 
                name: String(estado?.name || ''),
                color: estado?.color 
              }))}
              value={String(watch("status") || "")}
              onChange={(value) => setValue("status", String(value || ""), { shouldValidate: true })}
              placeholder="Seleccionar estado"
              searchFields={["name"]}
              showColors={true}
              searchable={false}
            />
          </div>
        </div>

        {/* Envío */}
        <div className="form-group" style={{ marginBottom: '0' }}>
          <label className="form-label-large" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={isShippingEnabled}
              onChange={(e) => handleShippingToggle(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0, margin: 0 }}
            />
            <span>Envío</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={shippingCost || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              setShippingCost(value);
              // Si el usuario ingresa un valor > 0, marcar el checkbox automáticamente
              if (value > 0 && !isShippingEnabled) {
                setIsShippingEnabled(true);
              }
            }}
            disabled={!isShippingEnabled}
            placeholder="0.00"
            style={{ 
              width: '100%', 
              fontSize: '14px', 
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: isShippingEnabled ? 'white' : '#f3f4f6',
              cursor: isShippingEnabled ? 'text' : 'not-allowed',
              marginTop: 0
            }}
          />
        </div>

        {/* Saldo Anterior */}
        <div className="form-group" style={{ marginBottom: '0' }}>
          <label className="form-label-large" style={{ marginBottom: '0.5rem', display: 'block' }}>
            Saldo Anterior
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={previousBalance}
            onChange={(e) => setPreviousBalance(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            style={{ 
              width: '100%', 
              fontSize: '14px', 
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
        </div>

        {/* Pago a cuenta */}
        <div className="form-group" style={{ marginBottom: '0' }}>
          <label className="form-label-large" style={{ marginBottom: '0.5rem', display: 'block' }}>
            Pago a cuenta
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '14px',
              fontWeight: 500,
              color: '#6b7280',
              pointerEvents: 'none'
            }}>-</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={accountPayment}
              onChange={(e) => setAccountPayment(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              style={{ 
                width: '100%', 
                fontSize: '14px', 
                padding: '8px 12px 8px 24px',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>
        </div>
      </div>
        </>
      )}
    </FormModal>
    
    {/* Modal para nuevo cliente - renderizado fuera del FormModal para evitar anidamiento */}
    <ClienteForm
      isOpen={showClientForm}
      onClose={handleCloseClientForm}
      onSubmit={handleSubmitClient}
      isSubmitting={isSubmittingClient}
      nested={false}
    />
  </>
  );
}
