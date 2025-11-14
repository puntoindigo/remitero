import type { Metadata } from "next";
import "../globals.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remitero - Sistema de Gestión de Remitos",
  description: "Administra tu negocio desde cualquier lugar. Sistema completo de gestión de remitos con control de stock, clientes y reportes en tiempo real.",
};

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}

