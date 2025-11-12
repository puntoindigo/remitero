export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "Fecha inválida";
  }
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "Fecha inválida";
  }
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateRelative(date: Date | string): { display: string; tooltip: string } {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return { display: "Fecha inválida", tooltip: "Fecha inválida" };
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  
  // Fecha completa para tooltip
  const fullDate = d.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  
  if (dateOnly.getTime() === today.getTime()) {
    return { display: `Hoy ${timeStr}`, tooltip: fullDate };
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return { display: `Ayer ${timeStr}`, tooltip: fullDate };
  } else {
    const daysDiff = Math.floor((today.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      return { display: `Hace ${daysDiff} días ${timeStr}`, tooltip: fullDate };
    } else {
      const dateStr = d.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
      });
      return { display: `${dateStr} ${timeStr}`, tooltip: fullDate };
    }
  }
}
