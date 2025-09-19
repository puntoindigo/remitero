import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Sistema de Gestión",
  description: "Remitos, productos, clientes y categorías",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="container">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}