"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { FileText, Package, Users, Building2, Tag, ShoppingBag, Plus, Eye, Building, BarChart3 } from "lucide-react"
import { RemitosChart } from "@/components/common/RemitosChart"
import Link from "next/link"
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple"
import { useEmpresas } from "@/hooks/useEmpresas"
import FilterableSelect from "@/components/common/FilterableSelect"
import { useShortcuts } from "@/hooks/useShortcuts"
import { PinnedModalsPanel } from "@/components/common/PinnedModalsPanel"
import { useIsMobile } from "@/hooks/useIsMobile"

interface DashboardStats {
  remitos: {
    total: number;
    byStatus: Array<{ id: string; name: string; count: number }>;
    byDay?: Array<{ date: string; count: number; label: string }>;
  };
  productos: {
    total: number;
    conStock: number;
    sinStock: number;
    topVendidos?: Array<{ product_id: string; name: string; totalQuantity: number }>;
  };
  clientes: number;
  categorias: number;
  usuarios: number;
  empresas: number;
}

interface DashboardCard {
  title: string;
  icon: any;
  color: string;
  textColor: string;
  bgColor: string;
  stats: Array<{ label: string; value: number; link: string }>;
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
  const isMobile = useIsMobile()
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
  const [remitosViewMode, setRemitosViewMode] = useState<'status' | 'chart'>('chart')

  // Track para evitar cargas duplicadas por mismo companyId
  const lastFetchedCompanyId = useRef<string | null>(null)
  const inFlightCompanyId = useRef<string | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Redirigir a versión mobile si es necesario
  useEffect(() => {
    if (isMobile && typeof window !== 'undefined') {
      router.replace('/dashboard/mobile');
    }
  }, [isMobile, router]);

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
          remitos: { 
            total: data.remitos?.total || 0, 
            byStatus: data.remitos?.byStatus || [],
            byDay: data.remitos?.byDay || []
          },
          productos: { 
            total: data.productos?.total || 0, 
            conStock: data.productos?.conStock || 0, 
            sinStock: data.productos?.sinStock || 0,
            topVendidos: data.productos?.topVendidos || []
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
          productos: { total: 0, conStock: 0, sinStock: 0, topVendidos: [] },
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

  // No renderizar nada mientras redirige a mobile
  if (isMobile) {
    return null;
  }

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
        { label: "Con stock", value: stats.productos.conStock, link: "/productos" },
        { label: "Sin stock", value: stats.productos.sinStock, link: "/productos" }
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
        { label: "Nuevos hoy", value: todayStats.clientes, link: "/clientes" }
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
        <h2 className="page-title-desktop" style={{ 
          fontSize: isMobile ? '24px' : undefined, 
          fontWeight: isMobile ? 700 : undefined, 
          color: isMobile ? '#111827' : undefined,
          marginBottom: isMobile ? '0.75rem' : undefined,
          marginTop: '0',
          padding: '0 16px'
        }}>
          Tablero de Control
        </h2>
        
          {/* Selector de empresa para SUPERADMIN */}
          {currentUser?.role === "SUPERADMIN" && empresas?.length > 0 && (
            <div style={{ 
              marginBottom: '0', 
              marginTop: 0,
              padding: '0 16px',
              width: '100%' 
            }}>
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
          {cards.map((card) => {
            const isRemitosCard = card.title === "Remitos";
            const showChart = isRemitosCard && remitosViewMode === 'chart';
            const showStatus = isRemitosCard && remitosViewMode === 'status';
            
            return (
              <div key={card.title} className="dashboard-card" style={{ position: 'relative' }}>
                {/* Header con ícono y título */}
                <div className="dashboard-card-header">
                  <h3 className="dashboard-card-title">
                    <card.icon className="dashboard-card-icon" />
                    {card.title}
                  </h3>
                  {/* Mostrar total de remitos siempre visible en el header cuando está en modo gráfico */}
                  {isRemitosCard && showChart && (
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '3.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      zIndex: 10
                    }}>
                      <span style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#3b82f6'
                      }}>
                        {stats.remitos.total}
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        fontWeight: 500
                      }}>
                        Total
                      </span>
                    </div>
                  )}
                  {/* Botón pequeño para cambiar vista en Remitos */}
                  {isRemitosCard && (
                    <button
                      onClick={() => setRemitosViewMode(remitosViewMode === 'chart' ? 'status' : 'chart')}
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.25rem',
                        background: '#fff',
                        color: '#6b7280',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        zIndex: 10
                      }}
                      title={remitosViewMode === 'chart' ? 'Ver por estado' : 'Ver gráfico'}
                    >
                      {remitosViewMode === 'chart' ? (
                        <>
                          <FileText className="h-3 w-3" />
                          <span style={{ fontSize: '0.6875rem' }}>Estados</span>
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-3 w-3" />
                          <span style={{ fontSize: '0.6875rem' }}>Gráfico</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {/* Body - Estadísticas o Gráfico */}
                <div className="dashboard-card-body">
                  {showChart && stats.remitos.byDay && stats.remitos.byDay.length > 0 ? (
                    <div style={{ padding: '0.5rem 0' }}>
                      <RemitosChart data={stats.remitos.byDay} />
                    </div>
                  ) : showStatus ? (
                    card.stats.map((stat, index) => (
                      <Link key={index} href={stat.link} className="dashboard-stat-link">
                        <div className="dashboard-stat-content">
                          <span className="dashboard-stat-label">{stat.label}</span>
                          <div className="dashboard-stat-value">
                            <span className="dashboard-stat-number">{stat.value}</span>
                            <Eye className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    card.stats.map((stat, index) => (
                      <Link key={index} href={stat.link} className="dashboard-stat-link">
                        <div className="dashboard-stat-content">
                          <span className="dashboard-stat-label">{stat.label}</span>
                          <div className="dashboard-stat-value">
                            <span className="dashboard-stat-number">{stat.value}</span>
                            <Eye className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
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
            );
          })}
        </div>
      </div>
    </main>
  )
}