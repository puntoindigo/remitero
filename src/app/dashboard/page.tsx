"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { FileText, Package, Users, Building2, Tag, ShoppingBag, Plus, Eye, Building } from "lucide-react"
import { RemitosChart } from "@/components/common/RemitosChart"
import Link from "next/link"
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple"
import { useEmpresas } from "@/hooks/useEmpresas"
import { CompanySelector } from "@/components/common/CompanySelector"
import { useShortcuts } from "@/hooks/useShortcuts"
import { PinnedModalsPanel } from "@/components/common/PinnedModalsPanel"
import { useIsMobile } from "@/hooks/useIsMobile"

interface DashboardStats {
  remitos: {
    total: number;
    byStatus: Array<{ id: string; name: string; count: number; color: string }>;
    byDay?: Array<any>;
    estados?: Array<{ id: string; name: string; color: string }>;
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
  const pathname = usePathname()
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

  // Track para evitar cargas duplicadas por mismo companyId
  const lastFetchedCompanyId = useRef<string | null>(null)
  const inFlightCompanyId = useRef<string | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Redirigir a versión mobile si es necesario
  // IMPORTANTE: Solo redirigir si realmente es mobile (ancho < 768px)
  // Evitar redirecciones innecesarias en desktop
  // NO redirigir si ya estamos en /dashboard/mobile (evitar loops)
  // NO redirigir si el usuario está cambiando contraseña temporal
  useEffect(() => {
    if (typeof window !== 'undefined' && isMobile && pathname !== '/dashboard/mobile') {
      // Verificar nuevamente el ancho antes de redirigir (evitar falsos positivos)
      const actualWidth = window.innerWidth;
      // También verificar user agent para detectar dispositivos reales vs ventanas pequeñas
      const isRealMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Solo redirigir si:
      // 1. El ancho es realmente pequeño (< 768px)
      // 2. Y es un dispositivo móvil real O el ancho es muy pequeño (< 600px para evitar falsos positivos)
      if (actualWidth < 768 && (isRealMobile || actualWidth < 600)) {
        console.log('📱 [Dashboard] Redirigiendo a versión mobile', { actualWidth, isMobile, isRealMobile, currentPath: pathname });
        router.replace('/dashboard/mobile');
      } else {
        console.log('🖥️ [Dashboard] Es desktop, no redirigir', { actualWidth, isMobile, isRealMobile, currentPath: pathname });
      }
    }
  }, [isMobile, router, pathname]);

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
        { label: "Total", value: stats.remitos.total, link: "/remitos" }
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

  // Obtener nombre de empresa seleccionada
  const selectedCompanyName = selectedCompanyId 
    ? empresas?.find(e => e.id === selectedCompanyId)?.name || "Todas las empresas"
    : "Todas las empresas";

  return (
    <main className="main-content">
      <div className="form-section">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem',
          padding: '0 16px'
        }}>
          <h2 className="page-title-desktop" style={{ 
            fontSize: isMobile ? '24px' : undefined, 
            fontWeight: isMobile ? 700 : undefined, 
            color: isMobile ? '#111827' : undefined,
            marginBottom: 0,
            marginTop: '0',
            padding: 0
          }}>
            Tablero de Control
          </h2>
          
          {/* Selector de empresa para SUPERADMIN */}
          <CompanySelector
            selectedCompanyId={selectedCompanyId}
            setSelectedCompanyId={setSelectedCompanyId}
          />
        </div>

          {/* Panel de Modales Anclados */}
          <PinnedModalsPanel />

        <div className="dashboard-grid">
          {cards.map((card) => {
            const isRemitosCard = card.title === "Remitos";
            
            return (
              <div key={card.title} className="dashboard-card" style={{ position: 'relative' }}>
                {/* Header con ícono y título */}
                <div className="dashboard-card-header">
                  <h3 className="dashboard-card-title">
                    <card.icon className="dashboard-card-icon" />
                    {card.title}
                  </h3>
                </div>
                
                {/* Body - Gráfico con estados integrados */}
                <div className="dashboard-card-body">
                  {isRemitosCard && stats.remitos.byDay && stats.remitos.byDay.length > 0 ? (
                    <div style={{ padding: '0.5rem 0' }}>
                      <RemitosChart 
                        data={stats.remitos.byDay}
                        total={stats.remitos.total}
                      />
                    </div>
                  ) : isRemitosCard ? (
                    <div style={{ 
                      width: '100%',
                      height: '200px', 
                      minHeight: '200px',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      No hay datos para mostrar
                    </div>
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

                {/* Footer - Acciones */}
                <div className="dashboard-card-footer">
                  <div className="dashboard-buttons-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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