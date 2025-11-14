"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RemitosByStatus {
  name: string;
  count: number;
  color: string;
  id: string;
}

interface RemitosChartProps {
  data: RemitosByStatus[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        padding: '0.5rem',
        fontSize: '0.75rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
          {data.name}
        </p>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Cantidad: <strong style={{ color: data.color }}>{data.count}</strong>
        </p>
      </div>
    );
  }
  return null;
};

export function RemitosChart({ data }: RemitosChartProps) {
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
    <div style={{ width: '100%', height: '200px', minHeight: '200px', minWidth: '100%' }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={0}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fill: '#6b7280' }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#6b7280' }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            radius={[4, 4, 0, 0]}
            shape={(props: any) => {
              const { payload, ...rest } = props;
              return <rect {...rest} fill={payload.color} />;
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

