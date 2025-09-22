"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { FileText, Package, Users, Building2, Tag, ShoppingBag, Plus, Eye } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  remitos: {
    total: number;
    pendientes: number;
    preparados: number;
    entregados: number;
  };
  productos: {
    total: number;
    conStock: number;
    sinStock: number;
  };
  clientes: number;
  categorias: number;
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    remitos: { total: 0, pendientes: 0, preparados: 0, entregados: 0 },
    productos: { total: 0, conStock: 0, sinStock: 0 },
    clientes: 0,
    categorias: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      if (!session?.user?.companyId) return
      
      try {
        const [remitosRes, productosRes, clientesRes, categoriasRes] = await Promise.all([
          fetch('/api/remitos'),
          fetch('/api/products'),
          fetch('/api/clients'),
          fetch('/api/categories')
        ])

        const [remitos, productos, clientes, categorias] = await Promise.all([
          remitosRes.json(),
          productosRes.json(),
          clientesRes.json(),
          categoriasRes.json()
        ])

        // Procesar estadísticas de remitos
        const remitosStats = {
          total: remitos.length,
          pendientes: remitos.filter((r: any) => r.status === 'PENDIENTE').length,
          preparados: remitos.filter((r: any) => r.status === 'PREPARADO').length,
          entregados: remitos.filter((r: any) => r.status === 'ENTREGADO').length
        }

        // Procesar estadísticas de productos
        const productosStats = {
          total: productos.length,
          conStock: productos.filter((p: any) => {
            if (p.stock) return p.stock === 'IN_STOCK'
            return !p.description?.includes('Stock: OUT_OF_STOCK')
          }).length,
          sinStock: productos.filter((p: any) => {
            if (p.stock) return p.stock === 'OUT_OF_STOCK'
            return p.description?.includes('Stock: OUT_OF_STOCK')
          }).length
        }

        setStats({
          remitos: remitosStats,
          productos: productosStats,
          clientes: clientes.length,
          categorias: categorias.length
        })
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [session?.user?.companyId])

  const cards = [
    {
      title: "Remitos",
      icon: FileText,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      stats: [
        { label: "Total", value: stats.remitos.total, link: "/remitos" },
        { label: "Pendientes", value: stats.remitos.pendientes, link: "/remitos?status=PENDIENTE" },
        { label: "Preparados", value: stats.remitos.preparados, link: "/remitos?status=PREPARADO" },
        { label: "Entregados", value: stats.remitos.entregados, link: "/remitos?status=ENTREGADO" }
      ]
    },
    {
      title: "Productos",
      icon: Package,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      stats: [
        { label: "Total", value: stats.productos.total, link: "/productos" },
        { label: "Con Stock", value: stats.productos.conStock, link: "/productos?stock=IN_STOCK" },
        { label: "Sin Stock", value: stats.productos.sinStock, link: "/productos?stock=OUT_OF_STOCK" }
      ]
    },
    {
      title: "Clientes",
      icon: Users,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: [
        { label: "Total", value: stats.clientes, link: "/clientes" }
      ]
    },
    {
      title: "Categorías",
      icon: Tag,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      stats: [
        { label: "Total", value: stats.categorias, link: "/categorias" }
      ]
    }
  ]

  if (isLoading) {
    return (
      <main className="main-content">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Bienvenido, {session?.user?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.textColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                </div>
                
                <div className="space-y-3">
                  {card.stats.map((stat, index) => (
                    <Link
                      key={index}
                      href={stat.link}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          {stat.label}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {stat.value}
                          </span>
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href={card.stats[0].link}
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ver {card.title.toLowerCase()}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acciones rápidas */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/remitos"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <FileText className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium text-gray-900">Nuevo Remito</span>
            </Link>
            <Link
              href="/productos"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <Package className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium text-gray-900">Gestionar Productos</span>
            </Link>
            <Link
              href="/clientes"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <Users className="h-5 w-5 text-purple-600 mr-3" />
              <span className="font-medium text-gray-900">Gestionar Clientes</span>
            </Link>
            <Link
              href="/categorias"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <Tag className="h-5 w-5 text-orange-600 mr-3" />
              <span className="font-medium text-gray-900">Gestionar Categorías</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}