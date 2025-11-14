"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UsuarioForm } from "@/components/forms/UsuarioForm";
import { useUsuariosQuery } from "@/hooks/queries/useUsuariosQuery";
import { MessageModal } from "@/components/common/MessageModal";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";

export default function PerfilPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const currentUserSimple = useCurrentUserSimple();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info', text: string } | null>(null);
  const [showForm, setShowForm] = useState(true);
  
  // Solo cargar usuarios si el usuario tiene permisos (ADMIN o SUPERADMIN)
  // IMPORTANTE: Esperar a que currentUserSimple esté cargado antes de decidir si habilitar la query
  const canViewUsers = currentUserSimple?.role === 'ADMIN' || currentUserSimple?.role === 'SUPERADMIN';
  const shouldEnableQuery = currentUserSimple !== null && canViewUsers; // Solo habilitar si currentUserSimple está cargado Y tiene permisos
  const { data: usuarios, refetch } = useUsuariosQuery(
    shouldEnableQuery ? session?.user?.companyId : undefined,
    shouldEnableQuery // Solo ejecutar si currentUserSimple está cargado y tiene permisos
  );

  // Para usuarios USER, obtener su perfil individualmente
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    if (canViewUsers && usuarios) {
      // Si tiene permisos, buscar en la lista de usuarios
      const user = usuarios.find(u => u.id === session?.user?.id);
      setCurrentUser(user);
    } else if (session?.user?.id && !canViewUsers) {
      // Si es USER, obtener su perfil individualmente
      fetch(`/api/users/${session.user.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => setCurrentUser(data))
        .catch(() => setCurrentUser(null));
    }
  }, [canViewUsers, usuarios, session?.user?.id]);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, router]);

  if (!session || !currentUser) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Cargando...</p>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar el perfil');
      }

      setMessage({
        type: 'success',
        text: 'Perfil actualizado correctamente'
      });

      // Refrescar la sesión y los datos del usuario
      if (canViewUsers) {
        await refetch();
      } else {
        // Si es USER, recargar el perfil individualmente
        const userResponse = await fetch(`/api/users/${currentUser.id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData);
        }
      }
      
      // Actualizar la sesión de NextAuth
      const { update } = await import('next-auth/react');
      await update();
      
      // Cerrar el formulario después de un breve delay
      setTimeout(() => {
        setShowForm(false);
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al actualizar el perfil'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 600 }}>Mi Perfil</h1>
      
      {showForm && (
        <UsuarioForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            router.push('/dashboard');
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isCurrentUser={true}
          editingUser={{
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            phone: currentUser.phone,
            address: currentUser.address,
            companyId: currentUser.company?.id,
            enableBotonera: (currentUser as any).enable_botonera ?? false
          }}
          companies={[]}
        />
      )}

      {message && (
        <MessageModal
          isOpen={!!message}
          onClose={() => setMessage(null)}
          type={message.type}
          title={message.type === 'success' ? 'Éxito' : 'Error'}
          message={message.text}
        />
      )}
    </div>
  );
}

