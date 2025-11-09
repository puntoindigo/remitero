"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { FileText, Package, Users, Building2, Tag, ShoppingBag, Plus, Eye, Building } from "lucide-react"
import Link from "next/link"
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple"
import { useEmpresas } from "@/hooks/useEmpresas"
import FilterableSelect from "@/components/common/FilterableSelect"
import { useShortcuts } from "@/hooks/useShortcuts"
import { PinnedModalsPanel } from "@/components/common/PinnedModalsPanel"

interface DashboardStats {
  remitos: {
    total: number;
    byStatus: Array<{ id: string; name: string; count: number }>;
  };
  productos: {
    total: number;
    conStock: number;
    sinStock: number;
  };
  clientes: number;
  categorias: number;
  usuarios: number;
  empresas: number;
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
  const { empresas } = useEmpresas()
  const router = useRouter()
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [stats, setStats] = useState<DashboardStats>({
    remitos: { total: 0, byStatus: [] },
    productos: { total: 0, conStock: 0, sinStock: 0 },
    clientes: 0,
    categorias: 0,
    usuarios: 0,
    empresas: 0
  })
  const [todayStats, setTodayStats] = useState<TodayStats>({
    usuarios: 0,
    clientes: 0,
    productos: 0,
    categorias: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Cargar selección de empresa desde sessionStorage al inicializar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCompanyId = sessionStorage.getItem('selectedCompanyId');
      if (savedCompanyId) {
        setSelectedCompanyId(savedCompanyId);
      }
    }
  }, []);

  // Guardar selección de empresa en sessionStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedCompanyId) {
        sessionStorage.setItem('selectedCompanyId', selectedCompanyId);
      } else {
        sessionStorage.removeItem('selectedCompanyId');
      }
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    const abortController = new AbortController();
    // Debounce para evitar peticiones duplicadas en montajes/re-renders cercanos
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current as any);
    }
    const loadStats = async () => {
      // Determinar el companyId efectivo
      // Si es SUPERADMIN y selectedCompanyId es "", significa "Todas las empresas" (null)
      // Si es SUPERADMIN y selectedCompanyId tiene valor, usar ese valor
      // Si no es SUPERADMIN, usar el companyId del usuario
      const effectiveCompanyId = currentUser?.role === "SUPERADMIN" 
        ? (selectedCompanyId === "" ? null : (selectedCompanyId || null))
        : currentUser?.companyId;
      
      // Para SUPERADMIN, permitir null (todas las empresas)
      // Para otros roles, requerir companyId
      if (!effectiveCompanyId && currentUser?.role !== "SUPERADMIN") return
      
      // Evitar cargas repetidas por el mismo companyId
      // Usar string "all" para representar null (todas las empresas) en el tracking
      const trackingKey = effectiveCompanyId || "all";
      if (lastFetchedCompanyId.current === trackingKey) return;
      // Evitar iniciar dos fetch simultáneos para el mismo companyId
      if (inFlightCompanyId.current === trackingKey) return;
      inFlightCompanyId.current = trackingKey;
      
      try {
        // Si effectiveCompanyId es null (todas las empresas), no pasar el parámetro
        const url = effectiveCompanyId 
          ? `/api/dashboard?companyId=${effectiveCompanyId}` 
          : `/api/dashboard`;
        const resp = await fetch(url, { signal: abortController.signal });
        if (!resp.ok) throw new Error('Error al cargar dashboard agregado');
        const data = await resp.json();

        setStats({
          remitos: { total: data.remitos?.total || 0, byStatus: data.remitos?.byStatus || [] },
          productos: { 
            total: data.productos?.total || 0, 
            conStock: data.productos?.conStock || 0, 
            sinStock: data.productos?.sinStock || 0 
          },
          clientes: data.clientes?.total || 0,
          categorias: data.categorias?.total || 0,
          usuarios: data.usuarios?.total || 0,
          empresas: data.empresas?.total || 0
        })

        setTodayStats({
          usuarios: data.usuarios?.today || 0,
          clientes: data.clientes?.today || 0,
          productos: data.productos?.today || 0,
          categorias: data.categorias?.today || 0
        })
        // Marcar como cargado exitosamente para este companyId
        lastFetchedCompanyId.current = trackingKey;
      } catch (error: any) {
        // Silenciar abortos esperados al cambiar rápido de empresa o desmontar
        if (error?.name === 'AbortError') {
          return;
        }
        console.error('Error loading dashboard stats:', error);
        // Si el error es un Event, probablemente es un error de red
        if (error instanceof Event) {
          console.error('Network error detected:', error.type);
        } else if (error instanceof Error) {
          console.error('Error message:', error.message);
        }
        // Establecer valores por defecto para evitar UI rota
        setStats({
          remitos: { total: 0, byStatus: [] },
          productos: { total: 0, conStock: 0, sinStock: 0 },
          clientes: 0,
          categorias: 0,
          usuarios: 0,
          empresas: 0
        });
        setTodayStats({
          usuarios: 0,
          clientes: 0,
          productos: 0,
          categorias: 0
        });
      } finally {
        inFlightCompanyId.current = null;
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    // OPTIMIZADO: Reducir debounce a 50ms para carga más rápida
    debounceTimer.current = setTimeout(() => {
      loadStats();
    }, 50);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current as any);
      abortController.abort();
    };
  }, [currentUser?.companyId, currentUser?.role, selectedCompanyId])

  // Track para evitar cargas duplicadas por mismo companyId
  const lastFetchedCompanyId = useRef<string | null>(null)
  const inFlightCompanyId = useRef<string | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Funciones helper para generar enlaces y nombres
  const getNewLink = (title: string) => {
    switch (title) {
      case "Remitos": return "/remitos/nuevo";
      case "Productos": return "/productos/nuevo";
      case "Clientes": return "/clientes/nuevo";
      case "Categorías": return "/categorias/nuevo";
      case "Usuarios": return "/usuarios/nuevo";
      case "Empresas": return "/empresas";
      default: return "/";
    }
  };

  const getSingularName = (title: string) => {
    switch (title) {
      case "Remitos": return "Remito";
      case "Productos": return "Producto";
      case "Clientes": return "Cliente";
      case "Categorías": return "Categoría";
      case "Usuarios": return "Usuario";
      case "Empresas": return "Empresa";
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
        ...stats.remitos.byStatus
          .filter(s => s.count > 0)
          .map(s => {
            const statusSlug = (s.name || '').toString().trim().replace(/\s+/g, '_').toUpperCase();
            return { label: s.name, value: s.count, link: `/remitos?status=${statusSlug}` };
          })
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
    }
  ]

  // Agregar tarjeta de categorías solo si el usuario es ADMIN o SUPERADMIN
  if (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') {
    cards.push({
      title: "Categorías",
      icon: Tag,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      stats: [
        { label: "Total", value: stats.categorias, link: "/categorias" },
        ...(todayStats.categorias > 0 ? [{ label: "Nuevos hoy", value: todayStats.categorias, link: "/categorias" }] : [])
      ]
    })
  }

  // Agregar tarjeta de usuarios solo si el usuario es ADMIN o SUPERADMIN
  if (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') {
    cards.push({
      title: "Usuarios",
      icon: Building2,
      color: "bg-indigo-500",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      stats: [
        { label: "Total", value: stats.usuarios, link: "/usuarios" },
        ...(todayStats.usuarios > 0 ? [{ label: "Nuevos hoy", value: todayStats.usuarios, link: "/usuarios" }] : [])
      ]
    })
  }

  // Agregar tarjeta de empresas solo si el usuario es SUPERADMIN
  if (currentUser?.role === 'SUPERADMIN') {
    cards.push({
      title: "Empresas",
      icon: Building,
      color: "bg-cyan-500",
      textColor: "text-cyan-600",
      bgColor: "bg-cyan-50",
      stats: [
        { label: "Total", value: stats.empresas, link: "/empresas" }
      ]
    })
  }

  // Shortcut para ir al dashboard (si no está en uso globalmente)
  // Nota: El shortcut 'D' ya existe en Header.tsx globalmente, pero lo agregamos aquí
  // para asegurar que funcione incluso si Header no está montado
  useShortcuts([
    {
      key: 'd',
      action: () => router.push('/dashboard'),
      description: 'Dashboard'
    }
  ], true);

  // OPTIMIZADO: No mostrar loading spinner - mostrar contenido inmediatamente con skeleton o datos en cache
  // Solo mostrar loading si realmente no hay datos (primera carga)
  if (isLoading && stats.remitos.total === 0 && stats.productos.total === 0 && stats.clientes === 0) {
    return (
      <main className="main-content">
        <div className="form-section">
          <h2>Tablero de Control</h2>
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500 text-sm">Cargando datos...</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="form-section">
        <h2>Tablero de Control</h2>
        
          {/* Selector de empresa para SUPERADMIN */}
          {currentUser?.role === "SUPERADMIN" && empresas?.length > 0 && (
            <div style={{ marginBottom: '1.5rem', width: '100%' }}>
              <FilterableSelect
                options={[
                  { id: "", name: "Todas las empresas" },
                  ...empresas
                ]}
                value={selectedCompanyId}
                onChange={setSelectedCompanyId}
                placeholder="Seleccionar empresa"
                className="w-full"
                useThemeColors={true}
              />
            </div>
          )}

          {/* Panel de Modales Anclados */}
          <PinnedModalsPanel />

        <div className="dashboard-grid">
          {cards.map((card) => (
            <div key={card.title} className="dashboard-card">
              {/* Header con ícono y título */}
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">
                  <card.icon className="dashboard-card-icon" />
                  {card.title}
                </h3>
              </div>
              
              {/* Body - Estadísticas */}
              <div className="dashboard-card-body">
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

              {/* Footer - Acciones (botones siempre a la misma altura) */}
              <div className="dashboard-card-footer">
                <div className="dashboard-buttons-row">
                  <Link href={card.stats[0].link} className="dashboard-view-button">
                    <Eye className="h-4 w-4" />
                    Ver {card.title.toLowerCase()}
                  </Link>
                  <Link href={getNewLink(card.title)} className="dashboard-new-button">
                    <Plus className="h-4 w-4" />
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