"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormModal } from "@/components/common/FormModal";

const estadoRemitoSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  color: z.string().min(1, "El color es requerido"),
  is_active: z.boolean(),
});

type EstadoRemitoFormData = z.infer<typeof estadoRemitoSchema>;

interface EstadoRemitoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EstadoRemitoFormData) => Promise<void>;
  isSubmitting: boolean;
  editingEstado?: {
    id: string;
    name: string;
    description?: string;
    color: string;
    is_active: boolean;
  } | null;
}

export function EstadoRemitoForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingEstado
}: EstadoRemitoFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EstadoRemitoFormData>({
    resolver: zodResolver(estadoRemitoSchema),
    defaultValues: {
      name: editingEstado?.name || "",
      description: editingEstado?.description || "",
      color: editingEstado?.color || "#3b82f6",
      is_active: editingEstado?.is_active !== false
    }
  });

  // Reset form when editingEstado changes
  useEffect(() => {
    if (editingEstado) {
      reset({
        name: editingEstado?.name,
        description: editingEstado.description || "",
        color: editingEstado.color,
        is_active: editingEstado.is_active !== false
      });
    } else {
      reset({
        name: "",
        description: "",
        color: "#3b82f6",
        is_active: true
      });
    }
  }, [editingEstado, reset]);

  const handleFormSubmit = async (data: EstadoRemitoFormData) => {
    try {
      await onSubmit(data);
      // Reset form with default values to avoid empty color field warning
      reset({
        name: "",
        description: "",
        color: "#3b82f6",
        is_active: true
      });
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEstado ? "Editar Estado" : "Nuevo Estado"}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitText={editingEstado ? "Actualizar" : "Guardar"}
      isSubmitting={isSubmitting}
    >
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name" className="form-label-large">Nombre *</label>
          <input
            {...register("name")}
            type="text"
            id="name"
            placeholder="Ej: Enviado, Entregado, Cancelado"
            className="form-input-standard"
            required
          />
          {errors?.name && (
            <p className="error-message">{errors?.name.message}</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="color" className="form-label-large">Color *</label>
          <div className="flex items-center gap-2">
            <input
              {...register("color")}
              type="color"
              id="color"
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              required
            />
            <input
              {...register("color")}
              type="text"
              className="form-input-standard flex-1"
              placeholder="#3b82f6"
            />
          </div>
          {errors.color && (
            <p className="error-message">{errors.color.message}</p>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label-large">Descripción</label>
        <textarea
          {...register("description")}
          id="description"
          placeholder="Descripción opcional del estado"
          rows={3}
          className="form-textarea-standard"
        />
        {errors.description && (
          <p className="error-message">{errors.description.message}</p>
        )}
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            {...register("is_active")}
            type="checkbox"
            style={{ margin: 0 }}
          />
          Estado activo
        </label>
        {errors.is_active && (
          <p className="error-message">{errors.is_active.message}</p>
        )}
      </div>
    </FormModal>
  );
}
