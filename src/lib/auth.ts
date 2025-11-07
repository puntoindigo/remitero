import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "./supabase"
import { logUserActivity } from "./user-activity-logger"

// Log de configuración al cargar el módulo
console.log('🔧 [NextAuth Config] Inicializando configuración...', {
  hasSecret: !!process.env.NEXTAUTH_SECRET,
  hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...'
});

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*, has_temporary_password')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            return null
          }

          // Verificar si el usuario está activo
          if (user.is_active === false) {
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
      console.log('🔐 [NextAuth signIn] Iniciado', { 
        provider: account?.provider, 
        email: user.email,
        hasAccount: !!account,
        hasProfile: !!profile
      });
      
      // Si es login con Google, verificar o crear usuario en la BD
      if (account?.provider === "google") {
        console.log('🔐 [NextAuth signIn] Procesando login con Google');
        try {
          const email = user.email;
          if (!email) {
            console.error('❌ [NextAuth signIn] No hay email en user object');
            return false;
          }
          console.log('🔐 [NextAuth signIn] Email encontrado:', email);

          // Buscar si el usuario ya existe
          console.log('🔐 [NextAuth signIn] Buscando usuario en BD...');
          const { data: existingUser, error: findError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

          if (findError && findError.code !== 'PGRST116') {
            console.error('❌ [NextAuth signIn] Error buscando usuario:', findError);
          }

          if (existingUser) {
            console.log('✅ [NextAuth signIn] Usuario existente encontrado:', existingUser.id);
            // Verificar si el usuario está activo
            if (existingUser.is_active === false) {
              console.error('❌ [NextAuth signIn] Usuario desactivado, denegando acceso');
              // Usuario desactivado, no permitir login
              // Retornar false para que NextAuth deniegue el acceso
              return false;
            }
            console.log('✅ [NextAuth signIn] Usuario está activo');

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
            // Usuario no existe, crear uno nuevo con rol USER por defecto
            console.log('🔐 [NextAuth signIn] Usuario no existe, creando nuevo usuario...');
            // Nota: En producción, podrías querer redirigir a un formulario de registro
            // o asignar automáticamente a una empresa por defecto
            const { data: newUser, error } = await supabaseAdmin
              .from('users')
              .insert([{
                email: email,
                name: user.name || email.split('@')[0],
                password: '', // Sin contraseña para usuarios de Google
                role: 'OPERADOR', // Rol por defecto
                company_id: null, // Se asignará después
              }])
              .select()
              .single();

            if (error || !newUser) {
              console.error('❌ [NextAuth signIn] Error creando usuario:', error);
              return false;
            }
            console.log('✅ [NextAuth signIn] Nuevo usuario creado:', newUser.id);

            user.id = newUser.id;
            (user as any).role = newUser.role;
            (user as any).companyId = newUser.company_id;
            (user as any).hasTemporaryPassword = false;
            (user as any).enable_botonera = newUser.enable_botonera ?? false;
            (user as any).enable_pinned_modals = newUser.enable_pinned_modals ?? false;
            console.log('🔐 [NextAuth signIn] Datos asignados al nuevo user:', {
              id: user.id,
              role: (user as any).role
            });
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
          console.error('❌ [NextAuth signIn] Error en callback de Google:', error);
          // Log más detallado para debugging
          if (error?.message) {
            console.error('❌ [NextAuth signIn] Error message:', error.message);
          }
          if (error?.stack) {
            console.error('❌ [NextAuth signIn] Error stack:', error.stack);
          }
          console.error('❌ [NextAuth signIn] Retornando false - acceso denegado');
          return false;
        }
      }
      console.log('✅ [NextAuth signIn] No es Google provider, retornando true');
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      console.log('🔑 [NextAuth jwt] Callback ejecutado', {
        hasUser: !!user,
        hasAccount: !!account,
        provider: account?.provider,
        trigger
      });
      
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
    async redirect({ url, baseUrl, token }) {
      console.log('🔄 [NextAuth redirect] Callback ejecutado', {
        url,
        baseUrl,
        hasToken: !!token,
        role: token?.role,
        nextAuthUrl: process.env.NEXTAUTH_URL
      });
      
      // Función para normalizar URLs y evitar barras múltiples
      const normalizeUrl = (urlStr: string): string => {
        // Normalizar múltiples barras consecutivas a una sola
        return urlStr.replace(/\/+/g, '/');
      };
      
      // SIEMPRE usar NEXTAUTH_URL como fuente de verdad para el puerto
      const nextAuthUrl = process.env.NEXTAUTH_URL;
      let correctBaseUrl = baseUrl.replace(/\/+$/, ''); // Eliminar barras al final
      
      // Normalizar la URL entrante
      let normalizedUrl = url.trim();
      console.log('🔄 [NextAuth redirect] URL normalizada inicial:', normalizedUrl);
      
      // Si la URL es relativa, construirla con baseUrl
      if (normalizedUrl.startsWith('/')) {
        normalizedUrl = correctBaseUrl + normalizedUrl;
      }
      
      // Si viene de OAuth callback y no tiene destino específico, redirigir según rol
      if (normalizedUrl === baseUrl || normalizedUrl === correctBaseUrl || normalizedUrl.includes('/api/auth/callback')) {
        const destination = token?.role === 'SUPERADMIN' ? '/empresas' : '/dashboard';
        normalizedUrl = correctBaseUrl + destination;
        console.log('🔄 [NextAuth redirect] Detectado callback OAuth, redirigiendo a:', destination, {
          tokenRole: token?.role,
          hasToken: !!token
        });
      }
      
      // Log final antes de retornar
      console.log('🔄 [NextAuth redirect] URL final a retornar:', normalizedUrl);
      
      // REGLA SIMPLE: Si el path contiene localhost:8000 (significa que está mal formado)
      // Redirigir según el rol: SUPERADMIN a /empresas, otros a /dashboard
      if (normalizedUrl.includes('localhost:8000')) {
        // Determinar destino según rol
        const destination = token?.role === 'SUPERADMIN' ? '/empresas' : '/dashboard';
        
        // Construir URL correcta usando NEXTAUTH_URL
        if (nextAuthUrl) {
          try {
            const nextAuthUrlObj = new URL(nextAuthUrl);
            const finalUrl = nextAuthUrlObj.origin + destination;
            return finalUrl;
          } catch (error) {
            // Silenciar error
          }
        }
        normalizedUrl = destination;
      }
      
      // SIEMPRE usar NEXTAUTH_URL como base en desarrollo (solo origin, sin path)
      if (process.env.NODE_ENV === "development" && nextAuthUrl) {
        try {
          const nextAuthUrlObj = new URL(nextAuthUrl);
          correctBaseUrl = nextAuthUrlObj.origin; // Solo "http://localhost:8000", sin path
        } catch (error) {
          console.warn('[NextAuth Redirect] Error parsing NEXTAUTH_URL:', error);
          // Fallback
          correctBaseUrl = 'http://localhost:8000';
        }
      } else {
        // En producción, construir desde baseUrl
        try {
          const baseUrlObj = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
          correctBaseUrl = baseUrlObj.origin;
        } catch {
          correctBaseUrl = baseUrl.replace(/\/+$/, '');
        }
      }
      
      // Si la URL es relativa (empieza con /), construir la URL completa
      if (normalizedUrl.startsWith("/")) {
        const separator = correctBaseUrl.endsWith("/") ? "" : "/";
        const finalUrl = normalizeUrl(correctBaseUrl + separator + normalizedUrl);
        return finalUrl;
      }
      
      // Si la URL es absoluta, verificar y corregir
      try {
        const urlObj = new URL(normalizedUrl);
        const nextAuthUrlObj = nextAuthUrl ? new URL(nextAuthUrl) : null;
        
        // Si es localhost en desarrollo, SIEMPRE corregir el puerto
        if (urlObj.hostname === "localhost" && 
            process.env.NODE_ENV === "development" &&
            nextAuthUrlObj &&
            nextAuthUrlObj.hostname === "localhost" &&
            urlObj.port !== nextAuthUrlObj.port) {
          urlObj.port = nextAuthUrlObj.port;
          urlObj.protocol = nextAuthUrlObj.protocol;
          return normalizeUrl(urlObj.toString());
        }
        
        // Si la URL ya tiene el hostname correcto, normalizarla y retornarla
        if (urlObj.hostname === (nextAuthUrlObj?.hostname || "localhost")) {
          return normalizeUrl(urlObj.toString());
        }
        
        // Si la URL contiene barras múltiples, normalizarla
        return normalizeUrl(normalizedUrl);
      } catch (error) {
        // Si no se puede parsear como URL, asumir que es relativa y normalizar
        const separator = correctBaseUrl.endsWith("/") || normalizedUrl.startsWith("/") ? "" : "/";
        return normalizeUrl(correctBaseUrl + separator + normalizedUrl);
      }
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  }
}
