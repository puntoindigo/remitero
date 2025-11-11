"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileText, Package, Users, Building2, Tag, Plus, Eye, Building } from "lucide-react";
import Link from "next/link";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import { useEmpresas } from "@/hooks/useEmpresas";
import FilterableSelect from "@/components/common/FilterableSelect";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { RemitosChart } from "@/components/common/RemitosChart";
import { BarChart3 } from "lucide-react";

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
  };
  clientes: number;
  categorias: number;
  usuarios: number;
  empresas: number;
}

export default function MobileDashboardPage() {
  const { data: session } = useSession();
  const currentUser = useCurrentUserSimple();
  const { empresas } = useEmpresas();
  const router = useRouter();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats>({
    remitos: { total: 0, byStatus: [] },
    productos: { total: 0, conStock: 0, sinStock: 0 },
    clientes: 0,
    categorias: 0,
    usuarios: 0,
    empresas: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [remitosViewMode, setRemitosViewMode] = useState<'status' | 'chart'>('chart');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCompanyId = sessionStorage.getItem('selectedCompanyId');
      if (savedCompanyId) {
        setSelectedCompanyId(savedCompanyId);
      }
    }
  }, []);

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
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current as any);
    }
    const loadStats = async () => {
      const effectiveCompanyId = currentUser?.role === "SUPERADMIN" 
        ? (selectedCompanyId === "" ? null : (selectedCompanyId || null))
        : currentUser?.companyId;
      
      if (!effectiveCompanyId && currentUser?.role !== "SUPERADMIN") return
      
      const trackingKey = effectiveCompanyId || "all";
      if (lastFetchedCompanyId.current === trackingKey) return;
      if (inFlightCompanyId.current === trackingKey) return;
      inFlightCompanyId.current = trackingKey;
      
      try {
        const url = effectiveCompanyId 
          ? `/api/dashboard?companyId=${effectiveCompanyId}` 
          : `/api/dashboard`;
        const resp = await fetch(url, { signal: abortController.signal });
        if (!resp.ok) throw new Error('Error al cargar dashboard');
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
            sinStock: data.productos?.sinStock || 0 
          },
          clientes: data.clientes?.total || 0,
          categorias: data.categorias?.total || 0,
          usuarios: data.usuarios?.total || 0,
          empresas: data.empresas?.total || 0
        });
        
        lastFetchedCompanyId.current = trackingKey;
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          return;
        }
        console.error('Error loading dashboard stats:', error);
        setStats({
          remitos: { total: 0, byStatus: [] },
          productos: { total: 0, conStock: 0, sinStock: 0 },
          clientes: 0,
          categorias: 0,
          usuarios: 0,
          empresas: 0
        });
      } finally {
        inFlightCompanyId.current = null;
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    debounceTimer.current = setTimeout(() => {
      loadStats();
    }, 50);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current as any);
      abortController.abort();
    };
  }, [currentUser?.companyId, currentUser?.role, selectedCompanyId])

  const lastFetchedCompanyId = useRef<string | null>(null)
  const inFlightCompanyId = useRef<string | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  if (isLoading && stats.remitos.total === 0 && stats.productos.total === 0 && stats.clientes === 0) {
    return (
      <MobileLayout>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Cargando datos...
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <div>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          color: '#111827',
          marginBottom: '1rem'
        }}>
          Tablero de Control
        </h1>
        
        {currentUser?.role === "SUPERADMIN" && empresas?.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
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

        {/* Card de Remitos con gráfico */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="#3b82f6" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                Remitos
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                {stats.remitos.total}
              </span>
              <button
                onClick={() => setRemitosViewMode(remitosViewMode === 'chart' ? 'status' : 'chart')}
                style={{
                  padding: '0.375rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={remitosViewMode === 'chart' ? 'Ver por estado' : 'Ver gráfico'}
              >
                {remitosViewMode === 'chart' ? (
                  <FileText size={16} color="#6b7280" />
                ) : (
                  <BarChart3 size={16} color="#6b7280" />
                )}
              </button>
            </div>
          </div>

          {remitosViewMode === 'chart' && stats.remitos.byDay && stats.remitos.byDay.length > 0 ? (
            <RemitosChart data={stats.remitos.byDay} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.remitos.byStatus
                .filter(s => s.count > 0)
                .map(s => {
                  const statusSlug = (s.name || '').toString().trim().replace(/\s+/g, '_').toUpperCase();
                  return (
                    <Link 
                      key={s.id} 
                      href={`/remitos?status=${statusSlug}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        color: '#111827',
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{s.name}</span>
                      <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#3b82f6' }}>
                        {s.count}
                      </span>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>

        {/* Cards de otras secciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Productos */}
          <Link 
            href="/productos"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              textDecoration: 'none',
              color: '#111827',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={20} color="#10b981" />
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>Productos</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                  {stats.productos.total}
                </span>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#6b7280' }}>
                  <span>Con stock: {stats.productos.conStock}</span>
                  <span>Sin stock: {stats.productos.sinStock}</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Clientes */}
          <Link 
            href="/clientes"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              textDecoration: 'none',
              color: '#111827',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} color="#8b5cf6" />
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>Clientes</span>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>
                {stats.clientes}
              </span>
            </div>
          </Link>

          {/* Categorías (solo ADMIN/SUPERADMIN) */}
          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') && (
            <Link 
              href="/categorias"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                padding: '1rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                textDecoration: 'none',
                color: '#111827',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={20} color="#f97316" />
                  <span style={{ fontSize: '1rem', fontWeight: 600 }}>Categorías</span>
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f97316' }}>
                  {stats.categorias}
                </span>
              </div>
            </Link>
          )}

          {/* Usuarios (solo ADMIN/SUPERADMIN) */}
          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') && (
            <Link 
              href="/usuarios"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                padding: '1rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                textDecoration: 'none',
                color: '#111827',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={20} color="#6366f1" />
                  <span style={{ fontSize: '1rem', fontWeight: 600 }}>Usuarios</span>
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366f1' }}>
                  {stats.usuarios}
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

