"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { DBShape, Categoria, Producto, Cliente, Remito, RemitoItem } from "./types";

const LS_KEY = "gestion-db-v1";

function uid(prefix = ""): string {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-6)}`;
}

const defaultDB: DBShape = {
  categorias: [],
  productos: [],
  clientes: [],
  remitos: [],
  counters: { remito: 0 },
};

function loadDB(): DBShape {
  if (typeof window === "undefined") return defaultDB;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as DBShape) : defaultDB;
  } catch {
    return defaultDB;
  }
}

function saveDB(db: DBShape) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(db));
}

interface Ctx {
  db: DBShape;
  addCategoria: (nombre: string, descripcion?: string) => void;
  addProducto: (p: Omit<Producto, "id" | "createdAt">) => void;
  addCliente: (nombre: string) => void;
  deleteCategoria: (id: string) => void;
  deleteProducto: (id: string) => void;
  deleteCliente: (id: string) => void;
  addRemito: (draft: {
    fecha: string;
    clienteId: string;
    clienteNombre: string;
    items: RemitoItem[];
    observaciones?: string;
    total: number;
  }) => Remito;
}

const DBContext = createContext<Ctx | null>(null);

export function DBProvider({ children }: { children: React.ReactNode }) {
  const [db, setDB] = useState<DBShape>(loadDB);

  useEffect(() => {
    saveDB(db);
  }, [db]);

  const api: Ctx = useMemo(
    () => ({
      db,
      addCategoria: (nombre, descripcion) =>
        setDB((s) => ({
          ...s,
          categorias: [...s.categorias, { id: uid("cat_"), nombre, descripcion, createdAt: new Date().toISOString() }],
        })),
      addProducto: (p) =>
        setDB((s) => ({
          ...s,
          productos: [...s.productos, { ...p, id: uid("prod_"), createdAt: new Date().toISOString() }],
        })),
      addCliente: (nombre) =>
        setDB((s) => ({
          ...s,
          clientes: [...s.clientes, { id: uid("cli_"), nombre, createdAt: new Date().toISOString() }],
        })),
      deleteCategoria: (id) =>
        setDB((s) => ({ ...s, categorias: s.categorias.filter((c) => c.id !== id) })),
      deleteProducto: (id) =>
        setDB((s) => ({ ...s, productos: s.productos.filter((p) => p.id !== id) })),
      deleteCliente: (id) =>
        setDB((s) => ({ ...s, clientes: s.clientes.filter((c) => c.id !== id) })),
      addRemito: (draft) => {
        const numero = `REM-${String(db.counters.remito + 1).padStart(4, "0")}`;
        const nuevo: Remito = {
          id: uid("rem_"),
          numero,
          fecha: draft.fecha,
          clienteId: draft.clienteId,
          clienteNombre: draft.clienteNombre,
          items: draft.items,
          observaciones: draft.observaciones,
          total: draft.total,
          createdAt: new Date().toISOString(),
        };
        setDB((s) => ({
          ...s,
          counters: { ...s.counters, remito: s.counters.remito + 1 },
          remitos: [nuevo, ...s.remitos],
        }));
        return nuevo;
      },
    }),
    [db]
  );

  return <DBContext.Provider value={api}>{children}</DBContext.Provider>;
}

export function useDB(): Ctx {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error("useDB debe usarse dentro de <DBProvider>");
  return ctx;
}
