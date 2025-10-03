"use client";

import React from "react";
import { Edit, Trash2, UserCheck } from "lucide-react";

interface UserActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  onImpersonate?: () => void;
  isLoading?: boolean;
  canImpersonate?: boolean;
  editTitle?: string;
  deleteTitle?: string;
  impersonateTitle?: string;
}

export default function UserActionButtons({ 
  onEdit, 
  onDelete, 
  onImpersonate,
  isLoading = false,
  canImpersonate = false,
  editTitle = "Editar",
  deleteTitle = "Eliminar",
  impersonateTitle = "Entrar como este usuario"
}: UserActionButtonsProps) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <button
        onClick={onEdit}
        className="small primary"
        title={editTitle}
        disabled={isLoading}
      >
        <Edit className="h-4 w-4" />
      </button>
      
      {canImpersonate && onImpersonate && (
        <button
          onClick={onImpersonate}
          className="small secondary"
          title={impersonateTitle}
          disabled={isLoading}
        >
          <UserCheck className="h-4 w-4" />
        </button>
      )}
      
      <button
        onClick={onDelete}
        className="small danger"
        title={deleteTitle}
        disabled={isLoading}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
