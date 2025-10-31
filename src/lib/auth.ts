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

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.company_id,
            companyName: companyName,
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
      // Función para normalizar URLs y evitar barras múltiples
      const normalizeUrl = (urlStr: string): string => {
        // Normalizar múltiples barras consecutivas a una sola
        return urlStr.replace(/\/+/g, '/');
      };
      
      // SIEMPRE usar NEXTAUTH_URL como fuente de verdad para el puerto
      const nextAuthUrl = process.env.NEXTAUTH_URL;
      let correctBaseUrl = baseUrl.replace(/\/+$/, ''); // Eliminar barras al final
      
      // Normalizar la URL entrante para evitar barras múltiples
      let normalizedUrl = normalizeUrl(url);
      
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
            correctBaseUrl = baseUrlObj.toString().replace(/\/+$/, ''); // Normalizar
          }
        } catch (error) {
          console.warn('[NextAuth Redirect] Error parsing URLs:', error);
        }
      }
      
      // Si la URL es relativa, SIEMPRE usar el baseUrl corregido
      if (normalizedUrl.startsWith("/")) {
        // Evitar barras duplicadas entre baseUrl y url
        const separator = correctBaseUrl.endsWith("/") || normalizedUrl.startsWith("/") ? "" : "/";
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
