"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { User, LogOut, Building2, Users } from "lucide-react"

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" })
  }

  const isSuperAdmin = session?.user?.role === "SUPERADMIN"
  const isAdmin = session?.user?.role === "ADMIN" || isSuperAdmin

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Sistema de Remitos</h1>
            {session?.user?.companyName && (
              <div className="ml-4 flex items-center text-sm">
                <Building2 className="h-4 w-4 mr-1" />
                <span>Empresa: {session.user.companyName}</span>
              </div>
            )}
          </div>

          <nav className="hidden md:flex space-x-8">
            <a
              href="/dashboard"
              className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="/remitos"
              className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              Remitos
            </a>
            <a
              href="/productos"
              className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              Productos
            </a>
            <a
              href="/clientes"
              className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              Clientes
            </a>
            <a
              href="/categorias"
              className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              Categorías
            </a>
            {isAdmin && (
              <a
                href="/usuarios"
                className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                Usuarios
              </a>
            )}
            {isSuperAdmin && (
              <a
                href="/empresas"
                className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                Empresas
              </a>
            )}
          </nav>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
            >
              <User className="h-6 w-6" />
              <span className="ml-2">{session?.user?.name}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-medium">{session?.user?.name}</div>
                  <div className="text-gray-500">{session?.user?.email}</div>
                  <div className="text-gray-500 capitalize">{session?.user?.role?.toLowerCase()}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
