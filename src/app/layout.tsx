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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Capturar errores de Event antes de que React monte
              (function() {
                if (typeof window === 'undefined') return;
                
                function shouldIgnoreError(error) {
                  if (!error) return true;
                  
                  if (error instanceof Event) {
                    const eventTarget = error.target;
                    if (eventTarget && (
                      eventTarget.tagName === 'LINK' || 
                      eventTarget.tagName === 'IMG' || 
                      eventTarget.tagName === 'SCRIPT' ||
                      eventTarget.tagName === 'STYLE'
                    )) {
                      return true;
                    }
                    return true; // Ignorar todos los Events
                  }
                  if (error instanceof Error) {
                    const msg = error.message || '';
                    if (msg.includes('Failed to fetch') || 
                        msg.includes('NetworkError') ||
                        msg.includes('Load failed') ||
                        msg.includes('Network request failed') ||
                        msg.includes('navegó') ||
                        msg.includes('Unexpected identifier') ||
                        msg.includes('Minified React error')) {
                      return true;
                    }
                  }
                  if (error && typeof error.toString === 'function' && error.toString().includes('[object Event]')) {
                    return true;
                  }
                  return false;
                }
                
                try {
                  window.addEventListener('unhandledrejection', function(event) {
                    if (shouldIgnoreError(event.reason)) {
                      event.preventDefault();
                      event.stopPropagation();
                      event.stopImmediatePropagation();
                    }
                  }, { capture: true, passive: false });
                  
                  window.addEventListener('error', function(event) {
                    if (shouldIgnoreError(event.error || event)) {
                      event.preventDefault();
                      event.stopPropagation();
                      event.stopImmediatePropagation();
                    }
                  }, { capture: true, passive: false });
                } catch (e) {
                  // Silenciar errores al registrar listeners
                }
              })();
            `,
          }}
        />
      </head>
      <body>
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