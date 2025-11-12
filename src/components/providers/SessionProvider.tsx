"use client"

import { SessionProvider } from "next-auth/react"

interface Props {
  children: React.ReactNode
}

export default function AuthSessionProvider({ children }: Props) {
  // Optimizar SessionProvider con refetchInterval más largo para reducir requests
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch cada 5 minutos en lugar del default
      refetchOnWindowFocus={false} // No refetch al cambiar de ventana
    >
      {children}
    </SessionProvider>
  )
}
