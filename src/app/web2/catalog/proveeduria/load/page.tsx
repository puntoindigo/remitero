"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ServiceCardData, CatalogData } from "@/types/web2";

// Colores para las categorías
const categoryColors: Record<string, string> = {
  "Bebidas": "#3b82f6",
  "Alimentos": "#10b981",
  "Limpieza": "#f59e0b",
  "Otros": "#8b5cf6",
  "Default": "#6366f1"
};

export default function LoadProveeduriaCatalog() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("Cargando productos de Proveeduría...");

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setStatus("Buscando empresa Proveeduría...");
        
        // 1. Obtener todas las empresas
        const companiesResponse = await fetch("/api/companies");
        if (!companiesResponse.ok) {
          throw new Error("Error al cargar empresas");
        }
        const companies = await companiesResponse.json();
        
        // 2. Buscar la empresa "proveeduria" (case insensitive)
        const proveeduria = companies.find((c: any) => 
          c.name?.toLowerCase().includes("proveeduría") || 
          c.name?.toLowerCase().includes("proveeduria")
        );
        
        if (!proveeduria) {
          setStatus("❌ No se encontró la empresa 'Proveeduría'");
          setTimeout(() => router.push("/web2"), 3000);
          return;
        }

        setStatus(`Empresa encontrada: ${proveeduria.name}. Cargando productos...`);
        
        // 3. Obtener productos de la empresa
        const productsResponse = await fetch(`/api/products?companyId=${proveeduria.id}`);
        if (!productsResponse.ok) {
          throw new Error("Error al cargar productos");
        }
        const products = await productsResponse.json();
        
        if (!products || products.length === 0) {
          setStatus("❌ No se encontraron productos en Proveeduría");
          setTimeout(() => router.push("/web2"), 3000);
          return;
        }

        setStatus(`Se encontraron ${products.length} productos. Creando catálogo...`);

        // 4. Obtener categorías para mapear colores
        const categoriesResponse = await fetch(`/api/categories?companyId=${proveeduria.id}`);
        let categories: any[] = [];
        if (categoriesResponse.ok) {
          categories = await categoriesResponse.json();
        }

        // 5. Convertir productos a ServiceCardData
        const cards: ServiceCardData[] = products.map((product: any, index: number) => {
          // Buscar categoría del producto
          const category = categories.find((c: any) => c.id === product.category_id);
          const categoryName = category?.name || "Otros";
          
          // Determinar color basado en categoría
          let color = categoryColors[categoryName] || categoryColors["Default"];
          if (category?.color) {
            color = category.color;
          }

          // Imagen por defecto si no tiene
          const defaultImages = [
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
            "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80",
          ];
          const image = product.image_url || defaultImages[index % defaultImages.length];

          return {
            id: `proveeduria-${product.id}`,
            title: product.name || "Sin nombre",
            description: product.description || "",
            image: image,
            color: color,
            category: categoryName,
            price: product.price || undefined,
            size: { cols: 1, rows: 1 },
            textColor: "#ffffff",
            overlayIntensity: 0.5
          };
        });

        // 6. Guardar cards en localStorage
        const existingCards = localStorage.getItem("web2-cards");
        let allCards: ServiceCardData[] = [];
        
        if (existingCards) {
          try {
            allCards = JSON.parse(existingCards);
            // Filtrar cards existentes de proveeduría para evitar duplicados
            allCards = allCards.filter(card => !card.id.startsWith("proveeduria-"));
          } catch (e) {
            console.error("Error parsing existing cards:", e);
          }
        }
        
        // Agregar nuevas cards
        allCards = [...allCards, ...cards];
        localStorage.setItem("web2-cards", JSON.stringify(allCards));

        setStatus("Cards guardadas. Creando catálogo...");

        // 7. Crear catálogo
        const catalogId = "proveeduria-catalog";
        const catalog: CatalogData = {
          id: catalogId,
          title: "Proveeduría - Catálogo de Productos",
          description: `Catálogo completo con ${products.length} productos de ${proveeduria.name}`,
          backgroundColor: "#ffffff",
          textColor: "#111827",
          products: cards.map(c => c.id),
          createdAt: new Date().toISOString()
        };

        // 8. Guardar catálogo en localStorage
        const existingCatalogs = localStorage.getItem("web2-catalogs");
        let catalogs: CatalogData[] = [];
        
        if (existingCatalogs) {
          try {
            catalogs = JSON.parse(existingCatalogs);
            // Eliminar catálogo existente de proveeduría si existe
            catalogs = catalogs.filter(c => c.id !== catalogId);
          } catch (e) {
            console.error("Error parsing existing catalogs:", e);
          }
        }
        
        catalogs.push(catalog);
        localStorage.setItem("web2-catalogs", JSON.stringify(catalogs));

        setStatus(`✅ Catálogo creado con ${cards.length} productos! Redirigiendo...`);
        
        // 9. Redirigir al catálogo
        setTimeout(() => {
          router.push(`/web2/catalog/${catalogId}`);
        }, 1500);

      } catch (error: any) {
        console.error("Error loading catalog:", error);
        setStatus(`❌ Error: ${error.message}`);
        setTimeout(() => router.push("/web2"), 3000);
      }
    };

    loadCatalog();
  }, [router]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "2rem",
      backgroundColor: "#f9fafb",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        maxWidth: "500px",
        width: "100%",
        textAlign: "center"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid #3b82f6",
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 1rem"
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <h2 style={{
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "#111827",
          marginBottom: "0.5rem"
        }}>
          Cargando Catálogo
        </h2>
        <p style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          margin: 0
        }}>
          {status}
        </p>
      </div>
    </div>
  );
}
