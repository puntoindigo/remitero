"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormModal } from "@/components/common/FormModal";

const empresaSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

interface EmpresaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmpresaFormData) => Promise<void>;
  isSubmitting: boolean;
  editingEmpresa?: { id: string; name: string } | null;
}

export function EmpresaForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingEmpresa
}: EmpresaFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      name: editingEmpresa?.name || ""
    }
  });

  // Reset form when editingEmpresa changes
  React.useEffect(() => {
    if (editingEmpresa) {
      reset({ name: editingEmpresa.name });
    } else {
      reset({ name: "" });
    }
  }, [editingEmpresa, reset]);

  const handleFormSubmit = async (data: EmpresaFormData) => {
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
      title={editingEmpresa ? "Editar Empresa" : "Nueva Empresa"}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitText={editingEmpresa ? "Actualizar" : "Guardar"}
      isSubmitting={isSubmitting}
    >
      <div className="form-group">
        <label>Nombre de la Empresa</label>
        <input
          {...register("name")}
          type="text"
          placeholder="Nombre de la empresa"
        />
        {errors.name && (
          <p className="error-message">{errors.name.message}</p>
        )}
      </div>
    </FormModal>
  );
}
