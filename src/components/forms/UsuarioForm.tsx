"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { FormModal } from "@/components/common/FormModal";
import { PasswordGeneratorModal } from "@/components/common/PasswordGeneratorModal";
import { useColorTheme } from "@/contexts/ColorThemeContext";
import { Key, Eye, EyeOff } from "lucide-react";
import { useIsDevelopment } from "@/hooks/useIsDevelopment";

// Función para detectar si es email de Google
const isGmailEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain === 'gmail.com' || domain === 'googlemail.com';
};


const userSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.string()
    .min(1, "El email es requerido")
    .refine((val) => {
      // Permitir solo username (sin @) o email completo válido
      if (!val.includes('@')) {
        // Solo username: debe tener al menos 1 carácter, sin espacios, sin caracteres especiales problemáticos
        return /^[a-zA-Z0-9._-]+$/.test(val.trim()) && val.trim().length > 0;
      }
      // Si tiene @, debe ser un email válido
      return z.string().email().safeParse(val).success;
    }, {
      message: "Email inválido o formato incorrecto"
    }),
  password: z.string().optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
  role: z.enum(["SUPERADMIN", "ADMIN", "USER"]),
  companyId: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  enableBotonera: z.boolean().optional(),
}).refine((data) => {
  // Si el email contiene @ (no es solo Gmail), requerir contraseña
  const hasAtSymbol = data.email.includes('@');
  if (!hasAtSymbol) {
    return true; // Si es solo palabra (se autocompleta a Gmail), no requerir contraseña
  }
  // Si tiene @, verificar si es Gmail
  const isGmail = isGmailEmail(data.email);
  if (isGmail) {
    return true; // Gmail no requiere contraseña
  }
  // Si no es Gmail, requerir contraseña
  if (!data.password || data.password === "") {
    return false;
  }
  // Solo validar confirmPassword si está presente (cuando se edita)
  // En nuevo usuario, no hay confirmPassword, así que no validamos
  if (data.confirmPassword !== undefined && data.confirmPassword !== "") {
    return data.password === data.confirmPassword;
  }
  return true; // Si no hay confirmPassword, no validar coincidencia
}, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
}).refine((data) => {
  const hasAtSymbol = data.email.includes('@');
  if (!hasAtSymbol) {
    return true; // Solo palabra (se autocompleta a Gmail)
  }
  const isGmail = isGmailEmail(data.email);
  if (isGmail) {
    return true; // Gmail no requiere contraseña
  }
  // Si no es Gmail, requerir contraseña de al menos 6 caracteres
  if (!data.password || data.password === "") {
    return false;
  }
  return data.password.length >= 6;
}, {
  message: "La contraseña debe tener al menos 6 caracteres (requerida para emails no Gmail)",
  path: ["password"],
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
    companyId?: string;
    phone?: string;
    address?: string;
    enableBotonera?: boolean;
  } | null;
  isCurrentUser?: boolean;
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
  companyId,
  isCurrentUser = false
}: UsuarioFormProps) {
  const { colors } = useColorTheme();
  const { data: session } = useSession();
  const [showPasswordGenerator, setShowPasswordGenerator] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const isDevelopment = useIsDevelopment();
  
  // DEBUG: Log para verificar si editingUser existe
  React.useEffect(() => {
    console.log('🔍 [UsuarioForm] Estado de editingUser:', {
      hasEditingUser: !!editingUser,
      editingUserId: editingUser?.id,
      editingUserName: editingUser?.name,
      shouldShowConfirmPassword: !!editingUser
    });
  }, [editingUser]);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      password: "",
      confirmPassword: "",
      role: editingUser?.role || "USER",
      companyId: editingUser?.companyId || companyId || "",
      phone: editingUser?.phone || "",
      address: editingUser?.address || "",
      enableBotonera: editingUser?.enableBotonera ?? false
    }
  });

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");
  const emailValue = watch("email");
  const roleValue = watch("role");
  
  // Detectar si el email contiene @ (si tiene @, puede necesitar contraseña)
  const hasAtSymbol = emailValue ? emailValue.includes('@') : false;
  
  // Detectar si es Gmail (solo palabra o @gmail.com)
  const isGmail = emailValue ? (isGmailEmail(emailValue) || !hasAtSymbol) : false;
  
  // Auto-completar email: si es solo una palabra (sin @), agregar @gmail.com al perder el foco
  const handleEmailBlur = () => {
    if (emailValue && !emailValue.includes('@') && emailValue.trim().length > 0) {
      const trimmed = emailValue.trim();
      if (trimmed && !trimmed.includes('@')) {
        setValue("email", `${trimmed}@gmail.com`, { shouldValidate: true });
      }
    }
  };
  
  // Estado para manejar la animación de salida del error de contraseña
  const [showPasswordError, setShowPasswordError] = React.useState(false);
  const [showConfirmPasswordError, setShowConfirmPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState('');
  
  // Efecto para manejar la animación de entrada/salida del error de contraseña
  React.useEffect(() => {
    if (errors.password?.message) {
      setPasswordErrorMessage(errors.password.message);
      setShowPasswordError(true);
    } else if (showPasswordError) {
      // Si hay error visible pero ya no hay error, iniciar animación de salida
      const timer = setTimeout(() => {
        setShowPasswordError(false);
        setPasswordErrorMessage('');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [errors.password, showPasswordError]);
  
  // Efecto para manejar la animación de entrada/salida del error de confirmar contraseña
  React.useEffect(() => {
    if (errors.confirmPassword?.message) {
      setConfirmPasswordErrorMessage(errors.confirmPassword.message);
      setShowConfirmPasswordError(true);
    } else if (showConfirmPasswordError) {
      // Si hay error visible pero ya no hay error, iniciar animación de salida
      const timer = setTimeout(() => {
        setShowConfirmPasswordError(false);
        setConfirmPasswordErrorMessage('');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [errors.confirmPassword, showConfirmPasswordError]);

  // Observar el valor del rol para mostrar/ocultar empresa
  const selectedRole = watch("role");
  const currentUserRole = session?.user?.role;
  const isCurrentUserSuperAdmin = currentUserRole === "SUPERADMIN";
  const isCurrentUserAdmin = currentUserRole === "ADMIN";
  const isCurrentUserOperador = currentUserRole === "USER";

  // Determinar si se puede editar el rol:
  // - USER: No puede editar roles (ni el suyo ni de otros)
  // - ADMIN: Solo puede asignar USER o ADMIN (no SUPERADMIN)
  // - SUPERADMIN: Puede asignar cualquier rol
  // - Si está editando su propio perfil, no puede cambiar su rol
  const canEditRole = (isCurrentUserAdmin || isCurrentUserSuperAdmin) && !isCurrentUserOperador && !isCurrentUser;

  // Mostrar campo de empresa solo si:
  // 1. El usuario actual es SUPERADMIN
  // 2. El rol seleccionado no es SUPERADMIN
  // 3. No hay companyId específico (se seleccionó "Todas las empresas")
  const shouldShowCompanyField = isCurrentUserSuperAdmin && selectedRole !== "SUPERADMIN" && !companyId;

  // Limpiar companyId cuando el rol es SUPERADMIN
  useEffect(() => {
    if (selectedRole === "SUPERADMIN") {
      setValue("companyId", "");
    }
  }, [selectedRole, setValue]);

  // Establecer companyId automáticamente cuando se proporciona
  useEffect(() => {
    if (companyId && !editingUser) {
      setValue("companyId", companyId);
    }
  }, [companyId, setValue, editingUser]);

  // Reset form when editingUser changes
  useEffect(() => {
    if (editingUser) {
      reset({
        name: editingUser?.name || "",
        email: editingUser?.email,
        password: "",
        confirmPassword: "",
        role: editingUser.role,
        companyId: editingUser.companyId || companyId || "",
        phone: editingUser?.phone || "",
        address: editingUser?.address || "",
        enableBotonera: editingUser?.enableBotonera ?? false
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "USER",
        companyId: companyId || "",
        phone: "",
        address: "",
        enableBotonera: false
      });
    }
  }, [editingUser, companyId, reset]);

  const handleFormSubmit = async (data: UsuarioFormData) => {
    try {
      // Si el email no tiene @, autocompletarlo a @gmail.com antes de enviar
      let finalEmail = data.email;
      if (finalEmail && !finalEmail.includes('@')) {
        finalEmail = `${finalEmail.trim()}@gmail.com`;
      }
      
      await onSubmit({
        ...data,
        email: finalEmail
      });
      reset();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  // Determinar el título según el contexto
  const getTitle = () => {
    if (isCurrentUser) {
      return "Perfil de usuario";
    }
    return editingUser ? "Editar Usuario" : "Nuevo Usuario";
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitText={editingUser ? "Actualizar" : "Guardar"}
      isSubmitting={isSubmitting}
      modalId={editingUser ? `usuario-${editingUser.id}` : "nuevo-usuario"}
      modalComponent="UsuarioForm"
      modalType="form"
      modalProps={{
        editingUser,
        companies,
        companyId,
        isCurrentUser
      }}
      modalClassName={isCurrentUser ? "perfil-modal" : ""}
    >
      <div className="form-row">
        <div className="form-group" style={isCurrentUser ? { flex: '1 1 50%', minWidth: '200px' } : {}}>
          <label className="form-label-large">
            Nombre *
            {errors?.name && (
              <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '0.875rem', fontWeight: 'normal' }}>
                {errors?.name.message}
              </span>
            )}
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Nombre completo"
            className="form-input-standard"
          />
        </div>

        <div className="form-group" style={isCurrentUser ? { flex: '1 1 50%', minWidth: '200px' } : {}}>
          <label className="form-label-large">
            Email *
            {errors?.email && (
              <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '0.875rem', fontWeight: 'normal' }}>
                {errors?.email.message}
              </span>
            )}
          </label>
          <input
            {...register("email")}
            type="text"
            placeholder="email@ejemplo.com"
            autoComplete="off"
            className="form-input-standard"
            onBlur={handleEmailBlur}
          />
        </div>

        {canEditRole && (
          <div className="form-group">
            <label className="form-label-large">
              Rol *
              {errors?.role && (
                <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '0.875rem', fontWeight: 'normal' }}>
                  {errors?.role.message}
                </span>
              )}
            </label>
            <select 
              {...register("role")} 
              className="form-select-standard"
              style={{
                color: roleValue === "USER" ? '#9ca3af' : '#111827',
                fontStyle: roleValue === "USER" ? 'italic' : 'normal',
              }}
            >
              <option value="USER" style={{ color: '#9ca3af', fontStyle: 'italic', backgroundColor: '#f9fafb' }}>Usuario</option>
              <option value="ADMIN">Administrador</option>
              {isCurrentUserSuperAdmin && <option value="SUPERADMIN">Super Admin</option>}
              {!isCurrentUserSuperAdmin && isCurrentUserAdmin && (
                <option value="SUPERADMIN" disabled style={{ color: '#9ca3af', fontStyle: 'italic' }}>Super Admin (no disponible)</option>
              )}
            </select>
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group" style={isCurrentUser ? { flex: '1 1 50%', minWidth: '200px' } : {}}>
          <label className="form-label-large">
            Teléfono
            {errors?.phone && (
              <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '0.875rem', fontWeight: 'normal' }}>
                {errors?.phone.message}
              </span>
            )}
          </label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="Teléfono"
            className="form-input-standard"
          />
        </div>

        <div className="form-group" style={isCurrentUser ? { flex: '1 1 50%', minWidth: '200px' } : {}}>
          <label className="form-label-large">
            Dirección
            {errors?.address && (
              <span style={{ color: '#ef4444', marginLeft: '8px', fontSize: '0.875rem', fontWeight: 'normal' }}>
                {errors?.address.message}
              </span>
            )}
          </label>
          <input
            {...register("address")}
            type="text"
            placeholder="Dirección"
            className="form-input-standard"
          />
        </div>
      </div>

      {/* Mostrar campos de contraseña solo si hay @ y no es Gmail */}
      {hasAtSymbol && !isGmailEmail(emailValue) && (
      <div className="form-row">
        <div className="form-group">
          <label className="form-label-large">
            Contraseña {!editingUser && "*"}
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder={editingUser ? "Dejar vacío para mantener la actual" : "Contraseña"}
              autoComplete={editingUser ? "new-password" : "new-password"}
              className="form-input-standard"
              style={{ 
                paddingRight: '88px', 
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword(!showPassword);
                }}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                style={{
                  padding: '4px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  cursor: 'pointer',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: '#ffffff',
                  color: '#6b7280',
                  transition: 'all 0.2s',
                  margin: 0,
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.color = '#1f2937';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#6b7280';
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPasswordGenerator(true);
                }}
                title="Generar contraseña automática"
                style={{
                  padding: '4px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  cursor: 'pointer',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: '#ffffff',
                  color: '#6b7280',
                  transition: 'all 0.2s',
                  margin: 0,
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.color = '#1f2937';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#6b7280';
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Key className="h-4 w-4" />
              </button>
            </div>
          </div>
          {showPasswordError && (
            <p 
              className="error-message"
              style={{
                opacity: errors.password ? 1 : 0,
                transform: errors.password ? 'translateY(0)' : 'translateY(-10px)',
                maxHeight: errors.password ? '100px' : '0',
                marginTop: errors.password ? '0.5rem' : '0',
                marginBottom: errors.password ? '0' : '0',
                overflow: 'hidden',
                transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {passwordErrorMessage}
            </p>
          )}
        </div>

        {/* Campo de confirmar contraseña SOLO cuando se edita un usuario (no en nuevo usuario) */}
        {editingUser && (
          <div className="form-group">
            <label className="form-label-large">
              Confirmar Contraseña
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Dejar vacío si no cambias la contraseña"
                autoComplete="new-password"
                className="form-input-standard"
                style={{
                  paddingRight: '40px',
                  width: '100%',
                  boxSizing: 'border-box',
                  borderColor: passwordValue && confirmPasswordValue && passwordValue !== confirmPasswordValue
                    ? '#ef4444'
                    : undefined
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConfirmPassword(!showConfirmPassword);
                }}
                title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '4px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  cursor: 'pointer',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: '#ffffff',
                  color: '#6b7280',
                  transition: 'all 0.2s',
                  margin: 0,
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.color = '#1f2937';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#6b7280';
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
      )}
      
      {/* Mensaje de error de contraseñas debajo de ambas (como colspan=2) - SOLO cuando se edita */}
      {editingUser && hasAtSymbol && !isGmailEmail(emailValue) && showConfirmPasswordError && (
        <div style={{ 
          width: '100%',
          marginTop: '0.5rem',
          marginBottom: '1rem'
        }}>
          <p 
            className="error-message"
            style={{
              color: '#ef4444',
              fontSize: '0.875rem',
              margin: 0,
              opacity: errors.confirmPassword ? 1 : 0,
              transform: errors.confirmPassword ? 'translateY(0)' : 'translateY(-10px)',
              maxHeight: errors.confirmPassword ? '100px' : '0',
              overflow: 'hidden',
              transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {confirmPasswordErrorMessage}
          </p>
        </div>
      )}

      {shouldShowCompanyField && (
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label-large">Empresa</label>
            <select {...register("companyId")} className="form-select-standard">
              <option value="">Seleccionar Empresa</option>
              {companies.map((company) => (
                <option key={company?.id} value={company?.id}>
                  {company?.name}
                </option>
              ))}
            </select>
            {errors.companyId && (
              <p className="error-message">{errors.companyId.message}</p>
            )}
          </div>
          <div style={{ flex: 1 }}></div>
        </div>
      )}

      {/* Toggle para habilitar botonera (solo en desarrollo y para el usuario actual) */}
      {isCurrentUser && isDevelopment && (
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                {...register("enableBotonera")}
                type="checkbox"
                id="enableBotonera"
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  cursor: 'pointer',
                  accentColor: colors.primary,
                }}
              />
              <label 
                htmlFor="enableBotonera"
                style={{
                  fontSize: '0.875rem',
                  color: '#4b5563',
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontWeight: 500,
                }}
              >
                Habilitar Botonera (Solo desarrollo)
              </label>
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
              Muestra la barra de navegación inferior con botones de Operaciones, Configuración y Administración
            </p>
          </div>
        </div>
      )}

      {/* Modal del generador de contraseñas */}
      <PasswordGeneratorModal
        isOpen={showPasswordGenerator}
        onClose={() => setShowPasswordGenerator(false)}
        onPasswordGenerated={(password) => {
          setValue("password", password);
          setShowPasswordGenerator(false);
        }}
      />
    </FormModal>
  );
}
