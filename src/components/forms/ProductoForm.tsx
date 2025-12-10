"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Check, Upload, Image as ImageIcon, Trash2, Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import FilterableSelect from "../common/FilterableSelect";
import { ProductForm as ProductFormData, productSchema } from "@/lib/validations";
import { FormModal } from "@/components/common/FormModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { productKeys } from "@/hooks/queries/useProductosQuery";

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
  companyId?: string | null;
}

export function ProductoForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingProduct,
  categories,
  companyId
}: ProductoFormProps) {
  const queryClient = useQueryClient();
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
      stock: "IN_STOCK",
      categoryId: "" // Será requerido, pero iniciamos vacío
    }
  });

  const currentStock = watch("stock") || "IN_STOCK";
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showMultipleProductsModal, setShowMultipleProductsModal] = useState(false);
  const [pendingMultipleFiles, setPendingMultipleFiles] = useState<File[]>([]);
  const [isMultipleProductsMode, setIsMultipleProductsMode] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<Array<{ name: string; price: number; fileName: string }>>([]);

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
      setValue("stock", (editingProduct.stock || "IN_STOCK") as any);
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
        stock: "IN_STOCK",
        categoryId: "", // Requerido, pero se inicia vacío para mostrar el error si no se selecciona
        imageUrl: ""
      });
      setPriceDisplay("");
      setPriceRaw("");
      setImagePreview(null);
      setImageFile(null);
      setImageFiles([]);
      setIsMultipleProductsMode(false);
      setPendingMultipleFiles([]);
      setParsedProducts([]);
    }
  }, [editingProduct, setValue, reset]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Validar todos los archivos
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
      
      const isValidType = validImageTypes.includes(file.type) || 
                          validExtensions.includes(fileExtension) ||
                          file.type === '';
      
      if (!isValidType) {
        alert(`El archivo "${file.name}" no es una imagen válida (JPEG, PNG, WebP, GIF)`);
        continue;
      }

      if (file.size > maxSize) {
        alert(`El archivo "${file.name}" es mayor a 5MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Si hay múltiples archivos y no estamos editando, cambiar a modo múltiples productos
    if (validFiles.length > 1 && !editingProduct) {
      setPendingMultipleFiles(validFiles);
      setIsMultipleProductsMode(true);
      
      // Parsear todos los archivos para mostrar preview
      const parsed = validFiles.map(file => {
        const { name, price } = parseFileName(file.name);
        return { name, price, fileName: file.name };
      });
      setParsedProducts(parsed);
      
      // Limpiar campos que no se usan en modo múltiples
      setValue("name", "");
      setValue("price", 0);
      setPriceDisplay("");
      setPriceRaw("");
      
      // Limpiar el input
      if (e.target) {
        e.target.value = '';
      }
      return;
    }
    
    // Si es un solo archivo, salir del modo múltiples
    if (validFiles.length === 1) {
      setIsMultipleProductsMode(false);
      setPendingMultipleFiles([]);
      setParsedProducts([]);
    }

    // Si es un solo archivo o estamos editando, comportamiento normal
    const file = validFiles[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
    setImageFiles([file]);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageFiles([]);
    setValue("imageUrl", "");
    // Si estaba en modo múltiples, salir de ese modo
    if (isMultipleProductsMode) {
      setIsMultipleProductsMode(false);
      setPendingMultipleFiles([]);
      setParsedProducts([]);
    }
  };

  // Función para parsear nombre y precio desde el nombre del archivo
  const parseFileName = (fileName: string): { name: string; price: number } => {
    // Remover la extensión del archivo
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    
    // Hacer split por guion bajo
    const parts = nameWithoutExt.split('_');
    
    if (parts.length >= 2) {
      // Si hay al menos dos partes, la primera es el nombre y la segunda es el precio
      const name = parts[0].trim();
      const priceStr = parts[1].trim();
      const price = parseFloat(priceStr.replace(',', '.')) || 0;
      return { name, price };
    } else {
      // Si no hay guion bajo, usar el nombre completo como nombre y precio 0
      return { name: nameWithoutExt.trim(), price: 0 };
    }
  };

  // Confirmar creación de múltiples productos (ahora se llama desde el submit del formulario)
  const handleCreateMultipleProducts = async () => {
    if (pendingMultipleFiles.length === 0) return;

    if (!companyId) {
      alert('No se puede crear productos: CompanyId no disponible');
      setPendingMultipleFiles([]);
      return;
    }

    setIsUploadingImage(true);
    try {
      const categoryId = watch("categoryId");
      const stock = watch("stock") || "IN_STOCK";
      const description = watch("description") || "";

      if (!categoryId) {
        alert('Debes seleccionar una categoría para crear los productos');
        setIsUploadingImage(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Procesar cada archivo
      for (const file of pendingMultipleFiles) {
        try {
          const { name: productName, price } = parseFileName(file.name);

          // Subir la imagen
          const formData = new FormData();
          formData.append('file', file);

          const uploadResponse = await fetch('/api/products/upload-image', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.message || `Error al subir la imagen ${file.name}`);
          }

          const { imageUrl } = await uploadResponse.json();

          // Crear el producto directamente llamando a la API
          const productResponse = await fetch('/api/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: productName,
              description,
              price,
              stock,
              categoryId,
              companyId,
              imageUrl
            }),
          });

          if (!productResponse.ok) {
            const errorData = await productResponse.json();
            throw new Error(errorData.message || `Error al crear el producto ${productName}`);
          }

          successCount++;
        } catch (error: any) {
          errorCount++;
          errors.push(`${file.name}: ${error.message}`);
          console.error(`Error al procesar ${file.name}:`, error);
        }
      }

      // Mostrar resultado
      if (successCount > 0) {
        if (errorCount > 0) {
          alert(`Se crearon ${successCount} producto(s) correctamente. ${errorCount} producto(s) fallaron:\n${errors.join('\n')}`);
        } else {
          alert(`Se crearon ${successCount} producto(s) correctamente.`);
        }
      } else {
        alert(`Error al crear los productos:\n${errors.join('\n')}`);
      }

      // Limpiar estado y cerrar formulario solo si hubo al menos un éxito
      if (successCount > 0) {
        setPendingMultipleFiles([]);
        setIsMultipleProductsMode(false);
        setParsedProducts([]);
        reset();
        setPriceDisplay("");
        setImagePreview(null);
        setImageFile(null);
        setImageFiles([]);
        // Cerrar el formulario después de crear los productos
        onClose();
      } else {
        setPendingMultipleFiles([]);
      }

      // Invalidar queries para refrescar la lista
      if (successCount > 0) {
        await queryClient.invalidateQueries({ 
          queryKey: productKeys.lists(),
          refetchType: 'active'
        });
      }
    } catch (error: any) {
      console.error('Error al procesar múltiples productos:', error);
      alert(error.message || 'Error al crear los productos');
      setPendingMultipleFiles([]);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Cancelar creación de múltiples productos
  const handleCancelMultipleProducts = () => {
    setShowMultipleProductsModal(false);
    setPendingMultipleFiles([]);
    setIsMultipleProductsMode(false);
    setParsedProducts([]);
    // Limpiar el input de archivo
    const inputs = document.querySelectorAll('input[type="file"]');
    inputs.forEach((input: any) => {
      if (input) input.value = '';
    });
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      // Si estamos en modo múltiples productos, usar esa lógica
      if (isMultipleProductsMode && pendingMultipleFiles.length > 0) {
        await handleCreateMultipleProducts();
        return;
      }
      
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
      setImageFiles([]);
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
      submitText={editingProduct ? "Actualizar" : (isMultipleProductsMode ? `Crear ${pendingMultipleFiles.length} productos` : "Guardar")}
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
          {isMultipleProductsMode ? `Imágenes de productos (${pendingMultipleFiles.length} archivos)` : 'Imagen del producto'}
        </label>
        
        {/* Mensaje cuando hay múltiples productos */}
        {isMultipleProductsMode && (
          <div style={{
            padding: '12px',
            backgroundColor: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            marginBottom: '12px',
            fontSize: '14px',
            color: '#1e40af'
          }}>
            <strong>Modo: Creación múltiple</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
              Se crearán {pendingMultipleFiles.length} productos. El nombre y precio se extraerán del nombre de cada archivo (formato: NOMBRE_PRECIO).
            </p>
            <button
              type="button"
              onClick={handleRemoveImage}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500
              }}
            >
              Limpiar archivos
            </button>
          </div>
        )}
        
        {/* Mostrar múltiples imágenes en modo múltiples */}
        {isMultipleProductsMode && pendingMultipleFiles.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '12px',
            marginTop: '8px'
          }}>
            {pendingMultipleFiles.map((file, index) => {
              const preview = URL.createObjectURL(file);
              // Limpiar URL cuando el componente se desmonte
              return (
                <div key={index} style={{
                  position: 'relative',
                  border: '2px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '8px',
                  backgroundColor: '#f9fafb',
                  aspectRatio: '1'
                }}>
                  <img
                    src={preview}
                    alt={file.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                    onLoad={() => {
                      // El navegador manejará la limpieza automáticamente
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 500
                  }}>
                    {index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        ) : imagePreview ? (
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
                multiple={!editingProduct}
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
              multiple={!editingProduct}
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
                {editingProduct ? 'JPEG, PNG, WebP, GIF (máx. 5MB)' : 'JPEG, PNG, WebP, GIF (máx. 5MB) - Puedes subir múltiples imágenes'}
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

      {/* Preview de productos cuando hay múltiples */}
      {isMultipleProductsMode && parsedProducts.length > 0 && (
        <div className="form-group">
          <label className="form-label-large" style={{ marginBottom: '8px' }}>
            Productos que se crearán ({parsedProducts.length})
          </label>
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: '#f9fafb'
          }}>
            {parsedProducts.map((product, index) => (
              <div key={index} style={{
                padding: '10px 12px',
                borderBottom: index < parsedProducts.length - 1 ? '1px solid #e5e7eb' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: '#111827', fontSize: '14px' }}>
                    {product.name || product.fileName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {product.fileName}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: '#059669',
                  marginLeft: '12px'
                }}>
                  ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campos normales solo si NO estamos en modo múltiples */}
      {!isMultipleProductsMode && (
        <>
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
        </>
      )}

    </FormModal>
  );
}

