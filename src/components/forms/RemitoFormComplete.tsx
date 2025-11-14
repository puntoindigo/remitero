"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Plus } from "lucide-react";
import FilterableSelect from "@/components/common/FilterableSelect";
import { FormModal } from "@/components/common/FormModal";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { remitoSchema, type RemitoForm } from "@/lib/validations";

interface RemitoItem {
  product_id?: string;
  product_name: string;
  product_desc?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
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
  const [items, setItems] = useState<RemitoItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showClientForm, setShowClientForm] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");
  const [isSubmittingClient, setIsSubmittingClient] = useState<boolean>(false);
  const [newClientId, setNewClientId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RemitoForm>({
    resolver: zodResolver(remitoSchema)
  });

  // Efecto para seleccionar el nuevo cliente cuando aparezca en la lista
  useEffect(() => {
    if (newClientId && clients && clients.length > 0) {
      const clientExists = clients.some(c => c?.id === newClientId);
      if (clientExists) {
        // Usar setTimeout para asegurar que el DOM esté actualizado
        setTimeout(() => {
          setValue("clientId", newClientId, { shouldValidate: false });
          setNewClientId(null); // Limpiar el ID para evitar re-seleccionar
        }, 50);
      }
    }
  }, [clients, newClientId, setValue]);

  // Cargar datos del remito en edición
  useEffect(() => {
    if (editingRemito) {
      setValue("clientId", editingRemito.client?.id || "");
      // El status ahora es un objeto con los datos del estado
      const statusId = editingRemito.status?.id || editingRemito.status;
      setValue("status", statusId || "");
      setValue("notes", editingRemito.notes || "");
      
      // Cargar items del remito (pueden venir como 'items', 'remitoItems' o 'remito_items')
      const remitoItems = editingRemito.items || editingRemito.remitoItems || editingRemito.remito_items || [];
      console.log('🔍 Cargando remito para editar:', {
        remitoId: editingRemito.id,
        itemsCount: remitoItems.length,
        items: remitoItems,
        hasItems: !!editingRemito.items,
        hasRemitoItems: !!editingRemito.remitoItems,
        hasRemito_items: !!editingRemito.remito_items
      });
      
      if (Array.isArray(remitoItems) && remitoItems.length > 0) {
        const loadedItems = remitoItems.map((item: any) => ({
          product_id: item.product_id || item.productId || item.product?.id || item.products?.id || '',
          product_name: item.product_name || item.productName || item.product?.name || item.products?.name || "",
          product_desc: item.product_desc || item.productDesc || item.product?.description || item.products?.description || "",
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price || item.unitPrice || item.product?.price || item.products?.price) || 0,
          line_total: Number(item.line_total || item.lineTotal || (item.quantity * (item.unit_price || item.unitPrice))) || 0
        }));
        console.log('✅ Items cargados:', loadedItems);
        setItems(loadedItems);
      } else {
        console.warn('⚠️ No se encontraron items en el remito. Intentando fetch completo...');
        // Si no hay items, intentar hacer fetch completo del remito
        if (editingRemito.id) {
          fetch(`/api/remitos/${editingRemito.id}`)
            .then(resp => {
              if (resp.ok) {
                return resp.json();
              }
              return null;
            })
            .then(fullRemito => {
              if (fullRemito) {
                const fetchedItems = fullRemito.items || fullRemito.remitoItems || fullRemito.remito_items || [];
                if (Array.isArray(fetchedItems) && fetchedItems.length > 0) {
                  const loadedItems = fetchedItems.map((item: any) => ({
                    product_id: item.product_id || item.productId || item.product?.id || item.products?.id || '',
                    product_name: item.product_name || item.productName || item.product?.name || item.products?.name || "",
                    product_desc: item.product_desc || item.productDesc || item.product?.description || item.products?.description || "",
                    quantity: Number(item.quantity) || 1,
                    unit_price: Number(item.unit_price || item.unitPrice || item.product?.price || item.products?.price) || 0,
                    line_total: Number(item.line_total || item.lineTotal || (item.quantity * (item.unit_price || item.unitPrice))) || 0
                  }));
                  console.log('✅ Items cargados desde fetch:', loadedItems);
                  setItems(loadedItems);
                } else {
                  setItems([]);
                }
              } else {
                setItems([]);
              }
            })
            .catch(error => {
              console.error('Error fetching remito completo:', error);
              setItems([]);
            });
        } else {
          setItems([]);
        }
      }
      
      setShowNotes(!!editingRemito.notes);
    } else {
      // Reset para nuevo remito
      reset();
      setItems([]);
      setSelectedProduct("");
      setQuantity(1);
      setShowNotes(false);
      // Set default status: buscar "Pendiente" o el que tenga is_default: true
      const defaultStatus = estados.find(e => 
        e.is_default || 
        e.name?.toLowerCase().includes('pendiente')
      ) || estados.find(e => e.is_default);
      if (defaultStatus) {
        setValue("status", defaultStatus?.id);
      }
    }
  }, [editingRemito, setValue, reset, estados]);

  // Calcular total
  const total = items.reduce((sum, item) => sum + (item.line_total || 0), 0);

  const handleAddProduct = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find(p => p?.id === selectedProduct);
    if (!product) return;

    const unitPrice = Number(product.price);
    const lineTotal = unitPrice * quantity;

    const newItem: RemitoItem = {
      product_id: product?.id,
      product_name: product?.name,
      product_desc: product.description || '',
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
        return { ...item, quantity: newQuantity, line_total: lineTotal };
      }
      return item;
    }));
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
      items: items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_desc: item.product_desc,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total
      })),
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
    reset();
    setItems([]);
    setSelectedProduct("");
    setQuantity(1);
    setShowNotes(false);
    onClose();
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
      modalType="form"
      modalProps={{
        clients,
        products,
        estados,
        companyId,
        editingRemito
      }}
    >
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
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <FilterableSelect
              options={clients.map(client => ({ id: client?.id, name: client?.name }))}
              value={watch("clientId") || ""}
              onChange={(value) => setValue("clientId", value)}
              placeholder="Seleccionar cliente"
              searchFields={["name"]}
            />
            {errors.clientId && (
              <p className="error-message">{errors.clientId.message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleNewClient}
            className="btn small secondary"
            title="Agregar nuevo cliente"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500',
              minWidth: 'auto'
            }}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Tabla de productos */}
      <div>
        <table>
          <thead>
            <tr>
              <th style={{ width: '50%', fontWeight: 400, fontSize: '15px' }}>Producto</th>
              <th style={{ width: '80px', fontWeight: 400, fontSize: '15px' }}>Cant.</th>
              <th style={{ width: '140px', fontWeight: 400, fontSize: '15px' }}>Precio</th>
              <th style={{ width: '140px', fontWeight: 400, fontSize: '15px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img 
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Cpath d='M9 9h6v6H9z'/%3E%3C/svg%3E"
                      alt="Sin imagen"
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        flexShrink: 0,
                        opacity: 0.5
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.product_name}</div>
                      {item.product_desc && (
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.product_desc}</div>
                      )}
                    </div>
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
                <td style={{ fontSize: '14px' }}>
                  {(Number(item.unit_price) || 0).toLocaleString('es-AR', { 
                    style: 'currency', 
                    currency: 'ARS' 
                  })}
                </td>
                <td style={{ 
                  fontSize: '14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 8px',
                  verticalAlign: 'middle'
                }}>
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
                    style={{ marginLeft: '0.5rem' }}
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
                          product_id: product?.id,
                          product_name: product?.name,
                          product_desc: product.description || '',
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
              <td>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  style={{ width: '60px', fontSize: '14px', padding: '4px 8px' }}
                />
              </td>
              <td style={{ fontSize: '14px' }}>
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
              <td style={{ fontSize: '14px' }}>
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

      {/* Total y Observaciones en la misma línea */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '0.25rem',
        marginBottom: '0.25rem',
        padding: '0.25rem 0'
      }}>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="small"
          style={{ 
            fontSize: '12px', 
            padding: '0.25rem 0', 
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
        <div style={{ fontSize: '18px', fontWeight: 500 }}>
          Total: {total.toLocaleString('es-AR', { 
            style: 'currency', 
            currency: 'ARS' 
          })}
        </div>
      </div>

      {/* Notas (opcional) */}
      {showNotes && (
        <div className="form-group" style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
          <textarea
            {...register("notes")}
            placeholder="Observaciones del remito..."
            rows={3}
          />
        </div>
      )}

      {/* Estado - al final del formulario, en una línea */}
      <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="status" style={{ marginBottom: 0, display: 'block', fontWeight: 500, whiteSpace: 'nowrap' }}>
            Estado *
          </label>
          <div style={{ flex: 1 }}>
            <FilterableSelect
              options={estados.map(estado => ({ 
                id: estado?.id, 
                name: estado?.name,
                color: estado.color 
              }))}
              value={watch("status") || ""}
              onChange={(value) => setValue("status", value)}
              placeholder="Seleccionar estado"
              searchFields={["name"]}
              showColors={true}
              searchable={false}
            />
          </div>
        </div>
        {errors.status && (
          <p className="error-message" style={{ marginTop: '0.25rem' }}>{errors.status.message}</p>
        )}
      </div>

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
