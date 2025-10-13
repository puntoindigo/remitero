"use client";

import React from "react";
import { Edit, Trash2, Plus, Printer } from "lucide-react";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
  emptyIcon?: React.ReactNode;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onPrint?: (item: T) => void;
  onNew?: () => void;
  newButtonText?: string;
  newButtonIcon?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showNewButton?: boolean;
  showActions?: boolean;
  actionsColumnLabel?: string;
  getItemId?: (item: T) => string;
  className?: string;
  rowClassName?: (item: T, index: number) => string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyMessage = "No hay datos",
  emptySubMessage = "Comienza creando un nuevo elemento.",
  emptyIcon,
  onEdit,
  onDelete,
  onPrint,
  onNew,
  newButtonText = "Nuevo",
  newButtonIcon = <Plus className="h-4 w-4 mr-2" />,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
  showSearch = true,
  showNewButton = true,
  showActions = true,
  actionsColumnLabel = "Acciones",
  getItemId = (item: any) => item.id,
  className = "",
  rowClassName = (_, index) => index % 2 === 0 ? "row-even" : "row-odd"
}: DataTableProps<T>) {
  
  if (loading) {
    return (
      <div className="data-table-container">
        <div className="loading">Cargando datos...</div>
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="data-table-container">
        <div className="empty-state">
          {emptyIcon}
          <p className="empty-text">{emptyMessage}</p>
          <p className="empty-subtext">{emptySubMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`data-table-container ${className}`}>
      {/* Header con búsqueda y botón nuevo */}
      {(showSearch || showNewButton) && (
        <div className="data-table-header">
          {showSearch && onSearchChange && (
            <div className="search-container">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="search-input"
              />
            </div>
          )}
          
          {showNewButton && onNew && (
            <button
              onClick={onNew}
              className="primary new-button"
            >
              {newButtonIcon}
              {newButtonText}
            </button>
          )}
        </div>
      )}

      {/* Tabla */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  style={{ width: column.width }}
                  className={column.sortable ? "sortable" : ""}
                >
                  {column.label}
                </th>
              ))}
              {showActions && (onEdit || onDelete || onPrint) && (
                <th className="actions-column">{actionsColumnLabel}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr 
                key={getItemId(item)} 
                className={rowClassName(item, index)}
              >
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render 
                      ? column.render(item, index)
                      : (item as any)[column.key]
                    }
                  </td>
                ))}
                {showActions && (onEdit || onDelete || onPrint) && (
                  <td className="actions-cell">
                    <div className="action-buttons">
                      {onPrint && (
                        <button
                          onClick={() => onPrint(item)}
                          className="action-button print-button"
                          title="Imprimir"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="action-button edit-button"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="action-button delete-button"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
