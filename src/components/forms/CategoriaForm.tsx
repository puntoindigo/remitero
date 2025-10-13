"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormModal } from "@/components/common/FormModal";

const categoriaSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

interface CategoriaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoriaFormData) => Promise<void>;
  isSubmitting: boolean;
  editingCategoria?: { id: string; name: string; description?: string } | null;
}

export function CategoriaForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingCategoria
}: CategoriaFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      name: editingCategoria?.name || "",
      description: editingCategoria?.description || ""
    }
  });

  // Reset form when editingCategoria changes
  React.useEffect(() => {
    if (editingCategoria) {
      reset({ 
        name: editingCategoria.name,
        description: editingCategoria.description || ""
      });
    } else {
      reset({ 
        name: "",
        description: ""
      });
    }
  }, [editingCategoria, reset]);

  const handleFormSubmit = async (data: CategoriaFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitText={editingCategoria ? "Actualizar" : "Guardar"}
      isSubmitting={isSubmitting}
    >
      <div className="form-group">
        <label>Nombre de la categoría</label>
        <input
          {...register("name")}
          type="text"
          placeholder="Ingresa el nombre de la categoría"
        />
        {errors.name && (
          <p className="error-message">{errors.name.message}</p>
        )}
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <textarea
          {...register("description")}
          placeholder="Descripción opcional de la categoría"
          rows={3}
        />
        {errors.description && (
          <p className="error-message">{errors.description.message}</p>
        )}
      </div>
    </FormModal>
  );
}
