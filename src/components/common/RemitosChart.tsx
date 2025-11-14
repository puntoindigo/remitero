"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RemitosByDay {
  date: string;
  count: number;
  label: string;
}

interface RemitosChartProps {
  data: RemitosByDay[];
  total?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value || 0;
    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        padding: '0.75rem',
        fontSize: '0.75rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
          {label}
        </p>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Cantidad: <strong style={{ color: '#3b82f6' }}>{value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

export function RemitosChart({ data, total }: RemitosChartProps) {
  if (!data || data.length === 0) {
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
            <Bar 
              dataKey="count" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
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

