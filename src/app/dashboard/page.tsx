"use client"

import { useSession } from "next-auth/react"
import { FileText, Package, Users, Building2, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()

  const stats = [
    {
      name: "Remitos Pendientes",
      value: "12",
      icon: FileText,
      color: "text-yellow-600"
    },
    {
      name: "Productos Activos",
      value: "45",
      icon: Package,
      color: "text-blue-600"
    },
    {
      name: "Clientes",
      value: "23",
      icon: Users,
      color: "text-green-600"
    },
    {
      name: "Empresa",
      value: session?.user?.companyName || "Sin empresa",
      icon: Building2,
      color: "text-purple-600"
    }
  ]

  return (
    <main className="main-content">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Bienvenido, {session?.user?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Acciones rápidas
              </h3>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <a
                  href="/remitos"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Nuevo Remito
                </a>
                <a
                  href="/productos"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Gestionar Productos
                </a>
                <a
                  href="/clientes"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gestionar Clientes
                </a>
                <a
                  href="/categorias"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Gestionar Categorías
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
