"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Remito } from "@/lib/types";
import "./print.css";

export default function PrintRemito() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [remito, setRemito] = useState<Remito | null>(null);
  const [loading, setLoading] = useState(true);
  const ENABLE_AUTO_PRINT = false; // Deshabilitar impresión automática para pruebas

  useEffect(() => {
    const fetchRemito = async () => {
      console.log('🖨️ [PRINT] Fetching remito with ID:', params?.id);
      setLoading(true);
      
      try {
        const response = await fetch(`/api/remitos/${params?.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Importante para incluir cookies de sesión
        });
        
        console.log('🖨️ [PRINT] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🖨️ [PRINT] Remito data received:', data);
          setRemito(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('🖨️ [PRINT] Error response:', response.status, errorData);
        }
      } catch (error) {
        console.error("🖨️ [PRINT] Error fetching remito:", error);
      } finally {
        console.log('🖨️ [PRINT] Loading complete');
        setLoading(false);
      }
    };

    if (params?.id) {
      console.log('🖨️ [PRINT] Starting fetch for ID:', params.id);
      fetchRemito();
    } else {
      console.error('🖨️ [PRINT] No ID provided');
      setLoading(false);
    }
  }, [params?.id]);

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
        console.log('No se pudo cerrar la ventana automáticamente:', err?.message || String(err));
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
  
  // Crear array de 8 líneas mínimo, completando con líneas vacías si es necesario
  const items = remito.remitoItems || remito.items || [];
  const minLines = 8;
  const paddedItems: any[] = [...items];
  
  // Agregar líneas vacías hasta completar 8 líneas mínimo
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
      {/* Acción: descargar como PDF (oculto cuando ?pdf=1) */}
      {searchParams?.get('pdf') !== '1' && (
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, printColorAdjust: 'exact' }}>
          <a
            href={`/api/remitos/${remito.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 12,
              background: '#111',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: 6,
              textDecoration: 'none',
            }}
          >
            Descargar PDF
          </a>
        </div>
      )}
      {/* Original Copy - Left Half */}
      <div className="print-original">
              <div className="print-header">
                <div className="print-header-top">
                  <h1>DISTRIBUIDORA RUBEN</h1>
                  <div className="print-remito-number">
                    <strong>N°: {remito.number}</strong>
                  </div>
                </div>
                <h2>REMITO DE ENTREGA</h2>
              </div>

        <div className="print-info-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div className="print-client-info" style={{ flex: 1 }}>
            <h3>CLIENTE:</h3>
            <p><strong>{remito.client.name}</strong></p>
            {remito.client.address && <p>{remito.client.address}</p>}
            {remito.client.phone && <p>Tel: {remito.client.phone}</p>}
          </div>
          <div className="print-number-date" style={{ textAlign: 'right', flexShrink: 0 }}>
            <p><strong>Fecha:</strong> {new Date(remito.createdAt).toLocaleDateString('es-AR')}</p>
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
              {paddedItems.map((item, index) => (
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
            </tbody>
          </table>
        </div>

        <div className="print-total">
          <div className="total-content">
            <p><strong>TOTAL: ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
          </div>
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
                  <h1>DISTRIBUIDORA RUBEN</h1>
                  <div className="print-remito-number">
                    <strong>N°: {remito.number}</strong>
                  </div>
                </div>
                <h2>REMITO DE ENTREGA</h2>
              </div>

        <div className="print-info-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div className="print-client-info" style={{ flex: 1 }}>
            <h3>CLIENTE:</h3>
            <p><strong>{remito.client.name}</strong></p>
            {remito.client.address && <p>{remito.client.address}</p>}
            {remito.client.phone && <p>Tel: {remito.client.phone}</p>}
          </div>
          <div className="print-number-date" style={{ textAlign: 'right', flexShrink: 0 }}>
            <p><strong>Fecha:</strong> {new Date(remito.createdAt).toLocaleDateString('es-AR')}</p>
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
              {paddedItems.map((item, index) => (
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
            </tbody>
          </table>
        </div>

        <div className="print-total">
          <div className="total-content">
            <p><strong>TOTAL: ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
          </div>
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
