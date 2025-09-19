import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import Header from "@/components/layout/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sistema de Remitos",
  description: "Sistema de gestión de remitos con multi-empresa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthSessionProvider>
          <Header />
          <div className="container">
            <Providers>{children}</Providers>
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}