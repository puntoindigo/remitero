"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Check, Upload, Image as ImageIcon, Trash2, Pencil } from "lucide-react";
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
    imageUrl?: string;
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
  
  // Estado para la imagen
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
      setValue("imageUrl", (editingProduct as any).imageUrl || "");
      // Formatear precio para mostrar
      const priceStr = editingProduct.price.toString();
      // Si tiene decimales, usar coma como separador decimal
      const priceWithComma = priceStr.replace('.', ',');
      const formattedPrice = formatPriceForDisplay(priceWithComma);
      setPriceDisplay(formattedPrice);
      setPriceRaw(priceWithComma);
      // Cargar imagen existente si hay
      if ((editingProduct as any).imageUrl) {
        setImagePreview((editingProduct as any).imageUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        stock: "OUT_OF_STOCK",
        categoryId: "", // Requerido, pero se inicia vacío para mostrar el error si no se selecciona
        imageUrl: ""
      });
      setPriceDisplay("");
      setPriceRaw("");
      setImagePreview(null);
      setImageFile(null);
    }
  }, [editingProduct, setValue, reset]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo - incluir WebP explícitamente
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    
    // Validar por tipo MIME y por extensión (algunos navegadores no detectan bien WebP)
    const isValidType = validImageTypes.includes(file.type) || 
                        validExtensions.includes(fileExtension) ||
                        file.type === ''; // Permitir si el tipo está vacío pero la extensión es válida
    
    if (!isValidType) {
      alert('Solo se permiten imágenes (JPEG, PNG, WebP, GIF). Tipo detectado: ' + (file.type || 'desconocido'));
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('El archivo no puede ser mayor a 5MB');
      return;
    }

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setValue("imageUrl", "");
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      // Si hay una imagen nueva, subirla primero
      if (imageFile) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('file', imageFile);
        if (editingProduct?.id) {
          formData.append('productId', editingProduct.id);
        }

        const uploadResponse = await fetch('/api/products/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || 'Error al subir la imagen');
        }

        const { imageUrl } = await uploadResponse.json();
        data.imageUrl = imageUrl;
      }

      // Si se está editando y se removió la imagen, eliminar la anterior
      if (editingProduct && (editingProduct as any).imageUrl && !imagePreview && !imageFile) {
        // Eliminar imagen anterior del storage
        try {
          await fetch(`/api/products/upload-image?imageUrl=${encodeURIComponent((editingProduct as any).imageUrl)}`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('Error al eliminar imagen anterior:', error);
          // Continuar aunque falle la eliminación
        }
        data.imageUrl = "";
      }

      await onSubmit(data);
      reset();
      setPriceDisplay("");
      setImagePreview(null);
      setImageFile(null);
    } catch (error: any) {
      console.error('Error al procesar formulario:', error);
      alert(error.message || 'Error al guardar el producto');
    } finally {
      setIsUploadingImage(false);
    }
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
      isSubmitting={isSubmitting || isUploadingImage}
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
      {/* Upload de imagen */}
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
        {imagePreview ? (
          <div style={{ position: 'relative', width: '100%' }}>
            <div
              style={{
                border: '2px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#f9fafb',
                position: 'relative',
                minHeight: '120px',
                maxHeight: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onClick={() => {
                const input = document.getElementById('change-image-input') as HTMLInputElement;
                if (input && !isUploadingImage) {
                  input.click();
                }
              }}
              title="Haz clic para cambiar la imagen"
            >
              <img
                src={imagePreview}
                alt="Vista previa"
                style={{
                  maxWidth: '100%',
                  maxHeight: '130px',
                  objectFit: 'contain',
                  borderRadius: '0.25rem',
                  pointerEvents: 'none'
                }}
              />
              {/* Botón para cambiar imagen */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const input = document.getElementById('change-image-input') as HTMLInputElement;
                  if (input && !isUploadingImage) {
                    input.click();
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  left: '0.5rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  zIndex: 10
                }}
                title="Cambiar imagen"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {/* Botón para eliminar imagen */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  zIndex: 10
                }}
                title="Eliminar imagen"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {/* Input oculto para cambiar imagen */}
              <input
                id="change-image-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                disabled={isUploadingImage}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              border: '2px dashed #d1d5db',
              borderRadius: '0.5rem',
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              cursor: isUploadingImage ? 'not-allowed' : 'pointer',
              opacity: isUploadingImage ? 0.6 : 1,
              position: 'relative',
              transition: 'all 0.2s',
              minHeight: '100px',
              maxHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.backgroundColor = '#eff6ff';
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.backgroundColor = '#f9fafb';
              const file = e.dataTransfer.files[0];
              if (file) {
                // Validar que sea una imagen (incluyendo WebP)
                const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
                const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
                const fileName = file.name.toLowerCase();
                const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
                const isValidImage = file.type.startsWith('image/') || 
                                     validImageTypes.includes(file.type) ||
                                     validExtensions.includes(fileExtension);
                
                if (isValidImage) {
                  const fakeEvent = {
                    target: { files: [file] }
                  } as any;
                  handleImageChange(fakeEvent);
                } else {
                  alert('Solo se permiten imágenes (JPEG, PNG, WebP, GIF)');
                }
              }
            }}
          >
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
              onChange={handleImageChange}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: isUploadingImage ? 'not-allowed' : 'pointer'
              }}
              disabled={isUploadingImage}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <ImageIcon 
                className="h-8 w-8" 
                style={{ 
                  color: '#9ca3af', 
                  display: 'block'
                }} 
              />
              <p style={{ 
                margin: 0, 
                fontSize: '13px', 
                color: '#6b7280',
                fontWeight: 500
              }}>
                {isUploadingImage ? 'Subiendo imagen...' : 'Haz clic para subir'}
              </p>
              <p style={{ 
                margin: 0, 
                fontSize: '11px', 
                color: '#9ca3af'
              }}>
                JPEG, PNG, WebP, GIF (máx. 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label-large">
          Categoría *
          {errors?.categoryId && (
            <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '0.875rem', fontWeight: 'normal' }}>
              {errors?.categoryId.message}
            </span>
          )}
        </label>
        <FilterableSelect
          options={categories.map(cat => ({ id: cat?.id || '', name: cat?.name || '' }))}
          value={watch("categoryId") || ""}
          onChange={(value) => setValue("categoryId", value || "", { shouldValidate: true })}
          placeholder="Seleccionar categoría"
          searchFields={["name"]}
          className="form-select-standard"
        />
      </div>

      <div className="form-row" style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label-large">
            Nombre *
            {errors?.name && (
              <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '0.875rem', fontWeight: 'normal' }}>
                {errors?.name.message}
              </span>
            )}
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Nombre"
            className="form-input-standard"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label-large">
            Precio *
            {errors?.price && (
              <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '0.875rem', fontWeight: 'normal' }}>
                {errors.price.message}
              </span>
            )}
          </label>
          <div className="price-input-standard">
            <span className="price-symbol-standard">$</span>
            <input
              type="text"
              value={priceDisplay}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              onKeyDown={handleKeyDown}
              placeholder="Precio"
              className="form-input-standard"
              inputMode="decimal"
            />
          </div>
        </div>
      </div>

      {/* Stock primero */}
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

      <div className="form-group">
        <label className="form-label-large">
          Descripción
          {errors?.description && (
            <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '0.875rem', fontWeight: 'normal' }}>
              {errors.description.message}
            </span>
          )}
        </label>
        <textarea
          {...register("description")}
          placeholder="Descripción (opcional)"
          rows={3}
          className="form-textarea-standard"
          onKeyDown={handleKeyDown}
        />
      </div>
    </FormModal>
  );
}

