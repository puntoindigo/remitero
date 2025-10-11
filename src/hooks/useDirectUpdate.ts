"use client";

import { useState } from "react";
import { useConfirmation } from "./useConfirmation";

interface DirectUpdateOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  showConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;
}

export function useDirectUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const confirmation = useConfirmation();

  const updateWithConfirmation = async (
    updateFunction: () => Promise<void>,
    options: DirectUpdateOptions = {}
  ) => {
    const {
      onSuccess,
      onError,
      showConfirmation = true,
      confirmationTitle = "Confirmar cambio",
      confirmationMessage = "¿Estás seguro de que quieres realizar este cambio?"
    } = options;

    if (showConfirmation) {
      confirmation.showConfirmation(
        confirmationTitle,
        confirmationMessage,
        async () => {
          await performUpdate(updateFunction, onSuccess, onError);
        }
      );
    } else {
      await performUpdate(updateFunction, onSuccess, onError);
    }
  };

  const performUpdate = async (
    updateFunction: () => Promise<void>,
    onSuccess?: (message: string) => void,
    onError?: (error: string) => void
  ) => {
    try {
      setIsUpdating(true);
      await updateFunction();
      onSuccess?.("Cambio realizado correctamente");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al realizar el cambio";
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateStock = async (
    productId: string,
    newStock: 'IN_STOCK' | 'OUT_OF_STOCK',
    updateFunction: (id: string, stock: string) => Promise<void>,
    options: DirectUpdateOptions = {}
  ) => {
    const stockText = newStock === 'IN_STOCK' ? 'En Stock' : 'Sin Stock';
    
    await updateWithConfirmation(
      () => updateFunction(productId, newStock),
      {
        ...options,
        confirmationTitle: "Actualizar stock",
        confirmationMessage: `¿Cambiar el stock del producto a "${stockText}"?`,
        onSuccess: options.onSuccess || ((message) => console.log(message))
      }
    );
  };

  const updateStatus = async (
    remitoId: string,
    newStatusId: string,
    statusName: string,
    updateFunction: (id: string, statusId: string) => Promise<void>,
    options: DirectUpdateOptions = {}
  ) => {
    await updateWithConfirmation(
      () => updateFunction(remitoId, newStatusId),
      {
        ...options,
        confirmationTitle: "Actualizar estado",
        confirmationMessage: `¿Cambiar el estado del remito a "${statusName}"?`,
        onSuccess: options.onSuccess || ((message) => console.log(message))
      }
    );
  };

  return {
    isUpdating,
    updateWithConfirmation,
    updateStock,
    updateStatus,
    confirmation
  };
}
