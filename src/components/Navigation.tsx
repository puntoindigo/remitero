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
    <header className="glass-effect shadow-2xl border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Box className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Sistema de Gestión</h1>
              <p className="text-gray-600 text-sm">Productos y Remitos</p>
            </div>
          </div>
          <nav className="flex space-x-2 bg-white/10 rounded-2xl p-2 backdrop-blur-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 relative overflow-hidden',
                    activeTab === tab.id 
                      ? 'bg-white text-gray-900 shadow-lg transform scale-105' 
                      : 'text-white hover:bg-white/20 hover:text-white hover:scale-105'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
