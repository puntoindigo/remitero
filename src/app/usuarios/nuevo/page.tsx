"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NuevoUsuarioPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página principal con el formulario abierto
    router.replace("/usuarios?openForm=true");
  }, [router]);

  return null;
}

