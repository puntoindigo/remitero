import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import EnvironmentBannerWrapper from "@/components/common/EnvironmentBannerWrapper";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { ColorThemeProvider } from "@/contexts/ColorThemeContext";
import { AppPreloader } from "@/components/common/AppPreloader";
import { ErrorHandlerScript } from "@/components/common/ErrorHandlerScript";

export const metadata: Metadata = {
  title: "Sistema de Remitos",
  description: "Sistema de gestión de remitos con multi-empresa",
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <ErrorHandlerScript />
        <ErrorBoundary>
          <ColorThemeProvider>
            <AppPreloader />
            <AuthSessionProvider>
              <QueryProvider>
                {/* <EnvironmentBannerWrapper /> */}
                <AuthenticatedLayout>
                  <Providers>{children}</Providers>
                </AuthenticatedLayout>
              </QueryProvider>
            </AuthSessionProvider>
          </ColorThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}