"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface RemitosByDay {
  date: string;
  count: number;
  label: string;
}

interface RemitosChartProps {
  data: RemitosByDay[];
}

export function RemitosChart({ data }: RemitosChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

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
    <div style={{ width: '100%', height: '200px', minHeight: '200px', minWidth: '100%', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: '0.5rem', 
        right: '0.5rem', 
        zIndex: 10,
        display: 'flex',
        gap: '0.25rem'
      }}>
        <button
          onClick={() => setChartType('bar')}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.25rem',
            background: chartType === 'bar' ? '#3b82f6' : '#fff',
            color: chartType === 'bar' ? '#fff' : '#6b7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
          title="Gráfico de barras"
        >
          <BarChart3 className="h-3 w-3" />
        </button>
        <button
          onClick={() => setChartType('line')}
          style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.25rem',
            background: chartType === 'line' ? '#3b82f6' : '#fff',
            color: chartType === 'line' ? '#fff' : '#6b7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
          title="Gráfico de líneas"
        >
          <TrendingUp className="h-3 w-3" />
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={0}>
        {chartType === 'bar' ? (
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.75rem'
              }}
              labelStyle={{ color: '#111827', fontWeight: 600 }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.75rem'
              }}
              labelStyle={{ color: '#111827', fontWeight: 600 }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

