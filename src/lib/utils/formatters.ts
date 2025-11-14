export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "Fecha inválida";
  }
  return d.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Formato 24hs
  });
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "Fecha inválida";
  }
  return d.toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
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
  
  // Convertir a GMT-3 (Argentina)
  const argentinaDate = new Date(d.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  const now = new Date();
  const nowArgentina = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  
  const today = new Date(nowArgentina.getFullYear(), nowArgentina.getMonth(), nowArgentina.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateOnly = new Date(argentinaDate.getFullYear(), argentinaDate.getMonth(), argentinaDate.getDate());
  
  const hours = argentinaDate.getHours().toString().padStart(2, '0');
  const minutes = argentinaDate.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  
  // Fecha completa para tooltip en GMT-3
  const fullDate = argentinaDate.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
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
      const dateStr = argentinaDate.toLocaleDateString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        day: "2-digit",
        month: "2-digit",
      });
      return { display: `${dateStr} ${timeStr}`, tooltip: fullDate };
    }
  }
}
