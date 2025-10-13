"use client";

import { useState } from "react";

/**
 * Hook genérico para manejar el estado del formulario modal en páginas CRUD.
 * 
 * Este hook maneja SOLO la lógica del UI (abrir/cerrar modales, estado de edición).
 * Las operaciones CRUD (create, update, delete) se manejan en hooks específicos
 * (useUsuarios, useEmpresas, etc.)
 * 
 * @template T - Tipo del item que se está editando (debe tener 'id')
 */
export function useCRUDPage<T extends { id: string }>() {
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ 
    id: string; 
    name: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Abre el formulario en modo "crear nuevo"
   */
  const handleNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  /**
   * Abre el formulario en modo "editar" con el item seleccionado
   */
  const handleEdit = (item: T) => {
    setEditingItem(item);
    setShowForm(true);
  };

  /**
   * Cierra el formulario y limpia el estado de edición
   */
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  /**
   * Muestra el modal de confirmación de eliminación
   */
  const handleDeleteRequest = (id: string, name: string) => {
    console.log('handleDeleteRequest called with:', { id, name });
    console.log('ID type:', typeof id, 'Name type:', typeof name);
    setShowDeleteConfirm({ id, name });
  };

  /**
   * Cancela la eliminación y cierra el modal de confirmación
   */
  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  /**
   * Indica si estamos en modo edición (true) o creación (false)
   */
  const isEditing = editingItem !== null;

  return {
    // Estado del formulario
    editingItem,
    showForm,
    isSubmitting,
    isEditing,
    
    // Acciones del formulario
    handleNew,
    handleEdit,
    handleCloseForm,
    setIsSubmitting,
    setEditingItem,
    
    // Estado de eliminación
    showDeleteConfirm,
    handleDeleteRequest,
    handleCancelDelete
  };
}

