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
  const ENABLE_AUTO_PRINT = false; // Deshabilitar impresión automática para pruebas
  
  // Obtener nombre de empresa: primero del remito, luego del usuario, finalmente valor por defecto
  const companyName = remito?.companyName || (remito as any)?.company?.name || currentUser?.companyName || 'Sistema de Gestión';
  const isFallback = companyName === 'Sistema de Gestión';

  useEffect(() => {
    const fetchRemito = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/remitos/number/${params?.number}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Importante para incluir cookies de sesión
        });
        
        if (response.ok) {
          const data = await response.json();
          setRemito(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('🖨️ [PRINT] Error response:', response.status, errorData);
        }
      } catch (error) {
        console.error("🖨️ [PRINT] Error fetching remito:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params?.number) {
      fetchRemito();
    } else {
      console.error('🖨️ [PRINT] No number provided');
      setLoading(false);
    }
  }, [params?.number]);

  // Impresión automática (deshabilitada)
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

  // Cerrar pestaña después de imprimir (deshabilitado)
  useEffect(() => {
    if (!ENABLE_AUTO_PRINT) return;
    const handleAfterPrint = () => {
      try {
        window.close();
      } catch (err: any) {
        // No se pudo cerrar la ventana automáticamente
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // No hacer nada, solo capturar el evento
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('afterprint', handleAfterPrint);
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('afterprint', handleAfterPrint);
        window.removeEventListener('beforeunload', handleBeforeUnload);
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

  const total = (remito.remitoItems || remito.items || []).reduce((sum, item) => sum + (Number(item.line_total) || 0), 0);
  
  // Crear array de 16 líneas mínimo, completando con líneas vacías si es necesario
  const items = remito.remitoItems || remito.items || [];
  const minLines = 16;
  const paddedItems: any[] = [...items];
  
  // Agregar líneas vacías hasta completar 16 líneas mínimo
  while (paddedItems.length < minLines) {
    paddedItems.push({
      quantity: '',
      product_name: '',
      unit_price: '',
      line_total: ''
    });
  }

  return (
    <>
      <div 
        data-print-wrapper
        className="print-container"
      >
      {/* Original Copy - Left Half */}
      <div className="print-original">
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
                    <p><strong>Fecha:</strong> {new Date(remito.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>
                </div>
              </div>

        <div className="print-info-section" style={{ marginBottom: '20px' }}>
          <div className="print-client-info">
            <p><strong>{remito.client.name}</strong></p>
            {remito.client.address && <p>{remito.client.address}</p>}
            {remito.client.phone && <p>Tel: {remito.client.phone}</p>}
          </div>
        </div>

        <div className="print-spacer" style={{ height: '20px', flexShrink: 0 }}></div>

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
              {paddedItems.map((item, index) => {
                // Si es la última fila y no tiene contenido, mostrar el total
                const isLastRow = index === paddedItems.length - 1;
                const hasContent = item.product_name || item.quantity || item.unit_price || item.line_total;
                
                if (isLastRow && !hasContent) {
                  // Última fila con total usando colspan
                  return (
                    <tr key={index}>
                      <td style={{ textAlign: 'center' }}></td>
                      <td></td>
                      <td colSpan={2} style={{ textAlign: 'right' }}>
                        <div className="print-total-inline">
                          <p><strong>TOTAL: ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
                        </div>
                      </td>
                    </tr>
                  );
                }
                
                return (
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
                );
              })}
              {/* Si todas las filas tienen contenido, agregar fila adicional para el total */}
              {paddedItems.every(item => item.product_name || item.quantity || item.unit_price || item.line_total) && (
                <tr>
                  <td style={{ textAlign: 'center' }}></td>
                  <td></td>
                  <td colSpan={2} style={{ textAlign: 'right' }}>
                    <div className="print-total-inline">
                      <p><strong>TOTAL: ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {remito.notes && (
          <div className="print-notes" style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ccc' }}>
            <p><strong>Observaciones:</strong></p>
            <p>{remito.notes}</p>
          </div>
        )}
      </div>

      {/* Client Copy - Right Half */}
      <div className="print-copy">
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
                    <p><strong>Fecha:</strong> {new Date(remito.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>
                </div>
              </div>

        <div className="print-info-section" style={{ marginBottom: '20px' }}>
          <div className="print-client-info">
            <p><strong>{remito.client.name}</strong></p>
            {remito.client.address && <p>{remito.client.address}</p>}
            {remito.client.phone && <p>Tel: {remito.client.phone}</p>}
          </div>
        </div>

        <div className="print-spacer" style={{ height: '20px', flexShrink: 0 }}></div>

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
              {paddedItems.map((item, index) => {
                // Si es la última fila y no tiene contenido, mostrar el total
                const isLastRow = index === paddedItems.length - 1;
                const hasContent = item.product_name || item.quantity || item.unit_price || item.line_total;
                
                if (isLastRow && !hasContent) {
                  // Última fila con total usando colspan
                  return (
                    <tr key={index}>
                      <td style={{ textAlign: 'center' }}></td>
                      <td></td>
                      <td colSpan={2} style={{ textAlign: 'right' }}>
                        <div className="print-total-inline">
                          <p><strong>TOTAL: ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
                        </div>
                      </td>
                    </tr>
                  );
                }
                
                return (
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
                );
              })}
              {/* Si todas las filas tienen contenido, agregar fila adicional para el total */}
              {paddedItems.every(item => item.product_name || item.quantity || item.unit_price || item.line_total) && (
                <tr>
                  <td style={{ textAlign: 'center' }}></td>
                  <td></td>
                  <td colSpan={2} style={{ textAlign: 'right' }}>
                    <div className="print-total-inline">
                      <p><strong>TOTAL: ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {remito.notes && (
          <div className="print-notes" style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ccc' }}>
            <p><strong>Observaciones:</strong></p>
            <p>{remito.notes}</p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
