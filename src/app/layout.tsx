import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import Header from "@/components/layout/Header";
import TopBar from "@/components/layout/TopBar";
import EnvironmentBannerWrapper from "@/components/common/EnvironmentBannerWrapper";
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
          {/* <EnvironmentBannerWrapper /> */}
          <TopBar />
          <Header />
          <div className="container">
            <Providers>{children}</Providers>
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}