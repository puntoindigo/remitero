"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormModal } from "@/components/common/FormModal";

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
}

export function ClienteForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingCliente
}: ClienteFormProps) {
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
  React.useEffect(() => {
    if (editingCliente) {
      reset({
        name: editingCliente.name,
        email: editingCliente.email || "",
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

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitText={editingCliente ? "Actualizar" : "Guardar"}
      isSubmitting={isSubmitting}
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label-large">Nombre del cliente *</label>
          <input
            {...register("name")}
            type="text"
            placeholder="Ingresa el nombre del cliente"
            className="form-input-standard"
          />
          {errors.name && (
            <p className="error-message">{errors.name.message}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label-large">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="cliente@email.com"
            className="form-input-standard"
          />
          {errors.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label-large">Teléfono</label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="+54 11 1234-5678"
            className="form-input-standard"
          />
          {errors.phone && (
            <p className="error-message">{errors.phone.message}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label-large">Dirección</label>
          <input
            {...register("address")}
            type="text"
            placeholder="Corrientes 1234, Rosario"
            className="form-input-standard"
          />
          {errors.address && (
            <p className="error-message">{errors.address.message}</p>
          )}
        </div>
      </div>
    </FormModal>
  );
}
