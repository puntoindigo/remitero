"use client";

import React from "react";
import { Printer, Edit, Trash2 } from "lucide-react";

interface RemitoActionButtonsProps {
  onPrint: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export default function RemitoActionButtons({ 
  onPrint, 
  onEdit, 
  onDelete, 
  isLoading = false
}: RemitoActionButtonsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onPrint}
        className="small primary"
        title="Imprimir"
        disabled={isLoading}
      >
        <Printer className="h-4 w-4" />
      </button>
      <button
        onClick={onEdit}
        className="small primary"
        title="Editar"
        disabled={isLoading}
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        className="small danger"
        title="Eliminar"
        disabled={isLoading}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

