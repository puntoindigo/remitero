"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Remito } from "@/lib/types";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import "./print.css";

export default function PrintRemito() {
  const params = useParams();
  const [remito, setRemito] = useState<Remito | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Auto-print cuando carga la página
  useEffect(() => {
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
  }, [remito, loading]);

  // Cerrar pestaña después de imprimir
  useEffect(() => {
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
  }, [remito, loading]);

  if (loading) {
    return <LoadingSpinner message="Cargando remito..." />;
  }

  if (!remito) {
    return <div className="error">Remito no encontrado</div>;
  }

  const total = (remito.remitoItems || remito.items || []).reduce((sum, item) => sum + (Number(item.line_total || item.lineTotal) || 0), 0);

  return (
    <div className="print-container">
      {/* Original Copy - Left Half */}
      <div className="print-original">
        <div className="print-header">
          <h1>DISTRIBUIDORA RUBEN</h1>
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
            <p><strong>N°:</strong> {remito.number}</p>
            <p><strong>Fecha:</strong> {new Date(remito.createdAt).toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        <div className="print-spacer" style={{ height: '20px' }}></div>

        <div className="print-items">
          <table className="print-table">
            <thead>
              <tr>
                <th>Cant.</th>
                <th>Descripción</th>
                <th>Precio Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(remito.remitoItems || remito.items || []).map((item, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td>{item.product_name || item.productName}</td>
                  <td style={{ textAlign: 'right' }}>${(Number(item.unit_price || item.unitPrice) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right' }}>${(Number(item.line_total || item.lineTotal) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="print-total">
          <p><strong>TOTAL: ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
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
          <h1>DISTRIBUIDORA RUBEN</h1>
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
            <p><strong>N°:</strong> {remito.number}</p>
            <p><strong>Fecha:</strong> {new Date(remito.createdAt).toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        <div className="print-spacer" style={{ height: '20px' }}></div>

        <div className="print-items">
          <table className="print-table">
            <thead>
              <tr>
                <th>Cant.</th>
                <th>Descripción</th>
                <th>Precio Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(remito.remitoItems || remito.items || []).map((item, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td>{item.product_name || item.productName}</td>
                  <td style={{ textAlign: 'right' }}>${(Number(item.unit_price || item.unitPrice) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right' }}>${(Number(item.line_total || item.lineTotal) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="print-total">
          <p><strong>TOTAL: ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
        </div>

        {remito.notes && (
          <div className="print-notes" style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ccc' }}>
            <p><strong>Observaciones:</strong></p>
            <p>{remito.notes}</p>
          </div>
        )}
      </div>

    </div>
  );
}
