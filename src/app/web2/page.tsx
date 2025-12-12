"use client";

import { useState, useEffect } from "react";
import { Lock, Plus, Edit2, Trash2, Save, X, User, Settings, FileText, Grid, Menu, X as CloseIcon, Share2, Copy, MessageCircle, Filter, ShoppingCart, Tag } from "lucide-react";
import { ServiceCard } from "@/components/web2/ServiceCard";
import { CardModal } from "@/components/web2/CardModal";
import { CatalogModule } from "@/components/web2/CatalogModule";
import { UserProfile } from "@/components/web2/UserProfile";
import { ToastContainer, showToast } from "@/components/web2/Toast";
import { ConfirmDialog } from "@/components/web2/ConfirmDialog";
import { ResizeModal } from "@/components/web2/ResizeModal";
import type { ServiceCardData, CardSize, CatalogData } from "@/types/web2";

export default function Web2Page() {
  const [cards, setCards] = useState<ServiceCardData[]>([]);
  const [catalogs, setCatalogs] = useState<CatalogData[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>("");
  const [showBuyButton, setShowBuyButton] = useState<boolean>(true);
  const [showCategoryTag, setShowCategoryTag] = useState<boolean>(true);
  const [editingCard, setEditingCard] = useState<ServiceCardData | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isResizeModalOpen, setIsResizeModalOpen] = useState(false);
  const [resizingCard, setResizingCard] = useState<ServiceCardData | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({
    isOpen: false,
    message: "",
    onConfirm: () => {}
  });
  const [activeView, setActiveView] = useState<"cards" | "catalog">("cards");

  // Cards de Julieta
  const julietaCards: ServiceCardData[] = [
      {
        id: "julieta-1",
        title: "Entrenamiento Personalizado",
        description: "Rutinas 100% adaptadas al nivel, la edad y los objetivos. Corrección postural y técnica en tiempo real",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
        color: "#ec4899",
        category: "Entrenamiento",
        textColor: "#ffffff",
        overlayIntensity: 0.6
      },
      {
        id: "julieta-2",
        title: "Corrección Postural y Técnica",
        description: "Enfoque en la ejecución correcta de cada movimiento para prevenir lesiones y maximizar resultados",
        image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80",
        color: "#f59e0b",
        category: "Técnica",
        textColor: "#ffffff",
        overlayIntensity: 0.55
      },
      {
        id: "julieta-3",
        title: "Fuerza, Movilidad y Resistencia",
        description: "Enfoque progresivo para mejorar todas las capacidades físicas de forma equilibrada y sostenible",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
        color: "#3b82f6",
        category: "Desarrollo",
        textColor: "#ffffff",
        overlayIntensity: 0.6
      },
      {
        id: "julieta-4",
        title: "Sesiones Presenciales y Virtuales",
        description: "Entrenamiento flexible: individual o grupal, en persona o desde tu casa. Adaptado a tu disponibilidad",
        image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
        color: "#10b981",
        category: "Modalidad",
        textColor: "#ffffff",
        overlayIntensity: 0.5
      },
      {
        id: "julieta-5",
        title: "Profe con Calidez y Claridad",
        description: "Enseñanza con paciencia, cercanía y claridad. Profesionalismo, humor y pedagogía simple",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
        color: "#8b5cf6",
        category: "Metodología",
        textColor: "#ffffff",
        overlayIntensity: 0.55
      },
      {
        id: "julieta-6",
        title: "Coordinadora de Programas Especiales",
        description: "Diseño y coordinación de programas integrales para grupos, instituciones y organizaciones",
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
        color: "#06b6d4",
        category: "Coordinación",
        textColor: "#ffffff",
        overlayIntensity: 0.6
      },
      {
        id: "julieta-7",
        title: "Planes de Bienestar Laboral",
        description: "Programas diseñados para empresas que buscan mejorar el bienestar y la salud de sus equipos",
        image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80",
        color: "#6366f1",
        category: "Empresas",
        textColor: "#ffffff",
        overlayIntensity: 0.5
      },
      {
        id: "julieta-8",
        title: "Programas para Adultos Mayores",
        description: "Rutinas adaptadas especialmente diseñadas para mantener la movilidad, fuerza y calidad de vida",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
        color: "#f97316",
        category: "Adultos Mayores",
        textColor: "#ffffff",
        overlayIntensity: 0.55
      },
      {
        id: "julieta-9",
        title: "Rutinas de Rehabilitación",
        description: "Ejercicios adaptados para personas con movilidad reducida o en proceso de recuperación",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
        color: "#14b8a6",
        category: "Rehabilitación",
        textColor: "#ffffff",
        overlayIntensity: 0.6
      },
      {
        id: "julieta-10",
        title: "Actividades Recreativas Personalizadas",
        description: "Eventos y actividades deportivas diseñadas específicamente para grupos y comunidades",
        image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
        color: "#84cc16",
        category: "Eventos",
        textColor: "#ffffff",
        overlayIntensity: 0.5
      },
      {
        id: "julieta-11",
        title: "Seguimiento por Objetivos",
        description: "Reportes de progreso y seguimiento personalizado para alcanzar tus metas de forma medible",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
        color: "#a855f7",
        category: "Seguimiento",
        textColor: "#ffffff",
        overlayIntensity: 0.55
      },
      {
        id: "julieta-12",
        title: "Escucha Activa y Trato Humano",
        description: "Acompañamiento real con atención personalizada. Cada persona es única y su proceso también",
        image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80",
        color: "#ec4899",
        category: "Acompañamiento",
        textColor: "#ffffff",
        overlayIntensity: 0.6
      },
      {
        id: "julieta-13",
        title: "Adaptación Real a Cada Persona",
        description: "Sin recetas genéricas. Cada rutina se ajusta a tu realidad, limitaciones y objetivos específicos",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
        color: "#f59e0b",
        category: "Personalización",
        textColor: "#ffffff",
        overlayIntensity: 0.55
      },
      {
        id: "julieta-14",
        title: "Resultados Sostenibles",
        description: "Sin ejercicios peligrosos ni exigencias absurdas. Hábitos que perduran y mejoran tu vida",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
        color: "#3b82f6",
        category: "Sostenibilidad",
        textColor: "#ffffff",
        overlayIntensity: 0.5
      },
      {
        id: "julieta-15",
        title: "Ideal para Principiantes",
        description: "Si quieres empezar y no sabes por dónde, o si abandonaste mil veces, aquí encontrarás acompañamiento real",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
        color: "#10b981",
        category: "Inicio",
        textColor: "#ffffff",
        overlayIntensity: 0.6
      }
    ];

  // Cargar catálogos desde localStorage
  useEffect(() => {
    const savedCatalogs = localStorage.getItem("web2-catalogs");
    if (savedCatalogs) {
      try {
        setCatalogs(JSON.parse(savedCatalogs));
      } catch (e) {
        console.error("Error loading catalogs:", e);
      }
    }
  }, []);

  // Cargar datos desde localStorage
  useEffect(() => {
    const savedCards = localStorage.getItem("web2-cards");
    const savedCatalogs = localStorage.getItem("web2-catalogs");

    if (savedCards) {
      try {
        const parsedCards = JSON.parse(savedCards);
        // Verificar si ya existen las cards de Julieta
        const hasJulietaCards = parsedCards.some((c: ServiceCardData) => c.id.startsWith("julieta-"));
        
        if (!hasJulietaCards) {
          // Agregar las cards de Julieta a las existentes
          const allCards = [...parsedCards, ...julietaCards];
          setCards(allCards);
          localStorage.setItem("web2-cards", JSON.stringify(allCards));
        } else {
          setCards(parsedCards);
        }
      } catch (e) {
        console.error("Error loading cards:", e);
      }
    } else {
      // Datos iniciales de ejemplo
      const initialCards: ServiceCardData[] = [
        {
          id: "1",
          title: "Lector de Huella Digital",
          description: "Sistema de control de acceso mediante identificación biométrica para seguridad empresarial",
          image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
          color: "#3b82f6",
          category: "Seguridad",
          size: { cols: 2, rows: 1, fullWidth: true }
        },
        {
          id: "2",
          title: "Dashboard de Reportes",
          description: "Visualización de métricas y estadísticas en tiempo real para toma de decisiones",
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
          color: "#10b981",
          category: "Analytics"
        },
        {
          id: "3",
          title: "Ecommerce Integrado",
          description: "Plataforma de ventas online con gestión de productos, carrito y checkout",
          image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80",
          color: "#f59e0b",
          category: "Ventas"
        },
        {
          id: "4",
          title: "Códigos de Barras",
          description: "Sistema de identificación y gestión mediante códigos QR y de barras",
          image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80",
          color: "#8b5cf6",
          category: "Inventario"
        },
        {
          id: "5",
          title: "Gestión de Remitos",
          description: "Crea, edita y gestiona remitos de forma rápida y eficiente. Control total sobre tus entregas y estados personalizados",
          image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
          color: "#3b82f6",
          category: "Operaciones",
          textColor: "#ffffff",
          overlayIntensity: 0.6
        },
        {
          id: "6",
          title: "Control de Stock",
          description: "Gestiona productos, categorías y controla tu inventario en tiempo real con alertas de stock bajo",
          image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
          color: "#10b981",
          category: "Inventario",
          textColor: "#ffffff",
          overlayIntensity: 0.5
        },
        {
          id: "7",
          title: "Base de Clientes",
          description: "Mantén organizada tu base de clientes con toda su información de contacto, historial y preferencias",
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
          color: "#8b5cf6",
          category: "CRM",
          textColor: "#ffffff",
          overlayIntensity: 0.55
        },
        {
          id: "8",
          title: "Multi-Empresa",
          description: "Gestiona múltiples empresas desde una sola cuenta con cambio rápido entre organizaciones",
          image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
          color: "#f59e0b",
          category: "Administración",
          textColor: "#ffffff",
          overlayIntensity: 0.5
        },
        {
          id: "9",
          title: "Roles y Permisos",
          description: "Sistema completo de control de acceso con roles personalizados (Admin, Usuario, SuperAdmin)",
          image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
          color: "#ef4444",
          category: "Seguridad",
          textColor: "#ffffff",
          overlayIntensity: 0.6
        },
        {
          id: "10",
          title: "Estados Personalizados",
          description: "Crea y gestiona estados personalizados para remitos adaptados a tu flujo de trabajo",
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
          color: "#06b6d4",
          category: "Configuración",
          textColor: "#ffffff",
          overlayIntensity: 0.5
        },
        {
          id: "11",
          title: "Autenticación Google",
          description: "Inicio de sesión seguro con Google OAuth, sin necesidad de recordar contraseñas",
          image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
          color: "#6366f1",
          category: "Seguridad",
          textColor: "#ffffff",
          overlayIntensity: 0.55
        },
        {
          id: "12",
          title: "Gestión de Categorías",
          description: "Organiza tus productos con categorías personalizables y estructura jerárquica",
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
          color: "#84cc16",
          category: "Organización",
          textColor: "#ffffff",
          overlayIntensity: 0.5
        }
      ];
      // Agregar las cards de Julieta a las iniciales
      const allInitialCards = [...initialCards, ...julietaCards];
      setCards(allInitialCards);
      localStorage.setItem("web2-cards", JSON.stringify(allInitialCards));
    }
  }, []);

  // Guardar en localStorage cuando cambien las cards
  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem("web2-cards", JSON.stringify(cards));
    }
  }, [cards]);

  // Crear catálogo de Julieta automáticamente
  useEffect(() => {
    const savedCatalogs = localStorage.getItem("web2-catalogs");
    const julietaCardIds = [
      "julieta-1", "julieta-2", "julieta-3", "julieta-4", "julieta-5",
      "julieta-6", "julieta-7", "julieta-8", "julieta-9", "julieta-10",
      "julieta-11", "julieta-12", "julieta-13", "julieta-14", "julieta-15"
    ];

    if (savedCatalogs) {
      try {
        const parsedCatalogs = JSON.parse(savedCatalogs);
        const hasJulietaCatalog = parsedCatalogs.some((c: any) => c.id === "julieta-catalog");
        
        if (!hasJulietaCatalog) {
          const julietaCatalog = {
            id: "julieta-catalog",
            title: "Julieta",
            description: "Entrenadora Personal & Coordinadora de Programas Especiales. Energía, método y acompañamiento para transformar procesos en hábitos sostenibles.",
            backgroundColor: "#ffffff",
            textColor: "#1a1a1a",
            products: julietaCardIds,
            createdAt: new Date().toISOString()
          };
          
          const updatedCatalogs = [...parsedCatalogs, julietaCatalog];
          localStorage.setItem("web2-catalogs", JSON.stringify(updatedCatalogs));
        }
      } catch (e) {
        console.error("Error loading catalogs:", e);
      }
    } else {
      // Si no hay catálogos, crear el de Julieta
      const julietaCatalog = {
        id: "julieta-catalog",
        title: "Julieta",
        description: "Entrenadora Personal & Coordinadora de Programas Especiales. Energía, método y acompañamiento para transformar procesos en hábitos sostenibles.",
        backgroundColor: "#ffffff",
        textColor: "#1a1a1a",
        products: julietaCardIds,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem("web2-catalogs", JSON.stringify([julietaCatalog]));
    }
  }, []);

  // Cards de Tragos para el Bar
  const barCards: ServiceCardData[] = [
    {
      id: "bar-1",
      title: "Mojito",
      description: "Ron blanco, menta fresca, lima, azúcar y soda. Refrescante y clásico",
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
      color: "#10b981",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.6,
      price: 850,
      size: { cols: 2, rows: 1, fullWidth: true }
    },
    {
      id: "bar-2",
      title: "Margarita",
      description: "Tequila, triple sec, jugo de lima y sal en el borde. Tradicional mexicano",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
      color: "#f59e0b",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.55,
      price: 900
    },
    {
      id: "bar-3",
      title: "Piña Colada",
      description: "Ron, crema de coco y jugo de piña. Tropical y cremoso",
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
      color: "#84cc16",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.5,
      price: 950
    },
    {
      id: "bar-4",
      title: "Caipirinha",
      description: "Cachaça, lima y azúcar. El cóctel nacional de Brasil",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
      color: "#3b82f6",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.55,
      price: 800
    },
    {
      id: "bar-5",
      title: "Old Fashioned",
      description: "Whisky, azúcar, amargo de angostura y cáscara de naranja. Clásico elegante",
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
      color: "#8b5cf6",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.6,
      price: 1100,
      size: { cols: 2, rows: 2 }
    },
    {
      id: "bar-6",
      title: "Cosmopolitan",
      description: "Vodka, triple sec, jugo de arándano y lima. Femenino y sofisticado",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
      color: "#ec4899",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.55,
      price: 950
    },
    {
      id: "bar-7",
      title: "Negroni",
      description: "Gin, vermut rojo y Campari. Amargo y equilibrado",
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
      color: "#ef4444",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.6,
      price: 1000,
      size: { cols: 1, rows: 3 }
    },
    {
      id: "bar-8",
      title: "Daiquiri",
      description: "Ron blanco, jugo de lima y azúcar. Simple y perfecto",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
      color: "#06b6d4",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.5,
      price: 850
    },
    {
      id: "bar-9",
      title: "Moscow Mule",
      description: "Vodka, jengibre, lima y ginger beer. Picante y refrescante",
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
      color: "#14b8a6",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.55,
      price: 900
    },
    {
      id: "bar-10",
      title: "Manhattan",
      description: "Whisky, vermut dulce y amargo de angostura. Clásico de Nueva York",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
      color: "#a855f7",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.6,
      price: 1050,
      size: { cols: 3, rows: 1 }
    },
    {
      id: "bar-11",
      title: "Aperol Spritz",
      description: "Aperol, prosecco y soda. Ligero y cítrico",
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
      color: "#f97316",
      category: "Aperitivos",
      textColor: "#ffffff",
      overlayIntensity: 0.5,
      price: 850
    },
    {
      id: "bar-12",
      title: "Gin Tonic",
      description: "Gin premium, tónica premium y cáscara de limón. Clásico británico",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
      color: "#6366f1",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.55,
      price: 950
    },
    {
      id: "bar-13",
      title: "Bloody Mary",
      description: "Vodka, jugo de tomate, limón y especias. Perfecto para brunch",
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
      color: "#dc2626",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.6,
      price: 900
    },
    {
      id: "bar-14",
      title: "Whisky Sour",
      description: "Whisky, jugo de limón, azúcar y clara de huevo. Ácido y suave",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
      color: "#d97706",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.55,
      price: 1000
    },
    {
      id: "bar-15",
      title: "Pisco Sour",
      description: "Pisco, jugo de limón, azúcar, clara de huevo y amargo de angostura. Tradición peruana",
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
      color: "#059669",
      category: "Cócteles",
      textColor: "#ffffff",
      overlayIntensity: 0.6,
      price: 950
    }
  ];

  // Agregar cards de bar y crear catálogo del bar
  useEffect(() => {
    const savedCards = localStorage.getItem("web2-cards");
    const savedCatalogs = localStorage.getItem("web2-catalogs");
    const barCardIds = [
      "bar-1", "bar-2", "bar-3", "bar-4", "bar-5",
      "bar-6", "bar-7", "bar-8", "bar-9", "bar-10",
      "bar-11", "bar-12", "bar-13", "bar-14", "bar-15"
    ];

    // Agregar cards de bar si no existen
    if (savedCards) {
      try {
        const parsedCards = JSON.parse(savedCards);
        const hasBarCards = parsedCards.some((c: ServiceCardData) => c.id.startsWith("bar-"));
        
        if (!hasBarCards) {
          const allCards = [...parsedCards, ...barCards];
          setCards(allCards);
          localStorage.setItem("web2-cards", JSON.stringify(allCards));
        }
      } catch (e) {
        console.error("Error loading cards:", e);
      }
    }

    // Crear catálogo del bar
    if (savedCatalogs) {
      try {
        const parsedCatalogs = JSON.parse(savedCatalogs);
        const hasBarCatalog = parsedCatalogs.some((c: any) => c.id === "bar-catalog");
        
        if (!hasBarCatalog) {
          const barCatalog = {
            id: "bar-catalog",
            title: "Bar - Menú de Tragos",
            description: "Cócteles clásicos y modernos preparados con ingredientes premium. Ambiente relajado y música en vivo los fines de semana.",
            backgroundColor: "#1a1a1a",
            textColor: "#ffffff",
            products: barCardIds,
            createdAt: new Date().toISOString()
          };
          
          const updatedCatalogs = [...parsedCatalogs, barCatalog];
          localStorage.setItem("web2-catalogs", JSON.stringify(updatedCatalogs));
        }
      } catch (e) {
        console.error("Error loading catalogs:", e);
      }
    } else {
      const barCatalog = {
        id: "bar-catalog",
        title: "Bar - Menú de Tragos",
        description: "Cócteles clásicos y modernos preparados con ingredientes premium. Ambiente relajado y música en vivo los fines de semana.",
        backgroundColor: "#1a1a1a",
        textColor: "#ffffff",
        products: barCardIds,
        createdAt: new Date().toISOString()
      };
      
      const existingCatalogs = localStorage.getItem("web2-catalogs");
      if (existingCatalogs) {
        const parsed = JSON.parse(existingCatalogs);
        localStorage.setItem("web2-catalogs", JSON.stringify([...parsed, barCatalog]));
      } else {
        localStorage.setItem("web2-catalogs", JSON.stringify([barCatalog]));
      }
    }
  }, []);

  const handleAddCard = () => {
    setEditingCard(null);
    setIsCardModalOpen(true);
  };

  const handleEditCard = (card: ServiceCardData) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleDeleteCard = (cardId: string) => {
    setConfirmDialog({
      isOpen: true,
      message: "¿Estás seguro de que deseas eliminar esta tarjeta?",
      onConfirm: () => {
        setCards(cards.filter(c => c.id !== cardId));
        showToast("Tarjeta eliminada", "success");
        setConfirmDialog({ isOpen: false, message: "", onConfirm: () => {} });
      }
    });
  };

  const handleSaveCard = (cardData: ServiceCardData) => {
    if (editingCard) {
      // Editar
      setCards(cards.map(c => c.id === editingCard.id ? cardData : c));
      showToast("Tarjeta actualizada", "success");
    } else {
      // Agregar
      const newCard = { ...cardData, id: Date.now().toString() };
      setCards([...cards, newCard]);
      showToast("Tarjeta creada", "success");
    }
    setIsCardModalOpen(false);
    setEditingCard(null);
  };

  const handleDragEnd = (draggedId: string, targetId: string) => {
    const draggedIndex = cards.findIndex(c => c.id === draggedId);
    const targetIndex = cards.findIndex(c => c.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newCards = Array.from(cards);
    const [removed] = newCards.splice(draggedIndex, 1);
    newCards.splice(targetIndex, 0, removed);

    setCards(newCards);
    showToast("Orden actualizado", "info");
  };

  const handleResize = (card: ServiceCardData) => {
    setResizingCard(card);
    setIsResizeModalOpen(true);
  };

  const handleSaveSize = (size: CardSize) => {
    if (!resizingCard) return;
    
    const updatedCard = { ...resizingCard, size };
    setCards(cards.map(c => c.id === resizingCard.id ? updatedCard : c));
    showToast("Tamaño actualizado", "success");
    setResizingCard(null);
  };

  // Filtrar cards según el catálogo seleccionado
  const filteredCards = selectedCatalogId
    ? (() => {
        const selectedCatalog = catalogs.find(c => c.id === selectedCatalogId);
        if (!selectedCatalog) return cards;
        return cards.filter(card => selectedCatalog.products.includes(card.id));
      })()
    : cards;

  return (
    <div className="web2-container">
      {/* Header con llave/candado apenas visible */}
      <header className="web2-header">
        <div className="web2-header-content">
          <div className="web2-logo">
            <FileText className="web2-logo-icon" />
            <span className="web2-logo-text">Remitero</span>
            <Lock className="web2-lock-icon" />
          </div>
          <nav className="web2-nav">
            <button
              className={`web2-nav-btn ${activeView === "cards" ? "active" : ""}`}
              onClick={() => setActiveView("cards")}
            >
              <Grid className="web2-icon" />
              Servicios
            </button>
            <button
              className={`web2-nav-btn ${activeView === "catalog" ? "active" : ""}`}
              onClick={() => setActiveView("catalog")}
            >
              <FileText className="web2-icon" />
              Catálogo
            </button>
            <button
              className="web2-nav-btn"
              onClick={() => setIsProfileOpen(true)}
            >
              <User className="web2-icon" />
              Perfil
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="web2-main">
        {activeView === "cards" && (
          <div className="web2-cards-section">
            {/* Filtros y controles */}
            <div className="web2-filters-bar" style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              padding: "1rem",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Filter className="web2-icon" style={{ width: "18px", height: "18px" }} />
                <label htmlFor="catalog-filter" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  Filtrar por catálogo:
                </label>
                <select
                  id="catalog-filter"
                  value={selectedCatalogId}
                  onChange={(e) => setSelectedCatalogId(e.target.value)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.875rem",
                    backgroundColor: "white",
                    cursor: "pointer",
                    minWidth: "200px"
                  }}
                >
                  <option value="">Todos los productos</option>
                  {catalogs.map(catalog => (
                    <option key={catalog.id} value={catalog.id}>
                      {catalog.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginLeft: "auto" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
                  <input
                    type="checkbox"
                    checked={showCategoryTag}
                    onChange={(e) => setShowCategoryTag(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <Tag className="web2-icon" style={{ width: "16px", height: "16px" }} />
                  <span>Mostrar categoría</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
                  <input
                    type="checkbox"
                    checked={showBuyButton}
                    onChange={(e) => setShowBuyButton(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <ShoppingCart className="web2-icon" style={{ width: "16px", height: "16px" }} />
                  <span>Mostrar comprar</span>
                </label>
              </div>
            </div>

            <div className="web2-cards-grid">
              {filteredCards.map((card, index) => (
                <ServiceCard
                  key={card.id}
                  card={card}
                  index={index}
                  onEdit={handleEditCard}
                  onDelete={handleDeleteCard}
                  onDragEnd={handleDragEnd}
                  onResize={handleResize}
                  showBuyButton={showBuyButton}
                  showCategoryTag={showCategoryTag}
                />
              ))}
              {filteredCards.length === 0 && (
                <div className="web2-empty-state">
                  <FileText className="web2-empty-icon" />
                  <h3>No hay servicios aún</h3>
                  <p>Crea tu primer servicio para comenzar</p>
                  <button className="web2-btn-primary" onClick={handleAddCard}>
                    <Plus className="web2-icon" />
                    Crear Servicio
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === "catalog" && (
          <CatalogModule
            cards={cards}
            onClose={() => setActiveView("cards")}
          />
        )}
      </main>

      {/* Modales */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        card={editingCard}
      />

      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <ResizeModal
        isOpen={isResizeModalOpen}
        onClose={() => {
          setIsResizeModalOpen(false);
          setResizingCard(null);
        }}
        onSave={handleSaveSize}
        card={resizingCard}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, message: "", onConfirm: () => {} })}
      />

      {/* Floating Action Button */}
      <button className="fab-add" onClick={handleAddCard} title="Agregar Servicio">
        <Plus className="fab-icon" />
      </button>

      <ToastContainer />
    </div>
  );
}

