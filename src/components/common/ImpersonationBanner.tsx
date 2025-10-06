"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useImpersonation } from "@/hooks/useImpersonation";
import { ArrowLeft } from "lucide-react";

export default function ImpersonationBanner() {
  const { stopImpersonation, isImpersonating, isCurrentlyImpersonating, targetUser, originalAdmin } = useImpersonation();

  // Solo mostrar si hay impersonation activa
  if (!isCurrentlyImpersonating) {
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
            Entrando como: <strong>{targetUser?.name}</strong>
            {targetUser?.companyName && (
              <span className="impersonation-company"> ({targetUser.companyName})</span>
            )}
          </span>
        </div>
        
        <button 
          onClick={handleStopImpersonation}
          className="impersonation-stop-btn"
          disabled={isImpersonating}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a {originalAdmin?.name}
        </button>
      </div>
    </div>
  );
}
