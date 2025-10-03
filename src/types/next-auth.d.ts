import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      companyId?: string
      companyName?: string
      originalAdmin?: {
        id: string
        name: string
        email: string
        role: string
        companyId?: string
        companyName?: string
      }
    }
    impersonation?: {
      isActive: boolean
      originalUserId?: string
      originalUserName?: string
      originalUserEmail?: string
      startedAt?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    companyId?: string
    companyName?: string
    originalAdmin?: {
      id: string
      name: string
      email: string
      role: string
      companyId?: string
      companyName?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    companyId?: string
    companyName?: string
    originalAdmin?: {
      id: string
      name: string
      email: string
      role: string
      companyId?: string
      companyName?: string
    }
    impersonation?: {
      isActive: boolean
      originalUserId?: string
      originalUserName?: string
      originalUserEmail?: string
      startedAt?: string
    }
  }
}
