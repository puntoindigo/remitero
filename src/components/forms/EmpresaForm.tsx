"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Image as ImageIcon } from "lucide-react";
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
    <>
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

      {/* Logo de la empresa - simulado, deshabilitado */}
      <div className="form-group">
        <label>Logo de la Empresa</label>
        <div
          style={{
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            cursor: 'not-allowed',
            opacity: 0.6
          }}
        >
          <input
            type="file"
            accept="image/*"
            disabled
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon size={48} color="#9ca3af" />
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              <Upload size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem' }} />
              <span>Próximamente</span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>
              La funcionalidad de logo estará disponible próximamente
            </p>
          </div>
        </div>
      </div>
    </>
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
