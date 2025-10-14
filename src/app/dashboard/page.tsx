"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { FileText, Package, Users, Building2, Tag, ShoppingBag, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple"

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

interface TodayStats {
  usuarios: number;
  clientes: number;
  productos: number;
  categorias: number;
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const currentUser = useCurrentUserSimple()
  const [stats, setStats] = useState<DashboardStats>({
    remitos: { total: 0, pendientes: 0, preparados: 0, entregados: 0 },
    productos: { total: 0, conStock: 0, sinStock: 0 },
    clientes: 0,
    categorias: 0
  })
  const [todayStats, setTodayStats] = useState<TodayStats>({
    usuarios: 0,
    clientes: 0,
    productos: 0,
    categorias: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser?.companyId) return
      
      try {
        // Cargar estadísticas principales
        const [remitosRes, productosRes, clientesRes, categoriasRes] = await Promise.all([
          fetch(`/api/remitos?companyId=${currentUser.companyId}`),
          fetch(`/api/products?companyId=${currentUser.companyId}`),
          fetch(`/api/clients?companyId=${currentUser.companyId}`),
          fetch(`/api/categories?companyId=${currentUser.companyId}`)
        ])

        const [remitos, productos, clientes, categorias] = await Promise.all([
          remitosRes.json(),
          productosRes.json(),
          clientesRes.json(),
          categoriasRes.json()
        ])

        // Cargar conteos de hoy
        const [usuariosTodayRes, clientesTodayRes, productosTodayRes, categoriasTodayRes] = await Promise.all([
          fetch(`/api/users?companyId=${currentUser.companyId}&countToday=true`),
          fetch(`/api/clients?companyId=${currentUser.companyId}&countToday=true`),
          fetch(`/api/products?companyId=${currentUser.companyId}&countToday=true`),
          fetch(`/api/categories?companyId=${currentUser.companyId}&countToday=true`)
        ])

        const [usuariosToday, clientesToday, productosToday, categoriasToday] = await Promise.all([
          usuariosTodayRes.json(),
          clientesTodayRes.json(),
          productosTodayRes.json(),
          categoriasTodayRes.json()
        ])

        // Debug logs
        console.log('Dashboard API responses:', {
          remitos: Array.isArray(remitos) ? `Array(${remitos.length})` : typeof remitos,
          productos: Array.isArray(productos) ? `Array(${productos.length})` : typeof productos,
          clientes: Array.isArray(clientes) ? `Array(${clientes.length})` : typeof clientes,
          categorias: Array.isArray(categorias) ? `Array(${categorias.length})` : typeof categorias
        })

        // Validar que las respuestas sean arrays
        const remitosArray = Array.isArray(remitos) ? remitos : []
        const productosArray = Array.isArray(productos) ? productos : []
        const clientesArray = Array.isArray(clientes) ? clientes : []
        const categoriasArray = Array.isArray(categorias) ? categorias : []

        // Procesar estadísticas de remitos
        const remitosStats = {
          total: remitosArray.length,
          pendientes: remitosArray.filter((r: any) => r.status === 'PENDIENTE').length,
          preparados: remitosArray.filter((r: any) => r.status === 'PREPARADO').length,
          entregados: remitosArray.filter((r: any) => r.status === 'ENTREGADO').length
        }

        // Procesar estadísticas de productos
        const productosStats = {
          total: productosArray.length,
          conStock: productosArray.filter((p: any) => p.stock === 'IN_STOCK').length,
          sinStock: productosArray.filter((p: any) => p.stock === 'OUT_OF_STOCK').length
        }

        setStats({
          remitos: remitosStats,
          productos: productosStats,
          clientes: clientesArray.length,
          categorias: categoriasArray.length
        })

        // Establecer conteos de hoy
        setTodayStats({
          usuarios: usuariosToday.count || 0,
          clientes: clientesToday.count || 0,
          productos: productosToday.count || 0,
          categorias: categoriasToday.count || 0
        })
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [currentUser?.companyId])

  // Funciones helper para generar enlaces y nombres
  const getNewLink = (title: string) => {
    switch (title) {
      case "Remitos": return "/remitos?new=true";
      case "Productos": return "/productos?new=true";
      case "Clientes": return "/clientes?new=true";
      case "Categorías": return "/categorias?new=true";
      default: return "/";
    }
  };

  const getSingularName = (title: string) => {
    switch (title) {
      case "Remitos": return "Remito";
      case "Productos": return "Producto";
      case "Clientes": return "Cliente";
      case "Categorías": return "Categoría";
      default: return title;
    }
  };

  const getNewText = (title: string) => {
    switch (title) {
      case "Categorías": return "Nueva";
      default: return "Nuevo";
    }
  };

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
        { label: "Sin Stock", value: stats.productos.sinStock, link: "/productos?stock=OUT_OF_STOCK" },
        ...(todayStats.productos > 0 ? [{ label: "Nuevos hoy", value: todayStats.productos, link: "/productos" }] : [])
      ]
    },
    {
      title: "Clientes",
      icon: Users,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      stats: [
        { label: "Total", value: stats.clientes, link: "/clientes" },
        ...(todayStats.clientes > 0 ? [{ label: "Nuevos hoy", value: todayStats.clientes, link: "/clientes" }] : [])
      ]
    },
    {
      title: "Categorías",
      icon: Tag,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      stats: [
        { label: "Total", value: stats.categorias, link: "/categorias" },
        ...(todayStats.categorias > 0 ? [{ label: "Nuevos hoy", value: todayStats.categorias, link: "/categorias" }] : [])
      ]
    }
  ]

  // Agregar tarjeta de usuarios solo si el usuario es ADMIN o SUPERADMIN
  if (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') {
    cards.push({
      title: "Usuarios",
      icon: Building2,
      color: "bg-indigo-500",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      stats: [
        { label: "Total", value: 0, link: "/usuarios" }, // TODO: Agregar conteo total de usuarios
        ...(todayStats.usuarios > 0 ? [{ label: "Nuevos hoy", value: todayStats.usuarios, link: "/usuarios" }] : [])
      ]
    })
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Tablero de Control</h1>
          <p className="mt-2 text-gray-600">
            Bienvenido, {currentUser?.name}
          </p>
        </div>

        <div className="dashboard-grid">
          {cards.map((card) => (
            <div key={card.title} className="dashboard-card">
              <div className="dashboard-card-header">
                <div className={`dashboard-icon ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.textColor}`} />
                </div>
                <h3 className="dashboard-card-title">{card.title}</h3>
              </div>
              
              <div className="dashboard-stats">
                {card.stats.map((stat, index) => (
                  <Link key={index} href={stat.link} className="dashboard-stat-link">
                    <div className="dashboard-stat-content">
                      <span className="dashboard-stat-label">{stat.label}</span>
                      <div className="dashboard-stat-value">
                        <span className="dashboard-stat-number">{stat.value}</span>
                        <Eye className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="dashboard-card-footer">
                <div className="dashboard-buttons-row">
                  <Link href={card.stats[0].link} className="dashboard-view-button">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver {card.title.toLowerCase()}
                  </Link>
                  <Link href={getNewLink(card.title)} className="dashboard-new-button">
                    <Plus className="h-4 w-4 mr-2" />
                    {getNewText(card.title)} {getSingularName(card.title)}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}