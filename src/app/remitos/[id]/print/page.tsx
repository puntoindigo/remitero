"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Remito } from "@/lib/types";

export default function PrintRemito() {
  const params = useParams();
  const [remito, setRemito] = useState<Remito | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemito = async () => {
      console.log('Fetching remito with ID:', params.id);
      try {
        const response = await fetch(`/api/remitos/${params.id}`);
        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Remito data:', data);
          setRemito(data);
        } else {
          console.error('Error response:', response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching remito:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRemito();
    }
  }, [params.id]);

  useEffect(() => {
    if (remito && !loading) {
      // Trigger print after component loads
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [remito, loading]);

  if (loading) {
    return <div className="loading">Cargando remito...</div>;
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

        <div className="print-info-section">
          <div className="print-client-info">
            <h3>CLIENTE:</h3>
            <p><strong>{remito.client.name}</strong></p>
            {remito.client.address && <p>{remito.client.address}</p>}
            {remito.client.phone && <p>Tel: {remito.client.phone}</p>}
          </div>
          <div className="print-number-date">
            <p><strong>N°:</strong> {remito.number}</p>
            <p><strong>Fecha:</strong> {new Date(remito.createdAt).toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        <div className="print-spacer"></div>

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
                  <td className="text-center">{item.quantity}</td>
                  <td>{item.product_name || item.productName}</td>
                  <td className="text-right">${(Number(item.unit_price || item.unitPrice) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="text-right">${(Number(item.line_total || item.lineTotal) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="print-total">
          <p><strong>TOTAL: ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
        </div>

        {remito.notes && (
          <div className="print-notes">
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

        <div className="print-info-section">
          <div className="print-client-info">
            <h3>CLIENTE:</h3>
            <p><strong>{remito.client.name}</strong></p>
            {remito.client.address && <p>{remito.client.address}</p>}
            {remito.client.phone && <p>Tel: {remito.client.phone}</p>}
          </div>
          <div className="print-number-date">
            <p><strong>N°:</strong> {remito.number}</p>
            <p><strong>Fecha:</strong> {new Date(remito.createdAt).toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        <div className="print-spacer"></div>

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
                  <td className="text-center">{item.quantity}</td>
                  <td>{item.product_name || item.productName}</td>
                  <td className="text-right">${(Number(item.unit_price || item.unitPrice) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="text-right">${(Number(item.line_total || item.lineTotal) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="print-total">
          <p><strong>TOTAL: ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
        </div>

        {remito.notes && (
          <div className="print-notes">
            <p><strong>Observaciones:</strong></p>
            <p>{remito.notes}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .print-info-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .print-client-info {
          flex: 1;
        }

        .print-number-date {
          text-align: right;
          flex-shrink: 0;
        }

        .print-spacer {
          height: 20px;
        }

        .text-center {
          text-align: center;
        }

        .text-right {
          text-align: right;
        }

        .print-notes {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
}
