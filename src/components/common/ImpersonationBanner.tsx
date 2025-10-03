"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useImpersonation } from "@/hooks/useImpersonation";
import { ArrowLeft } from "lucide-react";

export default function ImpersonationBanner() {
  const { data: session } = useSession();
  const { stopImpersonation, isImpersonating } = useImpersonation();

  // Solo mostrar si hay impersonation activa
  if (!session?.impersonation?.isActive) {
    return null;
  }

  const handleStopImpersonation = async () => {
    try {
      await stopImpersonation();
    } catch (error) {
      console.error('Error al detener impersonation:', error);
    }
  };

  return (
    <div className="impersonation-banner">
      <div className="impersonation-content">
        <div className="impersonation-info">
          <span className="impersonation-icon">⚠️</span>
          <span className="impersonation-text">
            Entrando como: <strong>{session.user.name}</strong>
            {session.user.companyName && (
              <span className="impersonation-company"> ({session.user.companyName})</span>
            )}
          </span>
        </div>
        
        <button 
          onClick={handleStopImpersonation}
          className="impersonation-stop-btn"
          disabled={isImpersonating}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a {session.user.originalAdmin?.name}
        </button>
      </div>
    </div>
  );
}
