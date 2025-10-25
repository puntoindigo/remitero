"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductForm as ProductFormData, productSchema } from "@/lib/validations";
import { FormModal } from "@/components/common/FormModal";
import FilterableSelect from "@/components/common/FilterableSelect";

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
      categoryId: ""
    }
  });

  useEffect(() => {
    if (editingProduct) {
      setValue("name", editingProduct?.name);
      setValue("description", editingProduct.description || "");
      setValue("price", editingProduct.price);
      setValue("stock", editingProduct.stock || "OUT_OF_STOCK");
      setValue("categoryId", editingProduct.categoryId || "");
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        stock: "OUT_OF_STOCK",
        categoryId: ""
      });
    }
  }, [editingProduct, setValue, reset]);

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
      onSubmit={handleSubmit(handleFormSubmit)}
      isSubmitting={isSubmitting}
      submitText={editingProduct ? "Actualizar" : "Guardar"}
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label-large">Nombre del producto *</label>
          <input
            {...register("name")}
            type="text"
            placeholder="Ingresa el nombre del producto"
            className="form-input-standard"
          />
          {errors?.name && (
            <p className="error-message">{errors?.name.message}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label-large">Precio *</label>
          <div className="price-input-standard">
            <span className="price-symbol-standard">$</span>
            <input
              {...register("price", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="form-input-standard"
            />
          </div>
          {errors.price && (
            <p className="error-message">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label-large">Categoría</label>
          <FilterableSelect
            options={[
              { id: "", name: "Sin categoría" },
              ...categories.map(cat => ({ id: cat?.id, name: cat?.name }))
            ]}
            value={watch("categoryId") || ""}
            onChange={(value) => setValue("categoryId", value)}
            placeholder="Seleccionar categoría"
            searchFields={["name"]}
            className="form-select-standard"
          />
        </div>

        <div className="form-group">
          <label className="form-label-large">Estado de stock</label>
          <select {...register("stock")} className="form-select-standard">
            <option value="IN_STOCK">Con stock</option>
            <option value="OUT_OF_STOCK">Sin stock</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label-large">Descripción</label>
        <textarea
          {...register("description")}
          placeholder="Descripción del producto (opcional)"
          rows={3}
          className="form-textarea-standard"
        />
        {errors.description && (
          <p className="error-message">{errors.description.message}</p>
        )}
      </div>
    </FormModal>
  );
}

