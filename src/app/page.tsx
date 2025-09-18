'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { CategoriasSection } from '@/components/CategoriasSection';
import { ClientesSection } from '@/components/ClientesSection';
import { ProductosSection } from '@/components/ProductosSection';
import { RemitosSection } from '@/components/RemitosSection';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function Home() {
  const [activeTab, setActiveTab] = useState('categorias');
  const {
    data,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    addCliente,
    updateCliente,
    deleteCliente,
    addProducto,
    updateProducto,
    deleteProducto,
    addRemito,
    updateRemito,
    deleteRemito
  } = useLocalStorage();

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'categorias':
        return (
          <CategoriasSection
            categorias={data.categorias}
            onAdd={addCategoria}
            onUpdate={updateCategoria}
            onDelete={deleteCategoria}
          />
        );
      case 'clientes':
        return (
          <ClientesSection
            clientes={data.clientes}
            onAdd={addCliente}
            onUpdate={updateCliente}
            onDelete={deleteCliente}
          />
        );
      case 'productos':
        return (
          <ProductosSection
            productos={data.productos}
            categorias={data.categorias}
            onAdd={addProducto}
            onUpdate={updateProducto}
            onDelete={deleteProducto}
          />
        );
      case 'remitos':
        return (
          <RemitosSection
            remitos={data.remitos}
            clientes={data.clientes}
            productos={data.productos}
            contadorRemitos={data.contadorRemitos}
            onAdd={addRemito}
            onUpdate={updateRemito}
            onDelete={deleteRemito}
            onAddCliente={addCliente}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="glass-effect rounded-3xl shadow-2xl p-8 card-hover">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
}