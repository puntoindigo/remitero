"use client";

import React from 'react';

interface LoadingTableProps {
  isLoading: boolean;
  columns: number;
  rows?: number;
  children?: React.ReactNode;
  className?: string;
}

export function LoadingTable({
  isLoading,
  columns,
  rows = 5,
  children,
  className = ''
}: LoadingTableProps) {
  if (isLoading) {
    return (
      <div className={`overflow-hidden border border-gray-200 rounded-lg ${className}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return <>{children || null}</>;
}
