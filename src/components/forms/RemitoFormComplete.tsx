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
  const [isSubmittingClient, setIsSubmittingClient] = useState<boolean>(false);

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

  // Cargar datos del remito en edición
  useEffect(() => {
    if (editingRemito) {
      setValue("clientId", editingRemito.client?.id || "");
      // El status ahora es un objeto con los datos del estado
      const statusId = editingRemito.status?.id || editingRemito.status;
      setValue("status", statusId || "");
      setValue("notes", editingRemito.notes || "");
      
      // Cargar items del remito (pueden venir como 'items' o 'remitoItems')
      const remitoItems = editingRemito.items || editingRemito.remitoItems || [];
      if (Array.isArray(remitoItems)) {
        setItems(remitoItems.map((item: any) => ({
          product_id: item.product_id || item.product?.id,
          product_name: item.product_name || item.product?.name || "",
          product_desc: item.product_desc || item.product?.description || "",
          quantity: item.quantity || 1,
          unit_price: item.unit_price || item.product?.price || 0,
          line_total: item.line_total || (item.quantity * item.unit_price) || 0
        })));
      }
      
      setShowNotes(!!editingRemito.notes);
    } else {
      // Reset para nuevo remito
      reset();
      setItems([]);
      setSelectedProduct("");
      setQuantity(1);
      setShowNotes(false);
      // Set default status if available
      const defaultStatus = estados.find(e => e.is_default);
      if (defaultStatus) {
        setValue("status", defaultStatus.id);
      }
    }
  }, [editingRemito, setValue, reset, estados]);

  // Calcular total
  const total = items.reduce((sum, item) => sum + (item.line_total || 0), 0);

  const handleAddProduct = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const unitPrice = Number(product.price);
    const lineTotal = unitPrice * quantity;

    const newItem: RemitoItem = {
      product_id: product.id,
      product_name: product.name,
      product_desc: product.description || '',
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal
    };

    setItems(prev => [...prev, newItem]);
    setSelectedProduct("");
    setQuantity(1);
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
    if (items.length === 0) {
      return;
    }

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
    if (!companyId) return;
    
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
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear cliente');
      }

      const newClient = await response.json();
      
      // Llamar al callback para actualizar la lista de clientes
      if (onClientCreated) {
        onClientCreated(newClient);
      }
      
      // Seleccionar el nuevo cliente en el formulario
      setValue("clientId", newClient.id);
      
      // Cerrar el modal de cliente
      setShowClientForm(false);
    } catch (error) {
      console.error('Error creating client:', error);
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
    !items.some(item => item.product_id === p.id)
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={editingRemito ? `Editar Remito #${editingRemito.number}` : "Nuevo Remito"}
      onSubmit={handleSubmit(handleFormSubmit, (errors) => {
        console.log('Validation errors:', errors);
      })}
      submitText={editingRemito ? "Actualizar" : "Crear"}
      isSubmitting={isSubmitting}
      modalClassName="remito-modal"
    >
      {/* Cliente */}
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ minWidth: '80px', marginBottom: 0 }}>Cliente *</label>
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
      </div>

      {/* Estado */}
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ minWidth: '80px', marginBottom: 0 }}>Estado *</label>
          <div style={{ flex: 1 }}>
            <FilterableSelect
              options={estados.map(estado => ({ 
                id: estado.id, 
                name: estado.name,
                color: estado.color 
              }))}
              value={watch("status") || ""}
              onChange={(value) => setValue("status", value)}
              placeholder="Seleccionar estado"
              searchFields={["name"]}
              showColors={true}
            />
            {errors.status && (
              <p className="error-message">{errors.status.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="form-section">
        <h4>Productos</h4>
        
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
                <td style={{ fontSize: '14px' }}>
                  {(Number(item.unit_price) || 0).toLocaleString('es-AR', { 
                    style: 'currency', 
                    currency: 'ARS' 
                  })}
                </td>
                <td style={{ fontSize: '14px' }}>
                  {(Number(item.line_total) || 0).toLocaleString('es-AR', { 
                    style: 'currency', 
                    currency: 'ARS' 
                  })}
                </td>
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
                  options={availableProducts.map(product => ({ 
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
                        const lineTotal = unitPrice * quantity;
                        const newItem: RemitoItem = {
                          product_id: product.id,
                          product_name: product.name,
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
                    const product = products.find(p => p.id === selectedProduct);
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
                    const product = products.find(p => p.id === selectedProduct);
                    return product ? 
                      ((Number(product.price) || 0) * quantity).toLocaleString('es-AR', { 
                        style: 'currency', 
                        currency: 'ARS' 
                      }) : 
                      '$0,00';
                  })()
                )}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '6px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>
          Total: {total.toLocaleString('es-AR', { 
            style: 'currency', 
            currency: 'ARS' 
          })}
        </div>
      </div>

      {/* Notas */}
      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <label style={{ marginBottom: 0 }}>Notas</label>
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="small"
            style={{ fontSize: '12px' }}
          >
            {showNotes ? 'Ocultar' : 'Agregar notas'}
          </button>
        </div>
        {showNotes && (
          <textarea
            {...register("notes")}
            placeholder="Notas adicionales del remito..."
            rows={3}
            style={{ marginTop: '0.5rem' }}
          />
        )}
      </div>

      {/* Modal para nuevo cliente */}
      <ClienteForm
        isOpen={showClientForm}
        onClose={handleCloseClientForm}
        onSubmit={handleSubmitClient}
        isSubmitting={isSubmittingClient}
        companyId={companyId}
      />
    </FormModal>
  );
}
