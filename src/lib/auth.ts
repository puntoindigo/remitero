import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "./supabase"
import { logger } from "./logger"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("🔍 NextAuth authorize - Iniciando...")
          
          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Credenciales faltantes")
            return null
          }

          console.log("🔍 Verificando usuario:", credentials.email)

          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            console.log("❌ Usuario no encontrado:", credentials.email, error?.message)
            return null
          }

          console.log("✅ Usuario encontrado:", { email: user.email, role: user.role })

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log("❌ Contraseña incorrecta para:", credentials.email)
            return null
          }

          console.log("✅ Autenticación exitosa para:", credentials.email)

          // Log del login exitoso (temporalmente deshabilitado para debugging)
          console.log("✅ Login exitoso - logging deshabilitado temporalmente")

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.company_id,
            companyName: null,
            impersonatingUserId: null
          }
        } catch (error) {
          console.error("❌ Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.companyId = user.companyId
        token.companyName = user.companyName
        token.impersonatingUserId = user.impersonatingUserId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
        session.user.impersonatingUserId = token.impersonatingUserId as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Asegurar que siempre use la URL base correcta
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  debug: true, // Habilitar debug en producción para diagnosticar
  logger: {
    error: (code, metadata) => {
      console.error("NextAuth Error:", code, metadata)
    },
    warn: (code) => {
      console.warn("NextAuth Warning:", code)
    },
    debug: (code) => {
      console.log("NextAuth Debug:", code)
    }
  }
}
