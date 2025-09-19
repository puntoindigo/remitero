import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import AuthSessionProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Sistema de Remitos",
  description: "Sistema de gestión de remitos con multi-empresa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthSessionProvider>
          <Providers>{children}</Providers>
        </AuthSessionProvider>
      </body>
    </html>
  );
}