"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, X, Wifi, WifiOff } from "lucide-react";

interface NetworkErrorBannerProps {
  isOnline: boolean;
  onRetry?: () => void;
}

export function NetworkErrorBanner({ isOnline, onRetry }: NetworkErrorBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [hasShownOffline, setHasShownOffline] = useState(false);

  useEffect(() => {
    if (!isOnline && !hasShownOffline) {
      setShowBanner(true);
      setHasShownOffline(true);
    } else if (isOnline && hasShownOffline) {
      // Cuando vuelve la conexión, mostrar mensaje de éxito brevemente
      setShowBanner(true);
      setTimeout(() => {
        setShowBanner(false);
        setHasShownOffline(false);
      }, 3000);
    }
  }, [isOnline, hasShownOffline]);

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "60px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10000,
        minWidth: "400px",
        maxWidth: "90vw",
        backgroundColor: isOnline ? "#10b981" : "#ef4444",
        color: "white",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        animation: "slideDown 0.3s ease-out",
      }}
    >
      {isOnline ? (
        <Wifi className="h-5 w-5" style={{ flexShrink: 0 }} />
      ) : (
        <WifiOff className="h-5 w-5" style={{ flexShrink: 0 }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "2px" }}>
          {isOnline ? "Conexión restaurada" : "Sin conexión a internet"}
        </div>
        <div style={{ fontSize: "12px", opacity: 0.9 }}>
          {isOnline
            ? "Tu conexión se ha restaurado correctamente."
            : "No se puede conectar al servidor. Verifica tu conexión a internet."}
        </div>
      </div>
      <button
        onClick={() => setShowBanner(false)}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.8,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
      >
        <X className="h-4 w-4" />
      </button>
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

