"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Activity } from "lucide-react";
import { getActionDescription, type ActivityLog } from "@/lib/user-activity-types";

interface UserActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export function UserActivityLogModal({
  isOpen,
  onClose,
  userId,
  userName
}: UserActivityLogModalProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  useEffect(() => {
    if (isOpen && userId) {
      // Resetear estado cuando se abre el modal
      setLogs([]);
      setPage(0);
      setHasMore(true);
      setLoading(true);
      fetchLogs(0);
    } else if (!isOpen) {
      // Limpiar logs cuando se cierra el modal
      setLogs([]);
      setPage(0);
      setHasMore(true);
    }
  }, [isOpen, userId]);

  const fetchLogs = async (pageNum: number) => {
    if (!userId) {
      console.error('❌ [UserActivityLogModal] No userId provided');
      setLoading(false);
      return;
    }
    
    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const trimmedUserId = userId.trim();
    if (!uuidRegex.test(trimmedUserId)) {
      console.error('❌ [UserActivityLogModal] Invalid userId format:', {
        userId,
        trimmedUserId,
        userIdType: typeof userId,
        userIdLength: userId.length
      });
      setLoading(false);
      if (pageNum === 0) {
        setLogs([]);
      }
      return;
    }
    
    setLoading(true);
    console.log('🔍 [UserActivityLogModal] Fetching logs:', { 
      userId, 
      trimmedUserId,
      userIdType: typeof userId,
      userIdLength: userId.length,
      pageNum, 
      pageSize 
    });
    
    try {
      const url = `/api/users/${trimmedUserId}/activity-logs?page=${pageNum}&limit=${pageSize}`;
      console.log('🔍 [UserActivityLogModal] Fetch URL:', url);
      
      const response = await fetch(url);
      
      console.log('🔍 [UserActivityLogModal] Response status:', response.status, response.statusText);
      console.log('🔍 [UserActivityLogModal] Response headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [UserActivityLogModal] Error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          userId,
          trimmedUserId,
          url
        });
        // Si hay un error, establecer logs vacío para mostrar el mensaje de "No hay actividad"
        if (pageNum === 0) {
          setLogs([]);
        }
        return;
      }
      
      const data = await response.json();
      console.log('✅ [UserActivityLogModal] Activity logs response:', { 
        userId, 
        trimmedUserId,
        pageNum, 
        fullResponse: data,
        hasLogs: !!data.logs,
        logsCount: data.logs?.length || 0,
        logsType: Array.isArray(data.logs) ? 'array' : typeof data.logs,
        isArray: Array.isArray(data.logs),
        logs: data.logs?.slice(0, 3).map((l: any) => ({ 
          id: l.id, 
          user_id: l.user_id,
          action: l.action, 
          description: l.description,
          created_at: l.created_at 
        })) || [],
        firstLog: data.logs?.[0] || null
      });
      
      // Asegurarse de que data.logs sea un array
      const logsArray = Array.isArray(data.logs) ? data.logs : [];
      
      if (pageNum === 0) {
        setLogs(logsArray);
      } else {
        setLogs(prev => [...prev, ...logsArray]);
      }
      setHasMore(logsArray.length === pageSize);
    } catch (error) {
      console.error('❌ [UserActivityLogModal] Exception fetching logs:', error);
      // Si hay un error de red, establecer logs vacío
      if (pageNum === 0) {
        setLogs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(nextPage);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (typeof window === 'undefined') return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        // Cerrar al hacer click en el overlay (no en el modal)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 10001,
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>
              Log de Actividad
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              {userName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div style={{ padding: '0.75rem' }}>
          {loading && logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Cargando actividad...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <Activity className="h-12 w-12" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ marginBottom: '0.5rem' }}>No hay actividad registrada</p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                Las actividades se registran cuando realizas acciones como login, crear remitos, actualizar perfil, etc.
              </p>
            </div>
          ) : (
            <>
              {/* Encabezado de tabla */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderBottom: '2px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <div>Fecha y Hora</div>
                <div>Actividad</div>
              </div>
              
              {/* Cuerpo de tabla */}
              <div style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
                {logs.map((log, index) => (
                  <div
                    key={log.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '180px 1fr',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                      borderBottom: '1px solid #f3f4f6',
                      fontSize: '0.875rem',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f9fafb';
                    }}
                  >
                    <div style={{ 
                      color: '#6b7280',
                      fontSize: '0.8125rem',
                      fontFamily: 'monospace',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatDate(log.created_at)}
                    </div>
                    <div style={{ 
                      color: '#111827',
                      fontWeight: 400
                    }}>
                      {log.description || getActionDescription(log.action, log.metadata as any)}
                    </div>
                  </div>
                ))}
              </div>
              
              {hasMore && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #e5e7eb',
                  textAlign: 'center' 
                }}>
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    {loading ? 'Cargando...' : 'Cargar más'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

