"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NuevoProductoPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página principal con el formulario abierto
    router.replace("/productos?openForm=true");
  }, [router]);

  return null;
}

