import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "./supabase"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.companyId = user.companyId
        token.companyName = user.companyName
        token.impersonatingUserId = (user as any).impersonatingUserId
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
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // SIEMPRE usar NEXTAUTH_URL como fuente de verdad para el puerto
      const nextAuthUrl = process.env.NEXTAUTH_URL;
      let correctBaseUrl = baseUrl;
      
      // En desarrollo, SIEMPRE forzar el puerto de NEXTAUTH_URL si está configurado
      if (process.env.NODE_ENV === "development" && nextAuthUrl) {
        try {
          const nextAuthUrlObj = new URL(nextAuthUrl);
          const baseUrlObj = new URL(baseUrl);
          
          // Si son localhost, SIEMPRE usar el puerto de NEXTAUTH_URL
          if (baseUrlObj.hostname === "localhost" && 
              nextAuthUrlObj.hostname === "localhost") {
            baseUrlObj.port = nextAuthUrlObj.port;
            baseUrlObj.protocol = nextAuthUrlObj.protocol;
            correctBaseUrl = baseUrlObj.toString();
            
            // Log para debug (solo en desarrollo)
            if (baseUrl !== correctBaseUrl) {
              console.log(`[NextAuth Redirect] Corrigiendo baseUrl: ${baseUrl} -> ${correctBaseUrl}`);
            }
          }
        } catch (error) {
          console.warn('[NextAuth Redirect] Error parsing URLs:', error);
        }
      }
      
      // Si la URL es relativa, SIEMPRE usar el baseUrl corregido
      if (url.startsWith("/")) {
        const finalUrl = correctBaseUrl + url;
        if (process.env.NODE_ENV === "development") {
          console.log(`[NextAuth Redirect] URL relativa: ${url} -> ${finalUrl}`);
        }
        return finalUrl;
      }
      
      // Si la URL es absoluta, SIEMPRE verificar y corregir puerto
      try {
        const urlObj = new URL(url);
        const nextAuthUrlObj = nextAuthUrl ? new URL(nextAuthUrl) : null;
        
        // Si es localhost en desarrollo, SIEMPRE corregir el puerto
        if (urlObj.hostname === "localhost" && 
            process.env.NODE_ENV === "development" &&
            nextAuthUrlObj &&
            nextAuthUrlObj.hostname === "localhost" &&
            urlObj.port !== nextAuthUrlObj.port) {
          urlObj.port = nextAuthUrlObj.port;
          urlObj.protocol = nextAuthUrlObj.protocol;
          const correctedUrl = urlObj.toString();
          if (process.env.NODE_ENV === "development") {
            console.log(`[NextAuth Redirect] Corrigiendo URL absoluta: ${url} -> ${correctedUrl}`);
          }
          return correctedUrl;
        }
        
        // Si la URL contiene el baseUrl incorrecto, reemplazarlo
        if (url.includes(baseUrl) && correctBaseUrl !== baseUrl) {
          const correctedUrl = url.replace(baseUrl, correctBaseUrl);
          if (process.env.NODE_ENV === "development") {
            console.log(`[NextAuth Redirect] Reemplazando baseUrl en URL: ${url} -> ${correctedUrl}`);
          }
          return correctedUrl;
        }
      } catch (error) {
        console.warn('[NextAuth Redirect] Error procesando URL absoluta:', error);
      }
      
      // Si la URL empieza con el baseUrl (correcto o incorrecto), intentar usar el corregido
      if (url.startsWith(baseUrl) || url.startsWith(correctBaseUrl)) {
        // Si el baseUrl fue corregido, usar la versión corregida
        if (correctBaseUrl !== baseUrl && url.startsWith(baseUrl)) {
          return url.replace(baseUrl, correctBaseUrl);
        }
        return url;
      }
      
      // Para cualquier otro caso, usar el baseUrl corregido
      return correctBaseUrl;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  }
}
