import { Suspense } from "react";
import ProductosContent from "./ProductosContent";

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="loading">Cargando productos...</div>}>
      <ProductosContent />
    </Suspense>
  );
}