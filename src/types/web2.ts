export type CardSize = {
  cols: 1 | 2 | 3 | 4; // Columnas que ocupa (1-4)
  rows: 1 | 2 | 3 | 4; // Filas que ocupa (1-4)
  fullWidth?: boolean; // Si ocupa 100% del ancho
  fullHeight?: boolean; // Si ocupa 100% del alto visible
};

export interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  image: string;
  color: string;
  category?: string;
  size?: CardSize; // Tamaño del card en el grid
  textColor?: string; // Color del texto sobre la imagen
  overlayIntensity?: number; // Intensidad del overlay (0-1)
  price?: number; // Precio del producto/servicio
}

export interface CatalogData {
  id: string;
  title: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  products: string[]; // IDs de las cards
  createdAt: string;
  showCategoryTag?: boolean; // Mostrar tag de categoría
  showBuyButton?: boolean; // Mostrar botón de comprar
  titleStyle?: {
    fontFamily?: string;
    fontSize?: string;
    color?: string;
  };
  priceStyle?: {
    fontFamily?: string;
    fontSize?: string;
    color?: string;
  };
}

export interface UserProfileData {
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: "light" | "dark" | "auto";
    language: string;
  };
}

