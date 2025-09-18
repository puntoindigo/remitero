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
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Box className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Sistema de Gestión de Productos y Remitos</h1>
          </div>
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2',
                    activeTab === tab.id 
                      ? 'bg-white text-gray-900 shadow-md' 
                      : 'text-white hover:bg-white hover:bg-opacity-20 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
