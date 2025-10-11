"use client";

import { useState, useEffect, useCallback } from "react";
import { useDataWithCompany } from "./useDataWithCompany";
import { useCRUDTable } from "./useCRUDTable";
import { useMessageModal } from "./useMessageModal";
import { useDirectUpdate } from "./useDirectUpdate";

interface UnifiedCRUDOptions<T> {
  apiEndpoint: string;
  transformData?: (data: any) => T[];
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  enableDirectUpdate?: boolean;
  directUpdateConfig?: {
    updateEndpoint: string;
    updateField: string;
    getDisplayValue: (item: T, newValue: any) => string;
  };
}

export function useUnifiedCRUD<T extends { id: string }>({
  apiEndpoint,
  transformData,
  onSuccess,
  onError,
  enableDirectUpdate = false,
  directUpdateConfig
}: UnifiedCRUDOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { companyId, shouldShowCompanySelector } = useDataWithCompany();
  const { modalState, showSuccess, showError, closeModal } = useMessageModal();
  const { updateWithConfirmation, confirmation } = useDirectUpdate();

  const loadData = useCallback(async () => {
    if (!companyId) {
      setData([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const url = `${apiEndpoint}?companyId=${companyId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Error al cargar los datos");
      }
      
      const rawData = await response.json();
      const transformedData = transformData ? transformData(rawData) : rawData;
      setData(transformedData || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error loading data:", err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint, companyId, transformData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const create = async (newItem: Partial<T>) => {
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, companyId })
      });

      if (!response.ok) {
        throw new Error('Error al crear el elemento');
      }

      await loadData();
      const message = onSuccess?.("Elemento creado correctamente") || "Elemento creado correctamente";
      showSuccess(message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al crear el elemento";
      onError?.(errorMessage);
      showError("Error", errorMessage);
    }
  };

  const update = async (id: string, updatedItem: Partial<T>) => {
    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el elemento');
      }

      await loadData();
      const message = onSuccess?.("Elemento actualizado correctamente") || "Elemento actualizado correctamente";
      showSuccess(message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar el elemento";
      onError?.(errorMessage);
      showError("Error", errorMessage);
    }
  };

  const remove = async (id: string) => {
    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el elemento');
      }

      await loadData();
      const message = onSuccess?.("Elemento eliminado correctamente") || "Elemento eliminado correctamente";
      showSuccess(message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar el elemento";
      onError?.(errorMessage);
      showError("Error", errorMessage);
    }
  };

  const directUpdate = async (id: string, newValue: any) => {
    if (!enableDirectUpdate || !directUpdateConfig) {
      throw new Error('Direct update not configured');
    }

    const item = data.find(d => d.id === id);
    if (!item) {
      throw new Error('Elemento no encontrado');
    }

    const displayValue = directUpdateConfig.getDisplayValue(item, newValue);
    
    await updateWithConfirmation(
      async () => {
        const response = await fetch(`${directUpdateConfig.updateEndpoint}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [directUpdateConfig.updateField]: newValue })
        });

        if (!response.ok) {
          throw new Error('Error al actualizar el elemento');
        }

        // Actualizar estado local
        setData(prevData =>
          prevData.map(item =>
            item.id === id ? { ...item, [directUpdateConfig.updateField]: newValue } : item
          )
        );
      },
      {
        confirmationTitle: "Confirmar cambio",
        confirmationMessage: `¿Cambiar a "${displayValue}"?`,
        onSuccess: (message) => showSuccess(message),
        onError: (error) => showError("Error", error)
      }
    );
  };

  return {
    // Data
    data,
    isLoading,
    error,
    
    // Company management
    companyId,
    shouldShowCompanySelector,
    
    // CRUD operations
    create,
    update,
    remove,
    reload: loadData,
    
    // Direct update (if enabled)
    directUpdate: enableDirectUpdate ? directUpdate : undefined,
    
    // Modals
    modalState,
    showSuccess,
    showError,
    closeModal,
    
    // Confirmation modal (if direct update enabled)
    confirmation: enableDirectUpdate ? confirmation : undefined
  };
}
