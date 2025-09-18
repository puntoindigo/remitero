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
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Box className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Sistema de Gestión</h1>
          </div>
          <nav className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'text-white hover:text-gray-900',
                    activeTab === tab.id && 'bg-white text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
