import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

// Crear una instancia de Prisma específica para NextAuth
const createPrismaClient = () => {
  const isPreview = process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development'
  const databaseUrl = isPreview 
    ? process.env.DATABASE_URL || process.env.dev_PRISMA_DATABASE_URL || process.env.dev_POSTGRES_URL
    : process.env.DATABASE_URL || process.env.prod_PRISMA_DATABASE_URL || process.env.prod_POSTGRES_URL
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured')
  }
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("🔍 NextAuth authorize called with:", { email: credentials?.email, hasPassword: !!credentials?.password })
          
          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Credenciales faltantes")
            throw new Error("Credenciales requeridas")
          }

          console.log("🔍 Creando cliente Prisma...")
          const prisma = createPrismaClient()
          console.log("✅ Cliente Prisma creado")

          console.log("🔍 Buscando usuario en base de datos...")
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            console.log("❌ Usuario no encontrado:", credentials.email)
            await prisma.$disconnect()
            throw new Error("Usuario no encontrado")
          }

          console.log("✅ Usuario encontrado:", { email: user.email, role: user.role })

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log("❌ Contraseña incorrecta para:", credentials.email)
            await prisma.$disconnect()
            throw new Error("Contraseña incorrecta")
          }

          console.log("✅ Autenticación exitosa para:", credentials.email)
          await prisma.$disconnect()

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
            companyName: null, // Se puede obtener después si es necesario
            impersonatingUserId: user.impersonatingUserId
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
  debug: process.env.NODE_ENV === "development",
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
