"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface TaskCheckboxProps {
  taskId: string;
  label: string;
  defaultResolved?: boolean;
}

export function TaskCheckbox({ taskId, label, defaultResolved = false }: TaskCheckboxProps) {
  const { data: session } = useSession();
  const [resolved, setResolved] = useState(defaultResolved);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar estado desde localStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`task-${taskId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setResolved(parsed.resolved || false);
        } catch (e) {
          // Ignorar errores de parsing
        }
      }
    }
  }, [taskId]);

  // Guardar en localStorage cuando cambia
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`task-${taskId}`, JSON.stringify({ resolved }));
    }
  }, [taskId, resolved]);

  const handleToggle = async () => {
    if (!session?.user) {
      setError("Debes iniciar sesión para marcar tareas");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          resolved: !resolved,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la tarea");
      }

      setResolved(!resolved);
    } catch (err: any) {
      setError(err.message || "Error al actualizar la tarea");
      console.error("Error updating task:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <button
        onClick={handleToggle}
        disabled={loading || !session?.user}
        className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={resolved ? "Marcar como no resuelto" : "Marcar como resuelto"}
      >
        {resolved ? (
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        ) : (
          <Circle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <label
          onClick={handleToggle}
          className={`cursor-pointer text-sm ${
            resolved
              ? "text-gray-500 dark:text-gray-400 line-through"
              : "text-gray-900 dark:text-gray-100"
          }`}
        >
          {label}
        </label>
        {error && (
          <div className="flex items-center gap-1 mt-1 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

