"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormModal } from "@/components/common/FormModal";
import { useColorTheme } from "@/contexts/ColorThemeContext";

const clienteSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Email inválido"
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClienteFormData) => Promise<void>;
  isSubmitting: boolean;
  editingCliente?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  } | null;
  nested?: boolean; // Si es true, el formulario está dentro de otro formulario
}

export function ClienteForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingCliente,
  nested = false
}: ClienteFormProps) {
  const { colors } = useColorTheme();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      name: editingCliente?.name || "",
      email: editingCliente?.email || "",
      phone: editingCliente?.phone || "",
      address: editingCliente?.address || ""
    }
  });

  // Reset form when editingCliente changes
  useEffect(() => {
    if (editingCliente) {
      reset({
        name: editingCliente?.name,
        email: editingCliente?.email || "",
        phone: editingCliente.phone || "",
        address: editingCliente.address || ""
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        address: ""
      });
    }
  }, [editingCliente, reset]);

  const handleFormSubmit = async (data: ClienteFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const formContent = (
    <>
      <div className="form-row">
        <div className="form-group">
          <input
            {...register("name")}
            type="text"
            placeholder="Nombre"
            className="form-input-standard"
            required
          />
          {errors?.name && (
            <p className="error-message">{errors?.name.message}</p>
          )}
        </div>

        <div className="form-group">
          <input
            {...register("email")}
            type="email"
            placeholder="email"
            className="form-input-standard"
          />
          {errors?.email && (
            <p className="error-message">{errors?.email.message}</p>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <input
            {...register("phone")}
            type="tel"
            placeholder="telefono"
            className="form-input-standard"
          />
          {errors.phone && (
            <p className="error-message">{errors.phone.message}</p>
          )}
        </div>

        <div className="form-group">
          <input
            {...register("address")}
            type="text"
            placeholder="direccion"
            className="form-input-standard"
          />
          {errors.address && (
            <p className="error-message">{errors.address.message}</p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
      onSubmit={nested ? undefined : handleSubmit(handleFormSubmit)}
      submitText={editingCliente ? "Actualizar" : "Guardar"}
      isSubmitting={isSubmitting}
      nested={nested}
      modalId={editingCliente ? `cliente-${editingCliente.id}` : "nuevo-cliente"}
      modalComponent="ClienteForm"
      modalType="form"
      modalProps={{
        editingCliente
      }}
    >
      {nested ? (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {formContent}
          <div className="modal-footer">
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: isSubmitting ? '#9ca3af' : colors.gradient,
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  minWidth: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}50`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isSubmitting ? "Guardando..." : (editingCliente ? "Actualizar" : "Guardar")}
              </button>
            </div>
          </div>
        </form>
      ) : (
        formContent
      )}
    </FormModal>
  );
}
