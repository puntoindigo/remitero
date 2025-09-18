'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { 
  Package, 
  FileText, 
  Users, 
  Tag,
  Box
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'categorias', label: 'Categorías', icon: Tag },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'remitos', label: 'Remitos', icon: FileText },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <header className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Box className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Sistema de Gestión</h1>
              <p className="text-sm text-gray-300">Productos y Remitos</p>
            </div>
          </div>
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2',
                    activeTab === tab.id 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="flex items-center space-x-4">
            <span className="px-2 py-1 bg-gray-700 text-xs font-medium rounded text-gray-300">
              BETA
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
