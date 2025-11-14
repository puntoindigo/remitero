"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RemitosByDay {
  date: string;
  label: string;
  [key: string]: any; // Para los estados dinámicos
}

interface Estado {
  id: string;
  name: string;
  color: string;
}

interface RemitosChartProps {
  data: RemitosByDay[];
  estados: Estado[];
  total?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
    // Filtrar solo los que tienen valor > 0 y ordenar
    const validEntries = payload
      .filter((entry: any) => entry.value > 0)
      .sort((a: any, b: any) => {
        // Ordenar: pendientes primero, entregados último
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        const isPendienteA = nameA.includes('pendiente') || nameA.includes('en espera') || nameA.includes('sin entregar');
        const isPendienteB = nameB.includes('pendiente') || nameB.includes('en espera') || nameB.includes('sin entregar');
        const isEntregadoA = nameA.includes('entregado') || nameA.includes('completado') || nameA.includes('finalizado');
        const isEntregadoB = nameB.includes('entregado') || nameB.includes('completado') || nameB.includes('finalizado');
        
        if (isPendienteA && !isPendienteB) return -1;
        if (!isPendienteA && isPendienteB) return 1;
        if (isEntregadoA && !isEntregadoB) return 1;
        if (!isEntregadoA && isEntregadoB) return -1;
        return 0;
      });
    
    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        padding: '0.75rem',
        fontSize: '0.75rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
          {label}
        </p>
        {validEntries.map((entry: any, index: number) => {
          return (
            <p key={index} style={{ margin: '0.25rem 0', color: '#6b7280' }}>
              <span style={{ 
                display: 'inline-block', 
                width: '12px', 
                height: '12px', 
                backgroundColor: entry.fill || entry.color, 
                marginRight: '0.5rem',
                borderRadius: '2px'
              }}></span>
              {entry.name || entry.dataKey}: <strong style={{ color: entry.fill || entry.color }}>{entry.value}</strong>
            </p>
          );
        })}
        <p style={{ margin: '0.5rem 0 0 0', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb', fontWeight: 600, color: '#111827' }}>
          Total: {total}
        </p>
      </div>
    );
  }
  return null;
};

export function RemitosChart({ data, estados, total }: RemitosChartProps) {
  if (!data || data.length === 0 || !estados || estados.length === 0) {
    return (
      <div style={{ 
        width: '100%',
        height: '200px', 
        minHeight: '200px',
        minWidth: '100%',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#6b7280',
        fontSize: '0.875rem'
      }}>
        No hay datos para mostrar
      </div>
    );
  }

  // Ordenar estados: pendientes primero (abajo), entregados último (arriba)
  const sortedEstados = [...estados].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    const isPendienteA = nameA.includes('pendiente') || nameA.includes('en espera') || nameA.includes('sin entregar');
    const isPendienteB = nameB.includes('pendiente') || nameB.includes('en espera') || nameB.includes('sin entregar');
    const isEntregadoA = nameA.includes('entregado') || nameA.includes('completado') || nameA.includes('finalizado');
    const isEntregadoB = nameB.includes('entregado') || nameB.includes('completado') || nameB.includes('finalizado');
    
    if (isPendienteA && !isPendienteB) return -1;
    if (!isPendienteA && isPendienteB) return 1;
    if (isEntregadoA && !isEntregadoB) return 1;
    if (!isEntregadoA && isEntregadoB) return -1;
    return 0;
  });

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%', height: '200px', minHeight: '200px', minWidth: '100%' }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={0}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              interval={Math.floor(data.length / 10)} // Mostrar aproximadamente 10 etiquetas
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {sortedEstados.map((estado) => (
              <Bar 
                key={estado.id}
                dataKey={estado.id} 
                stackId="remitos"
                fill={estado.color || '#3b82f6'}
                name={estado.name}
                radius={estado === sortedEstados[sortedEstados.length - 1] ? [4, 4, 0, 0] : [0, 0, 0, 0]} // Solo el último tiene bordes redondeados arriba
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {total !== undefined && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <span style={{ 
            fontSize: '1rem', 
            fontWeight: 600, 
            color: '#111827' 
          }}>
            Total: {total}
          </span>
        </div>
      )}
    </div>
  );
}

