'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { 
  Package, 
  FileText, 
  Users, 
  Tag,
  Box,
  MessageSquare
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
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <header className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-white rounded">
              <Box className="h-5 w-5 text-black" />
            </div>
            <h1 className="text-lg font-semibold">Sistema de Gestión</h1>
          </div>
          <nav className="flex space-x-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 flex items-center space-x-2',
                    activeTab === tab.id 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="flex items-center space-x-3">
            <span className="px-2 py-1 bg-gray-800 text-xs font-medium rounded text-gray-300">
              BETA
            </span>
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
