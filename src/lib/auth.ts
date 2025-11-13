import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "./supabase"
import { logUserActivity } from "./user-activity-logger"

// Limpiar variables de entorno (remover espacios y newlines)
const cleanEnv = (value: string | undefined): string | undefined => {
  return value?.trim().replace(/\n/g, '');
};

// Usar VERCEL_URL si está disponible (para preview branches), sino usar NEXTAUTH_URL
const getNextAuthUrl = (): string => {
  // Para preview branches en Vercel, usar la URL de desarrollo validada
  // porque Google OAuth no permite wildcards
  if (process.env.VERCEL_ENV === 'preview' || process.env.VERCEL) {
    // Usar la URL de desarrollo que ya está validada en Google
    const devUrl = cleanEnv(process.env.NEXTAUTH_URL);
    if (devUrl && devUrl.includes('remitero-dev.vercel.app')) {
      return devUrl;
    }
    // Si hay VERCEL_URL pero no es una URL validada, usar la de desarrollo
    if (process.env.VERCEL_URL && !process.env.VERCEL_URL.includes('remitero-dev')) {
      return 'https://remitero-dev.vercel.app';
    }
  }
  // Si no hay VERCEL_URL, usar NEXTAUTH_URL
  const url = cleanEnv(process.env.NEXTAUTH_URL);
  if (url) {
    return url;
  }
  // Fallback para desarrollo local
  return 'http://localhost:8000';
};

const NEXTAUTH_URL = getNextAuthUrl();
const GOOGLE_CLIENT_ID = cleanEnv(process.env.GOOGLE_CLIENT_ID);
const GOOGLE_CLIENT_SECRET = cleanEnv(process.env.GOOGLE_CLIENT_SECRET);

// Log de configuración al cargar el módulo
console.log('🔧 [NextAuth Config] Inicializando configuración...', {
  hasSecret: !!process.env.NEXTAUTH_SECRET,
  hasGoogleClientId: !!GOOGLE_CLIENT_ID,
  hasGoogleClientSecret: !!GOOGLE_CLIENT_SECRET,
  nextAuthUrl: NEXTAUTH_URL,
  nextAuthUrlRaw: process.env.NEXTAUTH_URL,
  vercelUrl: process.env.VERCEL_URL,
  googleClientIdPrefix: GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
  googleClientIdLength: GOOGLE_CLIENT_ID?.length
});

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('❌ [NextAuth Config] ERROR: Variables de Google OAuth no están configuradas!');
  console.error('❌ [NextAuth Config] GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? 'OK' : 'FALTA');
  console.error('❌ [NextAuth Config] GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET ? 'OK' : 'FALTA');
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account", // Solo pide seleccionar cuenta, no consent cada vez
          access_type: "offline",
          response_type: "code"
        }
      },
      // Agregar logging en el provider
      checks: ["pkce", "state"],
    }),
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          console.log('🔐 [Credentials authorize] Buscando usuario:', {
            email: credentials.email,
            schema: process.env.DATABASE_SCHEMA || 'default'
          });

          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*, has_temporary_password')
            .eq('email', credentials.email)
            .single()

          if (error) {
            console.error('❌ [Credentials authorize] Error buscando usuario:', {
              error: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
              schema: process.env.DATABASE_SCHEMA || 'default'
            });
            return null
          }

          if (!user) {
            console.warn('⚠️ [Credentials authorize] Usuario no encontrado:', credentials.email);
            return null
          }

          console.log('✅ [Credentials authorize] Usuario encontrado:', {
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            is_active_type: typeof user.is_active,
            role: user.role
          });

          // Verificar si el usuario está activo
          if (user.is_active === false) {
            console.error('❌ [Credentials authorize] Usuario desactivado:', {
              id: user.id,
              email: user.email,
              is_active: user.is_active
            });
            // Usuario desactivado, retornar null para que NextAuth muestre error
            // NextAuth manejará esto como credenciales inválidas
            return null
          }

          // Verificar que el usuario tenga contraseña (no es Gmail OAuth)
          if (!user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          // Obtener nombre de la empresa si el usuario tiene company_id
          let companyName: string | undefined = undefined;
          if (user.company_id) {
            const { data: company } = await supabaseAdmin
              .from('companies')
              .select('name')
              .eq('id', user.company_id)
              .single();
            
            if (company) {
              companyName = company.name;
            }
          }

          // Registrar login
          await logUserActivity(user.id, 'LOGIN', 'Inició sesión con credenciales');

                return {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  role: user.role,
                  companyId: user.company_id,
            companyName: companyName,
            impersonatingUserId: null,
            hasTemporaryPassword: user.has_temporary_password || false,
            enable_botonera: user.enable_botonera ?? false,
            enable_pinned_modals: user.enable_pinned_modals ?? false
                } as any
        } catch (error) {
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 [NextAuth signIn] CALLBACK EJECUTADO', { 
        provider: account?.provider, 
        email: user.email,
        hasAccount: !!account,
        hasProfile: !!profile,
        accountType: account?.type,
        accountProviderAccountId: account?.providerAccountId,
        accountAccessToken: account?.access_token ? 'PRESENTE' : 'NO PRESENTE',
        accountIdToken: account?.id_token ? 'PRESENTE' : 'NO PRESENTE',
        schema: process.env.DATABASE_SCHEMA || 'default',
        timestamp: new Date().toISOString()
      });
      
      // Si es login con Google, verificar o crear usuario en la BD
      if (account?.provider === "google") {
        console.log('🔐 [NextAuth signIn] Procesando login con Google');
        console.log('🔐 [NextAuth signIn] Account details:', {
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          access_token: account.access_token ? 'PRESENTE' : 'NO PRESENTE',
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope
        });
        try {
          const email = user.email;
          if (!email) {
            console.error('❌ [NextAuth signIn] No se pudo obtener el email del usuario de Google');
            return false;
          }
          console.log('🔐 [NextAuth signIn] Email encontrado:', email);

          // Buscar si el usuario ya existe
          console.log('🔐 [NextAuth signIn] Buscando usuario en BD...', {
            email: email,
            schema: process.env.DATABASE_SCHEMA || 'default'
          });
          const { data: existingUser, error: findError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

          if (findError) {
            if (findError.code === 'PGRST116') {
              console.log('ℹ️ [NextAuth signIn] Usuario no existe (PGRST116), se creará uno nuevo');
            } else {
              console.error('❌ [NextAuth signIn] Error buscando usuario:', {
                error: findError.message,
                code: findError.code,
                details: findError.details,
                hint: findError.hint,
                schema: process.env.DATABASE_SCHEMA || 'default'
              });
            }
          }

          if (existingUser) {
            console.log('✅ [NextAuth signIn] Usuario existente encontrado:', {
              id: existingUser.id,
              email: existingUser.email,
              is_active: existingUser.is_active,
              is_active_type: typeof existingUser.is_active,
              is_active_null: existingUser.is_active === null,
              is_active_undefined: existingUser.is_active === undefined,
              is_active_false: existingUser.is_active === false,
              is_active_true: existingUser.is_active === true,
              role: existingUser.role,
              schema: process.env.DATABASE_SCHEMA || 'default'
            });
            // Verificar si el usuario está activo
            // IMPORTANTE: is_active puede ser null, undefined, false, o true
            // Solo rechazar si es explícitamente false
            if (existingUser.is_active === false) {
              console.error('❌ [NextAuth signIn] Usuario desactivado, denegando acceso', {
                id: existingUser.id,
                email: existingUser.email,
                is_active: existingUser.is_active,
                is_active_type: typeof existingUser.is_active,
                schema: process.env.DATABASE_SCHEMA || 'default'
              });
              // Usuario desactivado, no permitir login
              // Retornar false para que NextAuth deniegue el acceso
              return false;
            }
            
            // Si is_active es null o undefined, tratarlo como activo (comportamiento por defecto)
            if (existingUser.is_active === null || existingUser.is_active === undefined) {
              console.warn('⚠️ [NextAuth signIn] is_active es null/undefined, tratando como activo', {
                id: existingUser.id,
                email: existingUser.email,
                is_active: existingUser.is_active,
                schema: process.env.DATABASE_SCHEMA || 'default'
              });
            }
            
            console.log('✅ [NextAuth signIn] Usuario está activo (o null/undefined = activo por defecto)');

            // Usuario existe y está activo, actualizar información si es necesario
            console.log('🔐 [NextAuth signIn] Actualizando información del usuario...');
            const { error: updateError } = await supabaseAdmin
              .from('users')
              .update({
                name: user.name || existingUser.name,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingUser.id);
            
            if (updateError) {
              console.error('⚠️ [NextAuth signIn] Error actualizando usuario:', updateError);
            } else {
              console.log('✅ [NextAuth signIn] Usuario actualizado correctamente');
            }
            
            // Asignar datos del usuario existente al objeto user
            user.id = existingUser.id;
            (user as any).role = existingUser.role;
            (user as any).companyId = existingUser.company_id;
            (user as any).hasTemporaryPassword = false;
            (user as any).enable_botonera = existingUser.enable_botonera ?? false;
            (user as any).enable_pinned_modals = existingUser.enable_pinned_modals ?? false;
            console.log('🔐 [NextAuth signIn] Datos asignados al user object:', {
              id: user.id,
              role: (user as any).role,
              companyId: (user as any).companyId
            });
          } else {
            // Usuario no existe en la base de datos - DENEGAR ACCESO
            // NO crear usuarios automáticamente por seguridad
            // Los usuarios deben ser creados explícitamente por un administrador
            console.error('❌ [NextAuth signIn] Usuario no existe en la base de datos, denegando acceso', {
              email: email,
              schema: process.env.DATABASE_SCHEMA || 'default',
              reason: 'Usuario no registrado en el sistema. Debe ser creado por un administrador.'
            });
            // Retornar false para denegar el acceso
            return false;
          }

          // Obtener nombre de la empresa si el usuario tiene company_id
          if ((user as any).companyId) {
            console.log('🔐 [NextAuth signIn] Obteniendo nombre de empresa...');
            const { data: company } = await supabaseAdmin
              .from('companies')
              .select('name')
              .eq('id', (user as any).companyId)
              .single();
            
            if (company) {
              (user as any).companyName = company.name;
              console.log('✅ [NextAuth signIn] Empresa encontrada:', company.name);
            }
          }

          // Registrar login con Google
          try {
            console.log('🔐 [NextAuth signIn] Registrando actividad de login...');
            await logUserActivity((user as any).id, 'LOGIN', 'Inició sesión con Google');
            console.log('✅ [NextAuth signIn] Actividad registrada');
          } catch (logError) {
            // No fallar el login si el log falla
            console.error('⚠️ [NextAuth signIn] Error logging user activity (no crítico):', logError);
          }

          console.log('✅ [NextAuth signIn] Login con Google exitoso, retornando true');
          return true;
        } catch (error: any) {
          console.error('❌ [NextAuth signIn] Error en callback de Google:', {
            error: error,
            message: error?.message,
            stack: error?.stack,
            code: error?.code,
            details: error?.details,
            schema: process.env.DATABASE_SCHEMA || 'default'
          });
          console.error('❌ [NextAuth signIn] Retornando false - acceso denegado por excepción');
          return false;
        }
      }
      console.log('✅ [NextAuth signIn] No es Google provider, retornando true');
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // Solo loggear cuando hay cambios significativos (user, account, o trigger update)
      if (user || account || trigger === 'update') {
        console.log('🔑 [NextAuth jwt] Callback ejecutado', {
          hasUser: !!user,
          hasAccount: !!account,
          provider: account?.provider,
          trigger
        });
      }
      
      if (user) {
        console.log('🔑 [NextAuth jwt] Procesando user object:', {
          id: user.id,
          email: user.email,
          role: (user as any).role
        });
        token.role = user.role || (user as any).role
        token.companyId = user.companyId || (user as any).companyId
        token.companyName = (user as any).companyName
        token.impersonatingUserId = (user as any).impersonatingUserId
        token.hasTemporaryPassword = (user as any).hasTemporaryPassword || false
        token.enable_botonera = (user as any).enable_botonera ?? false
        token.enable_pinned_modals = (user as any).enable_pinned_modals ?? false
      }
      
      // Si se llama update() desde el cliente, obtener valores actualizados de la BD
      if (trigger === "update" && token.sub) {
        try {
          const { data: updatedUser } = await supabaseAdmin
            .from('users')
            .select('enable_botonera, enable_pinned_modals')
            .eq('id', token.sub)
            .single();
          
          if (updatedUser) {
            token.enable_botonera = updatedUser.enable_botonera ?? false;
            token.enable_pinned_modals = updatedUser.enable_pinned_modals ?? false;
          }
        } catch (error) {
          console.error('Error updating token from database:', error);
          // Continuar con los valores del token existente si hay error
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
        ;(session.user as any).impersonatingUserId = token.impersonatingUserId as string
        ;(session.user as any).enable_botonera = token.enable_botonera ?? false
        ;(session.user as any).enable_pinned_modals = token.enable_pinned_modals ?? false
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Solo loggear en desarrollo y solo una vez por URL única para reducir ruido
      // El callback puede llamarse múltiples veces durante la verificación de sesión
      
      // Si la URL es del callback o es la baseUrl, redirigir al dashboard
      if (url.includes('/api/auth/callback') || url === baseUrl || url === `${baseUrl}/`) {
        return '/dashboard';
      }
      // Si ya es una ruta relativa, retornarla tal cual (sin redirección innecesaria)
      if (url.startsWith('/')) {
        return url;
      }
      // Por defecto, redirigir al dashboard
      return '/dashboard';
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  }
}
