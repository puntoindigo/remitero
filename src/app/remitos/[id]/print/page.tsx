"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Remito } from "@/lib/types";
import { useCurrentUserSimple } from "@/hooks/useCurrentUserSimple";
import "./print.css";

export default function PrintRemito() {
  const params = useParams();
  const searchParams = useSearchParams();
  const currentUser = useCurrentUserSimple();
  const [remito, setRemito] = useState<Remito | null>(null);
  const [loading, setLoading] = useState(true);
  // Solo imprimir automáticamente si NO viene del modal (no tiene ?noAutoPrint=true)
  const noAutoPrint = searchParams?.get('noAutoPrint') === 'true';
  const ENABLE_AUTO_PRINT = !noAutoPrint; // Deshabilitar si viene del modal
  
  // Obtener nombre de empresa: primero del remito (company del remito), luego valor por defecto
  // Ya no usar companyName del usuario, solo del remito
  const companyName = (remito as any)?.company?.name || remito?.companyName || 'Sistema de Gestión';
  const isFallback = companyName === 'Sistema de Gestión';

  useEffect(() => {
    const fetchRemito = async () => {
      setLoading(true);
      
      try {
        const remitoId = params?.id;
        if (!remitoId) {
          console.error('🖨️ [PRINT] No ID provided');
          setLoading(false);
          return;
        }

        // Usar la API por ID que es única globalmente
        const url = `/api/remitos/${remitoId}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Print-Request': 'true', // Header personalizado para identificar peticiones de impresión
          },
          credentials: 'include', // Importante para incluir cookies de sesión
        });
        
        if (response.ok) {
          const data = await response.json();
          setRemito(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('🖨️ [PRINT] Error response:', response.status, errorData);
          // Mostrar error al usuario
          if (response.status === 404) {
            console.error('🖨️ [PRINT] Remito no encontrado con ID:', remitoId);
          }
        }
      } catch (error) {
        console.error("🖨️ [PRINT] Error fetching remito:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchRemito();
    } else {
      console.error('🖨️ [PRINT] No ID provided');
      setLoading(false);
    }
  }, [params?.id]);

  // Impresión automática
  useEffect(() => {
    if (!ENABLE_AUTO_PRINT) return;
    if (remito && !loading && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch (err: any) {
          console.error('Error al abrir diálogo de impresión:', err?.message || String(err));
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [remito, loading, ENABLE_AUTO_PRINT]);

  // Cerrar pestaña después de imprimir
  useEffect(() => {
    if (!ENABLE_AUTO_PRINT) return;
    const handleAfterPrint = () => {
      try {
        // Esperar un poco antes de cerrar para asegurar que la impresión se completó
        setTimeout(() => {
          window.close();
        }, 500);
      } catch (err: any) {
        // No se pudo cerrar la ventana automáticamente
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('afterprint', handleAfterPrint);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('afterprint', handleAfterPrint);
      }
    };
  }, [remito, loading, ENABLE_AUTO_PRINT]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        margin: 0,
        padding: 0,
        background: 'white'
      }}>
        <p>Cargando remito...</p>
      </div>
    );
  }

  if (!remito) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        margin: 0,
        padding: 0,
        background: 'white'
      }}>
        <p>Remito no encontrado</p>
      </div>
    );
  }

  // Calcular total: usar el total del remito (ya incluye shipping_cost, previous_balance y account_payment)
  // o calcularlo si no está disponible
  const productsTotal = (remito.remitoItems || remito.items || []).reduce((sum, item) => sum + (Number(item.line_total) || 0), 0);
  const shippingCost = (remito as any)?.shippingCost || (remito as any)?.shipping_cost || 0;
  const previousBalance = (remito as any)?.previousBalance || (remito as any)?.previous_balance || 0;
  const accountPayment = (remito as any)?.accountPayment || (remito as any)?.account_payment || 0;
  const total = remito.total || (productsTotal + previousBalance + shippingCost - accountPayment);
  
  // Dividir items en páginas de máximo 17 líneas
  const items = remito.remitoItems || remito.items || [];
  const maxLinesPerPage = 17;
  const totalPages = Math.max(1, Math.ceil(items.length / maxLinesPerPage));
  
  // Función para dividir items en páginas
  const getItemsForPage = (pageNumber: number) => {
    const startIndex = (pageNumber - 1) * maxLinesPerPage;
    const endIndex = startIndex + maxLinesPerPage;
    return items.slice(startIndex, endIndex);
  };
  
  // Función para renderizar una página completa
  const renderPage = (pageNumber: number, pageItems: any[], isLastPage: boolean, copyType: 'original' | 'copy') => {
    const isFirstPage = pageNumber === 1;
    const className = copyType === 'original' ? 'print-original' : 'print-copy';
    
    return (
      <div key={`${copyType}-page-${pageNumber}`} className={className}>
        <div className="print-header">
          <div className="print-header-top">
            <h1 data-is-fallback={isFallback ? "true" : undefined}>{companyName}</h1>
            <div className="print-remito-number">
              <strong>N°: {remito.number}</strong>
            </div>
          </div>
          <div className="print-header-bottom">
            <h2>REMITO DE ENTREGA</h2>
            <div className="print-date-inline">
              <p>
                <strong>Fecha:</strong> {new Date(remito.createdAt).toLocaleDateString('es-AR')}
                {totalPages > 1 && (
                  <span style={{ marginLeft: '8px' }}>| Página {pageNumber} de {totalPages}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Solo mostrar info del cliente en la primera página */}
        {isFirstPage && (
          <div className="print-info-section" style={{ marginBottom: '20px' }}>
            <div className="print-client-info">
              <p><strong>{remito.client.name}</strong></p>
              {remito.client.address && <p>{remito.client.address}</p>}
              {remito.client.phone && <p>Tel: {remito.client.phone}</p>}
            </div>
          </div>
        )}

        {!isFirstPage && (
          <div className="print-spacer" style={{ height: '20px', flexShrink: 0 }}></div>
        )}

        <div className="print-items">
          <table className="print-table">
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '50%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Cant.</th>
                <th>Descripción</th>
                <th>Precio Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td>{item.product_name}</td>
                  <td style={{ textAlign: 'right' }}>
                    {item.unit_price ? `$${(Number(item.unit_price) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {item.line_total ? `$${(Number(item.line_total) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
                  </td>
                </tr>
              ))}
              {/* Mostrar subtotales y total solo en la última página */}
              {isLastPage && (
                <>
                  {/* Subtotal de productos */}
                  <tr>
                    <td style={{ textAlign: 'center' }}></td>
                    <td></td>
                    <td style={{ textAlign: 'right', paddingTop: '8px' }}>
                      <strong>Subtotal:</strong>
                    </td>
                    <td style={{ textAlign: 'right', paddingTop: '8px' }}>
                      <strong>${productsTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </td>
                  </tr>
                  
                  {/* Saldo Anterior */}
                  {previousBalance > 0 && (
                    <tr>
                      <td style={{ textAlign: 'center' }}></td>
                      <td colSpan={2} style={{ textAlign: 'right' }}>
                        Saldo Anterior:
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        ${previousBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  
                  {/* Costo de Envío */}
                  {shippingCost > 0 && (
                    <tr>
                      <td style={{ textAlign: 'center' }}></td>
                      <td colSpan={2} style={{ textAlign: 'right' }}>
                        Costo de Envío:
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        ${shippingCost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  
                  {/* Pago a cuenta */}
                  {accountPayment > 0 && (
                    <tr>
                      <td style={{ textAlign: 'center' }}></td>
                      <td colSpan={2} style={{ textAlign: 'right' }}>
                        Pago a cuenta:
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        -${accountPayment.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  
                  {/* Total */}
                  <tr>
                    <td style={{ textAlign: 'center' }}></td>
                    <td></td>
                    <td colSpan={2} style={{ textAlign: 'right', paddingTop: '8px', borderTop: '1px solid #ccc' }}>
                      <div className="print-total-inline">
                        <p><strong>TOTAL: ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
                      </div>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Mostrar notas solo en la última página */}
        {isLastPage && remito.notes && (
          <div className="print-notes" style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ccc' }}>
            <p><strong>Observaciones:</strong></p>
            <p>{remito.notes}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Renderizar cada página física con ambas copias lado a lado */}
      {Array.from({ length: totalPages }, (_, i) => {
        const pageNumber = i + 1;
        const pageItems = getItemsForPage(pageNumber);
        const isLastPage = pageNumber === totalPages;
        
        return (
          <div 
            key={`page-${pageNumber}`}
            data-print-wrapper
            className="print-container"
            style={{ pageBreakAfter: isLastPage ? 'auto' : 'always' }}
          >
            {/* Copia original (izquierda) */}
            {renderPage(pageNumber, pageItems, isLastPage, 'original')}
            
            {/* Copia del cliente (derecha) */}
            {renderPage(pageNumber, pageItems, isLastPage, 'copy')}
          </div>
        );
      })}
    </>
  );
}
