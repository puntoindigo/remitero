"use client";

import React, { useEffect } from "react";
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
  embedded?: boolean; // Si es true, renderiza solo el contenido sin FormModal
}

export function EmpresaForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingEmpresa,
  embedded = false
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
  useEffect(() => {
    if (editingEmpresa) {
      reset({ name: editingEmpresa?.name }, []);
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

  const formContent = (
    <div className="form-group">
      <label>Nombre de la Empresa</label>
      <input
        {...register("name")}
        type="text"
        placeholder="Nombre de la empresa"
        className="form-input-standard"
      />
      {errors?.name && (
        <p className="error-message">{errors?.name.message}</p>
      )}
    </div>
  );

  // Si está en modo embebido, renderizar solo el contenido del formulario
  if (embedded) {
    return (
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {formContent}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
            }}
          >
            {isSubmitting ? "Guardando..." : (editingEmpresa ? "Actualizar" : "Guardar")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEmpresa ? "Editar Empresa" : "Nueva Empresa"}
      modalId={editingEmpresa ? `empresa-${editingEmpresa.id}` : "nueva-empresa"}
      modalComponent="EmpresaForm"
      modalType="form"
      modalProps={{
        editingEmpresa
      }}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitText={editingEmpresa ? "Actualizar" : "Guardar"}
      isSubmitting={isSubmitting}
    >
      {formContent}
    </FormModal>
  );
}
