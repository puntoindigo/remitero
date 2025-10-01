"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
  editTitle?: string;
  deleteTitle?: string;
}

export default function ActionButtons({ 
  onEdit, 
  onDelete, 
  isLoading = false,
  editTitle = "Editar",
  deleteTitle = "Eliminar"
}: ActionButtonsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onEdit}
        className="small primary"
        title={editTitle}
        disabled={isLoading}
      >
        <Edit className="h-4 w-4" />
      </button>
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

