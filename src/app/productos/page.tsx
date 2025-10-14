import { Suspense } from "react";
import ProductosContent from "./ProductosContent";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function ProductosPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando productos..." />}>
      <ProductosContent />
    </Suspense>
  );
}