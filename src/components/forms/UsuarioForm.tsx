"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { FormModal } from "@/components/common/FormModal";

const userSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
  role: z.enum(["SUPERADMIN", "ADMIN", "USER"]),
  phone: z.string().optional(),
  address: z.string().optional(),
  companyId: z.string().optional(),
});

type UsuarioFormData = z.infer<typeof userSchema>;

interface UsuarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UsuarioFormData) => Promise<void>;
  isSubmitting: boolean;
  editingUser?: {
    id: string;
    name: string;
    email: string;
    role: "SUPERADMIN" | "ADMIN" | "USER";
    phone?: string;
    address?: string;
    companyId?: string;
  } | null;
  companies?: { id: string; name: string }[];
  companyId?: string;
}

export function UsuarioForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingUser,
  companies = [],
  companyId
}: UsuarioFormProps) {
  const { data: session } = useSession();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      password: "",
      role: editingUser?.role || "USER",
      phone: editingUser?.phone || "",
      address: editingUser?.address || "",
      companyId: editingUser?.companyId || companyId || ""
    }
  });

  // Reset form when editingUser changes
  React.useEffect(() => {
    if (editingUser) {
      reset({
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        role: editingUser.role,
        phone: editingUser.phone || "",
        address: editingUser.address || "",
        companyId: editingUser.companyId || companyId || ""
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        role: "USER",
        phone: "",
        address: "",
        companyId: companyId || ""
      });
    }
  }, [editingUser, companyId, reset]);

  const handleFormSubmit = async (data: UsuarioFormData) => {
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
      title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitText={editingUser ? "Actualizar" : "Crear"}
      isSubmitting={isSubmitting}
    >
      <div className="form-row">
        <div className="form-group">
          <label>Nombre</label>
          <input
            {...register("name")}
            type="text"
            placeholder="Nombre del usuario"
          />
          {errors.name && (
            <p className="error-message">{errors.name.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="email@ejemplo.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Contraseña {!editingUser && "*"}</label>
          <input
            {...register("password")}
            type="password"
            placeholder={editingUser ? "Dejar vacío para mantener la actual" : "Contraseña"}
            autoComplete={editingUser ? "new-password" : "new-password"}
          />
          {errors.password && (
            <p className="error-message">{errors.password.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>Rol</label>
          <select {...register("role")}>
            <option value="USER">Usuario</option>
            <option value="ADMIN">Administrador</option>
            {session?.user?.role === "SUPERADMIN" && <option value="SUPERADMIN">Super Admin</option>}
          </select>
          {errors.role && (
            <p className="error-message">{errors.role.message}</p>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Teléfono</label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="+54 11 1234-5678"
          />
          {errors.phone && (
            <p className="error-message">{errors.phone.message}</p>
          )}
        </div>

        <div className="form-group">
          <label>Dirección</label>
          <input
            {...register("address")}
            type="text"
            placeholder="Av. Corrientes 1234, CABA"
          />
          {errors.address && (
            <p className="error-message">{errors.address.message}</p>
          )}
        </div>
      </div>

      {session?.user?.role === "SUPERADMIN" && (
        <div className="form-row">
          <div className="form-group">
            <label>Empresa</label>
            <select {...register("companyId")}>
              <option value="">Seleccionar Empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {errors.companyId && (
              <p className="error-message">{errors.companyId.message}</p>
            )}
          </div>
        </div>
      )}
    </FormModal>
  );
}
