import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import EnvironmentBannerWrapper from "@/components/common/EnvironmentBannerWrapper";
import ErrorBoundary from "@/components/common/ErrorBoundary";

export const metadata: Metadata = {
  title: "Sistema de Remitos",
  description: "Sistema de gestión de remitos con multi-empresa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ErrorBoundary>
          <AuthSessionProvider>
            {/* <EnvironmentBannerWrapper /> */}
            <AuthenticatedLayout>
              <Providers>{children}</Providers>
            </AuthenticatedLayout>
          </AuthSessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}