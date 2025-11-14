"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Check, Upload, Image as ImageIcon } from "lucide-react";
import FilterableSelect from "../common/FilterableSelect";
import { ProductForm as ProductFormData, productSchema } from "@/lib/validations";
import { FormModal } from "@/components/common/FormModal";

interface Category {
  id: string;
  name: string;
}

interface ProductoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting: boolean;
  editingProduct?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock?: string;
    categoryId?: string;
  } | null;
  categories: Category[];
}

export function ProductoForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingProduct,
  categories
}: ProductoFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: "OUT_OF_STOCK",
      categoryId: "" // Será requerido, pero iniciamos vacío
    }
  });

  const currentStock = watch("stock") || "OUT_OF_STOCK";
  const isInStock = currentStock === "IN_STOCK";

  const toggleStock = () => {
    const newStock = isInStock ? "OUT_OF_STOCK" : "IN_STOCK";
    setValue("stock", newStock as any, { shouldValidate: true });
  };

  // Estado para el precio sin formatear (mientras escribe) y formateado (para mostrar)
  const [priceDisplay, setPriceDisplay] = useState("");
  const [priceRaw, setPriceRaw] = useState(""); // Valor sin formatear mientras escribe

  // Función para formatear número con separadores de miles
  const formatPriceForDisplay = (value: string): string => {
    // Si está vacío, retornar vacío
    if (!value || value.trim() === '') return '';
    
    // Remover todos los puntos (son separadores de miles que agregaremos)
    // Solo mantener números y comas (para decimales)
    let cleaned = value.replace(/\./g, '').replace(/[^\d,]/g, '');
    
    // Si empieza con coma, agregar 0 antes
    if (cleaned.startsWith(',')) {
      cleaned = '0' + cleaned;
    }
    
    // Detectar si hay separador decimal (última coma)
    const lastComaIndex = cleaned.lastIndexOf(',');
    const hasDecimal = lastComaIndex > -1;
    
    let integerPart = '';
    let decimalPart = '';
    
    if (hasDecimal) {
      // Separar parte entera y decimal
      integerPart = cleaned.substring(0, lastComaIndex);
      decimalPart = cleaned.substring(lastComaIndex + 1);
      
      // Limitar decimales a 2 dígitos
      if (decimalPart.length > 2) {
        decimalPart = decimalPart.substring(0, 2);
      }
    } else {
      // No hay decimales, todo es parte entera
      integerPart = cleaned;
    }
    
    // Remover cualquier coma que quede en la parte entera
    integerPart = integerPart.replace(/,/g, '');
    
    // Formatear parte entera con separadores de miles (puntos cada 3 dígitos)
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Combinar con decimales si existen
    if (hasDecimal) {
      return `${formattedInteger},${decimalPart}`;
    }
    
    return formattedInteger;
  };

  // Función para limpiar el input mientras escribe
  // Solo permite números y una coma para decimales (al final)
  const cleanPriceInput = (value: string): string => {
    // Remover todo excepto números y comas
    let cleaned = value.replace(/[^\d,]/g, '');
    
    // IMPORTANTE: Remover TODOS los puntos que el usuario pueda escribir
    // Los puntos que vemos son solo visuales (separadores de miles agregados por el formato)
    // No deben ser parte del valor real mientras escribe
    cleaned = cleaned.replace(/\./g, '');
    
    // Solo permitir una coma, y debe estar al final (para decimales)
    const comaIndex = cleaned.lastIndexOf(',');
    if (comaIndex > -1) {
      // Si hay coma, verificar que esté al final o en los últimos 2 caracteres
      const charsAfterComa = cleaned.length - comaIndex - 1;
      if (charsAfterComa > 2) {
        // Si hay más de 2 caracteres después de la coma, no es un decimal válido
        // Remover todas las comas (el usuario probablemente está escribiendo la parte entera)
        cleaned = cleaned.replace(/,/g, '');
      } else {
        // Si hay coma válida, mantener solo la última y remover las demás
        cleaned = cleaned.substring(0, comaIndex).replace(/,/g, '') + ',' + cleaned.substring(comaIndex + 1);
      }
    }
    
    return cleaned;
  };

  // Función para convertir precio formateado a número
  const parsePrice = (value: string): number => {
    // Remover separadores de miles (puntos) y convertir coma decimal a punto
    // Primero remover puntos (separadores de miles)
    let cleaned = value.replace(/\./g, '');
    // Luego convertir coma decimal a punto
    cleaned = cleaned.replace(',', '.');
    const parsed = parseFloat(cleaned) || 0;
    return parsed;
  };

  // Manejar cambio en el input de precio (con formato en tiempo real)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Primero limpiar: solo números y comas, sin puntos
    const cleaned = cleanPriceInput(inputValue);
    setPriceRaw(cleaned);
    
    // Aplicar formato mientras escribe (agrega puntos como separadores de miles)
    // El formato remueve los puntos y los agrega correctamente
    const formatted = formatPriceForDisplay(cleaned);
    setPriceDisplay(formatted);
    
    // Actualizar el valor numérico en el formulario (usando el valor sin formato)
    const numericValue = parsePrice(cleaned);
    setValue("price", numericValue, { shouldValidate: true });
  };

  // Manejar cuando el usuario sale del campo (asegurar formato final)
  const handlePriceBlur = () => {
    if (priceRaw) {
      const formatted = formatPriceForDisplay(priceRaw);
      setPriceDisplay(formatted);
    }
  };

  useEffect(() => {
    if (editingProduct) {
      setValue("name", editingProduct?.name);
      setValue("description", editingProduct.description || "");
      setValue("price", editingProduct.price);
      setValue("stock", (editingProduct.stock || "OUT_OF_STOCK") as any);
      setValue("categoryId", editingProduct.categoryId || "");
      // Formatear precio para mostrar
      const priceStr = editingProduct.price.toString();
      // Si tiene decimales, usar coma como separador decimal
      const priceWithComma = priceStr.replace('.', ',');
      const formattedPrice = formatPriceForDisplay(priceWithComma);
      setPriceDisplay(formattedPrice);
      setPriceRaw(priceWithComma);
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        stock: "OUT_OF_STOCK",
        categoryId: "" // Requerido, pero se inicia vacío para mostrar el error si no se selecciona
      });
      setPriceDisplay("");
      setPriceRaw("");
    }
  }, [editingProduct, setValue, reset]);

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data);
    reset();
    setPriceDisplay("");
  };

  // Manejar ENTER en los campos para activar el submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Si es textarea, Shift+Enter crea nueva línea, Enter solo activa submit
      // Si es input, Enter activa submit
      e.preventDefault();
      e.stopPropagation();
      // Disparar el submit del formulario
      const form = e.currentTarget.closest('form');
      if (form) {
        const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (submitButton && !isSubmitting) {
          submitButton.click();
        }
      }
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
      onSubmit={handleSubmit(handleFormSubmit)}
      isSubmitting={isSubmitting}
      submitText={editingProduct ? "Actualizar" : "Guardar"}
      modalId={editingProduct ? `producto-${editingProduct.id}` : "nuevo-producto"}
      modalComponent="ProductoForm"
      modalType="form"
      modalClassName="producto-modal"
      modalProps={{
        editingProduct,
        categories
      }}
    >
      {/* Upload de imagen (deshabilitado por ahora) */}
      <div className="form-group">
        <label style={{ 
          fontSize: '14px', 
          fontWeight: 500, 
          marginBottom: '0.5rem', 
          display: 'block',
          color: '#6b7280'
        }}>
          Imagen del producto
        </label>
        <div
          style={{
            border: '2px dashed #d1d5db',
            borderRadius: '0.5rem',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            cursor: 'not-allowed',
            opacity: 0.6,
            position: 'relative'
          }}
        >
          <input
            type="file"
            accept="image/*"
            disabled
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'not-allowed'
            }}
          />
          <div style={{ pointerEvents: 'none' }}>
            <ImageIcon 
              className="h-12 w-12" 
              style={{ 
                color: '#9ca3af', 
                margin: '0 auto 0.75rem',
                display: 'block'
              }} 
            />
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: '#6b7280',
              fontWeight: 500
            }}>
              Subir imagen
            </p>
            <p style={{ 
              margin: '0.25rem 0 0 0', 
              fontSize: '12px', 
              color: '#9ca3af'
            }}>
              Próximamente
            </p>
          </div>
        </div>
      </div>

      <FilterableSelect
        options={categories.map(cat => ({ id: cat?.id, name: cat?.name }))}
        value={watch("categoryId") || ""}
        onChange={(value) => setValue("categoryId", value || "", { shouldValidate: true })}
        placeholder="Seleccionar categoría *"
        searchFields={["name"]}
        className="form-select-standard"
      />
      {errors?.categoryId && (
        <p className="error-message">{errors?.categoryId.message}</p>
      )}

      <div className="form-row" style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <input
            {...register("name")}
            type="text"
            placeholder="Nombre *"
            className="form-input-standard"
            onKeyDown={handleKeyDown}
          />
          {errors?.name && (
            <p className="error-message">{errors?.name.message}</p>
          )}
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <div className="price-input-standard">
            <span className="price-symbol-standard">$</span>
            <input
              type="text"
              value={priceDisplay}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              onKeyDown={handleKeyDown}
              placeholder="Precio *"
              className="form-input-standard"
              inputMode="decimal"
            />
          </div>
          {errors.price && (
            <p className="error-message">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="form-group">
        <textarea
          {...register("description")}
          placeholder="Descripción (opcional)"
          rows={3}
          className="form-textarea-standard"
          onKeyDown={handleKeyDown}
        />
        {errors.description && (
          <p className="error-message">{errors.description.message}</p>
        )}
      </div>

      {/* Stock abajo a la izquierda */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        marginTop: '0.5rem'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>Stock:</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleStock();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
          }}
          title="Modificar stock"
        >
          {isInStock ? (
            <Check className="h-5 w-5" style={{ color: '#16a34a' }} />
          ) : (
            <X className="h-5 w-5" style={{ color: '#ef4444' }} />
          )}
        </button>
      </div>
    </FormModal>
  );
}

