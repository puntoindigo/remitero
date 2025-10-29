"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormModal } from "@/components/common/FormModal";

const categoriaSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

type CategoriaFormData = z.infer<typeof categoriaSchema>;

interface CategoriaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoriaFormData) => Promise<void>;
  isSubmitting: boolean;
  editingCategoria?: { id: string; name: string } | null;
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
      name: editingCategoria?.name || ""
    }
  });

  // Reset form when editingCategoria changes
  useEffect(() => {
    if (editingCategoria) {
      reset({ 
        name: editingCategoria?.name
      }, []);
    } else {
      reset({ 
        name: ""
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
        <label className="form-label-large">Nombre de la categoría</label>
        <input
          {...register("name")}
          type="text"
          placeholder="Ingresa el nombre de la categoría"
          className="form-input-standard"
        />
        {errors?.name && (
          <p className="error-message">{errors?.name.message}</p>
        )}
      </div>
    </FormModal>
  );
}
