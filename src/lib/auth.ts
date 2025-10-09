import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "./supabase"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  // Forzar URL correcta para evitar caracteres de nueva línea
  url: process.env.NEXTAUTH_URL?.trim() || 'https://remitero-dev.vercel.app',
  providers: [
    // GoogleProvider solo si las variables de entorno están configuradas
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
            scope: "openid email profile"
          }
        }
      })
    ] : []),
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
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

                return {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  role: user.role,
                  companyId: user.company_id,
                  companyName: undefined,
                  impersonatingUserId: null
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
      console.log('🔍 NextAuth signIn callback iniciado:', {
        provider: account?.provider,
        userEmail: user?.email,
        userName: user?.name
      });

      // Si es login con Google
      if (account?.provider === 'google') {
        console.log('🔍 Procesando login con Google para:', user.email);
        console.log('🔍 Datos de Google OAuth:', {
          accountType: account.type,
          accessToken: account.access_token ? 'Presente' : 'Ausente',
          refreshToken: account.refresh_token ? 'Presente' : 'Ausente',
          expiresAt: account.expires_at,
          scope: account.scope
        });
        
        try {
          // Buscar el usuario en la base de datos
          console.log('🔍 Buscando usuario en base de datos...');
          const { data: existingUser, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single()

          if (error || !existingUser) {
            // Si no existe, no permitir login
            console.log('❌ Usuario no encontrado en la base de datos:', user.email, error?.message);
            return false
          }

          console.log('✅ Usuario encontrado en base de datos:', {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role,
            companyId: existingUser.company_id
          });

          // Actualizar la información del usuario con los datos de Google
          user.id = existingUser.id
          user.role = existingUser.role
          user.companyId = existingUser.company_id
          user.companyName = undefined
          ;(user as any).impersonatingUserId = null

          console.log('✅ Login con Google autorizado para:', user.email);
          return true
        } catch (error) {
          console.error('❌ Error en signIn callback:', error)
          return false
        }
      }
      
      // Para login con credenciales, permitir siempre
      console.log('✅ Login con credenciales autorizado para:', user?.email);
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        console.log('🔍 NextAuth JWT callback - actualizando token:', {
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          provider: account?.provider
        });
        
        token.role = user.role
        token.companyId = user.companyId
        token.companyName = user.companyName
        token.impersonatingUserId = (user as any).impersonatingUserId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        console.log('🔍 NextAuth session callback - creando sesión:', {
          userId: token.sub,
          userEmail: session.user?.email,
          userRole: token.role,
          companyId: token.companyId
        });
        
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
        ;(session.user as any).impersonatingUserId = token.impersonatingUserId as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  debug: true
}
