"use client";

import { useState, useEffect } from "react";
import { FileText, Package, Users, Building2, BarChart3, CheckCircle, ArrowRight, Phone, Mail, Send, TrendingUp, Shield, Zap, Globe, Fingerprint, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function WebPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    wantCall: false
  });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(1); // Plan Profesional por defecto
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [loginFlipped, setLoginFlipped] = useState(false);

  // Auto-play del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 9 ? 0 : prev + 1));
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer para animar features cuando se vuelven visibles
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFeaturesVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const featuresSection = document.getElementById('caracteristicas');
    if (featuresSection) {
      observer.observe(featuresSection);
    }

    return () => {
      if (featuresSection) {
        observer.unobserve(featuresSection);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    
    // Aquí puedes integrar con tu API de contacto
    // Por ahora simulamos el envío
    setTimeout(() => {
      setFormStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "", wantCall: false });
      setTimeout(() => setFormStatus("idle"), 3000);
    }, 1000);
  };

  const features = [
    {
      icon: FileText,
      title: "Gestión de Remitos",
      description: "Crea, edita y gestiona remitos de forma rápida y eficiente. Control total sobre tus entregas."
    },
    {
      icon: Package,
      title: "Control de Stock",
      description: "Gestiona productos, categorías y controla tu inventario en tiempo real."
    },
    {
      icon: Users,
      title: "Base de Clientes",
      description: "Mantén organizada tu base de clientes con toda su información de contacto."
    },
    {
      icon: BarChart3,
      title: "Dashboard Inteligente",
      description: "Visualiza estadísticas, gráficos y métricas clave de tu negocio en tiempo real."
    },
    {
      icon: Shield,
      title: "Seguridad Total",
      description: "Autenticación segura con Google OAuth y control de acceso por roles."
    }
  ];

  const futureFeatures = [
    {
      icon: TrendingUp,
      title: "Reportes Avanzados",
      description: "Genera reportes personalizados de ventas, compras y análisis de tendencias."
    },
    {
      icon: FileText,
      title: "Generador de Catálogos",
      description: "Crea catálogos digitales de tus productos listos para impresión y compartir online."
    },
    {
      icon: Globe,
      title: "Carrito Online",
      description: "Permite que tus clientes realicen pedidos online integrados con tu sistema."
    },
    {
      icon: Fingerprint,
      title: "Control de Horarios con Huella Digital",
      description: "Integración con lectores de huella digital para control de asistencia, turnos e identidad de personal."
    },
    {
      icon: Package,
      title: "Integración con Lectores de Barra",
      description: "Conecta lectores de código de barras para agilizar la gestión de productos y stock."
    },
    {
      icon: Zap,
      title: "Integración con Balanzas",
      description: "Conecta tu sistema con balanzas para control de peso en tiempo real."
    }
  ];

  const plans = [
    {
      name: "Básico",
      priceAnnual: "$25.000",
      priceMonthly: "$30.000",
      period: "mes",
      features: [
        "Hasta 3 usuarios",
        "Gestión de remitos ilimitada",
        "Control de stock",
        "Base de clientes",
        "Dashboard básico",
        "Soporte por email"
      ],
      popular: false
    },
    {
      name: "Profesional",
      priceAnnual: "$55.000",
      priceMonthly: "$65.000",
      period: "mes",
      features: [
        "Usuarios ilimitados",
        "Multi-empresa",
        "Múltiples sucursales",
        "Roles y permisos avanzados",
        "Reportes personalizados",
        "Soporte prioritario",
        "Carrito online (próximamente)"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      priceAnnual: "$120.000",
      priceMonthly: "$140.000",
      period: "mes",
      desde: true,
      features: [
        "Todo lo del plan Profesional",
        "Integración con balanzas",
        "Soporte 24/7",
        "Capacitación personalizada",
        "Desarrollo de features a medida",
        "API personalizada"
      ],
      popular: false
    }
  ];

  return (
    <div className="web-landing">
      {/* Header */}
      <header className="web-header">
        <div className="web-container">
          <div className="web-header-content">
            <a href="#" className="web-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <FileText className="web-logo-icon" />
              <span className="web-logo-text">Remitero</span>
            </a>
            <nav className="web-nav">
              <a href="#caracteristicas">Características</a>
              <a href="#planes">Planes</a>
              <div className="web-login-dropdown-container">
                <button 
                  className="web-btn-secondary web-login-trigger"
                  onClick={() => {
                    setShowLoginDropdown(!showLoginDropdown);
                    if (!showLoginDropdown) {
                      setLoginFlipped(false);
                    }
                  }}
                  onBlur={(e) => {
                    // Solo cerrar si el foco no va a otro elemento del dropdown
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setTimeout(() => {
                        if (!document.activeElement?.closest('.web-login-dropdown')) {
                          setShowLoginDropdown(false);
                          setLoginFlipped(false);
                        }
                      }, 200);
                    }
                  }}
                >
                  Iniciar Sesión
                  <ChevronRight className="web-icon-inline" style={{ transform: 'rotate(90deg)', transition: 'transform 0.2s' }} />
                </button>
                {showLoginDropdown && (
                  <div 
                    className="web-login-dropdown"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className={`web-login-flip-container ${loginFlipped ? 'flipped' : ''}`}>
                      <div className="web-login-flip-front">
                        <Link href="/auth/login" className="web-login-option">
                          <div className="web-login-option-content">
                            <strong>Iniciar con Google</strong>
                            <span>Acceso rápido con tu cuenta de Gmail</span>
                          </div>
                        </Link>
                        <button 
                          className="web-login-option web-login-flip-trigger"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setLoginFlipped(true);
                          }}
                        >
                          <div className="web-login-option-content">
                            <strong>Iniciar con Email</strong>
                            <span>Usa tu email y contraseña</span>
                          </div>
                        </button>
                      </div>
                      <div className="web-login-flip-back">
                        <button 
                          className="web-login-option web-login-flip-trigger"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setLoginFlipped(false);
                          }}
                        >
                          <div className="web-login-option-content">
                            <strong>← Volver</strong>
                            <span>O inicia con Google</span>
                          </div>
                        </button>
                        <Link href="/auth/login" className="web-login-option">
                          <div className="web-login-option-content">
                            <strong>Iniciar con Email</strong>
                            <span>Usa tu email y contraseña</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Carousel */}
      <section className="web-hero">
        <div className="web-hero-carousel">
          {/* Slide 1: Almacén moderno con overlay azul */}
          <div className={`web-hero-slide ${currentSlide === 0 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">1</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1920&q=80" alt="Archivo tradicional" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(30, 30, 30, 0.90) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Administra tu negocio desde cualquier lugar</h1>
                <p className="web-hero-subtitle">Sistema completo de gestión de remitos con control de stock, clientes y reportes en tiempo real.</p>
                <div className="web-hero-cta">
                  <a 
                    href="https://wa.me/5491166882626" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="web-btn-primary web-btn-whatsapp-large"
                  >
                    <MessageCircle className="web-icon-inline" />
                    &nbsp;Solicitar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2: Cajas de supermercado con overlay verde */}
          <div className={`web-hero-slide ${currentSlide === 1 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">2</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80" alt="Biblioteca" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(30, 30, 30, 0.90) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Control total de tu inventario</h1>
                <p className="web-hero-subtitle">Gestiona productos, stock y ventas desde un solo lugar. La solución completa para tu negocio.</p>
                <div className="web-hero-cta">
                  <a 
                    href="https://wa.me/5491166882626" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="web-btn-primary web-btn-whatsapp-large"
                  >
                    <MessageCircle className="web-icon-inline" />
                    &nbsp;Solicitar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3: Almacén industrial con overlay naranja */}
          <div className={`web-hero-slide ${currentSlide === 2 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">3</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80" alt="Almacén industrial" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(30, 30, 30, 0.90) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">La evolución de tu empresa</h1>
                <p className="web-hero-subtitle">Tecnología de punta para gestionar remitos, stock y clientes. Todo en un solo sistema integrado.</p>
                <div className="web-hero-cta">
                  <a 
                    href="https://wa.me/5491166882626" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="web-btn-primary web-btn-whatsapp-large"
                  >
                    <MessageCircle className="web-icon-inline" />
                    &nbsp;Solicitar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 4: Naturaleza/empresa con overlay púrpura */}
          <div className={`web-hero-slide ${currentSlide === 3 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">4</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80" alt="Escritorio madera" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(30, 30, 30, 0.90) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Gestiona tu negocio con inteligencia</h1>
                <p className="web-hero-subtitle">Dashboard inteligente, reportes en tiempo real y control total. Tu negocio al siguiente nivel.</p>
                <div className="web-hero-cta">
                  <a 
                    href="https://wa.me/5491166882626" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="web-btn-primary web-btn-whatsapp-large"
                  >
                    <MessageCircle className="web-icon-inline" />
                    &nbsp;Solicitar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 5: Servidores/tecnología con overlay azul oscuro */}
          <div className={`web-hero-slide ${currentSlide === 4 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">5</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1920&q=80" alt="Archivos legales" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(30, 30, 30, 0.90) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Tecnología que impulsa tu negocio</h1>
                <p className="web-hero-subtitle">Sistema robusto y seguro en la nube. Accede desde cualquier dispositivo, en cualquier momento.</p>
                <div className="web-hero-cta">
                  <a 
                    href="https://wa.me/5491166882626" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="web-btn-primary web-btn-whatsapp-large"
                  >
                    <MessageCircle className="web-icon-inline" />
                    &nbsp;Solicitar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 6: Almacén con estanterías - diseño minimalista */}
          <div className={`web-hero-slide ${currentSlide === 5 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">6</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80" alt="Estanterías madera" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(30, 30, 30, 0.90) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Remitero: Tu sistema de gestión</h1>
                <p className="web-hero-subtitle">Remitos, stock, clientes y reportes. Todo lo que necesitas para hacer crecer tu negocio.</p>
                <div className="web-hero-features">
                  <div className="web-hero-feature"><CheckCircle className="web-icon-small" /><span>Control de stock en tiempo real</span></div>
                  <div className="web-hero-feature"><CheckCircle className="web-icon-small" /><span>Gestión de remitos ilimitada</span></div>
                  <div className="web-hero-feature"><CheckCircle className="web-icon-small" /><span>Dashboard con estadísticas</span></div>
                </div>
                <div className="web-hero-cta">
                  <a 
                    href="https://wa.me/5491166882626" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="web-btn-primary web-btn-whatsapp-large"
                  >
                    <MessageCircle className="web-icon-inline" />
                    &nbsp;Solicitar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 7: Supermercado moderno - enfoque en retail */}
          <div className={`web-hero-slide ${currentSlide === 6 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">7</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1920&q=80" alt="Documentos" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(30, 30, 30, 0.90) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Perfecto para supermercados y almacenes</h1>
                <p className="web-hero-subtitle">Sistema diseñado para el retail. Control de caja, inventario y ventas en un solo lugar.</p>
                <div className="web-hero-cta">
                  <a 
                    href="https://wa.me/5491166882626" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="web-btn-primary web-btn-whatsapp-large"
                  >
                    <MessageCircle className="web-icon-inline" />
                    &nbsp;Solicitar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 8: Logística y distribución */}
          <div className={`web-hero-slide ${currentSlide === 7 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">8</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80" alt="Logística" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(30, 30, 30, 0.90) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Optimiza tu logística y distribución</h1>
                <p className="web-hero-subtitle">Gestiona entregas, remitos y stock con precisión. Multi-empresa y multi-sucursal.</p>
                <div className="web-hero-cta">
                  <a 
                    href="https://wa.me/5491166882626" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="web-btn-primary web-btn-whatsapp-large"
                  >
                    <MessageCircle className="web-icon-inline" />
                    &nbsp;Solicitar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 9: Diseño limpio con texto centrado grande */}
          <div className={`web-hero-slide ${currentSlide === 8 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">9</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80" alt="Minimalista" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(30, 30, 30, 0.90) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content" style={{ maxWidth: '900px' }}>
                <h1 className="web-hero-title" style={{ fontSize: '4rem', marginBottom: '2rem' }}>
                  Remitero
                </h1>
                <p className="web-hero-subtitle" style={{ fontSize: '1.5rem', marginBottom: '3rem' }}>
                  La solución completa para gestionar tu negocio
                </p>
                <div className="web-hero-cta">
                  <a 
                    href="https://wa.me/5491166882626" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="web-btn-primary web-btn-whatsapp-large"
                  >
                    <MessageCircle className="web-icon-inline" />
                    &nbsp;Solicitar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 10: Enfoque en beneficios con lista destacada */}
          <div className={`web-hero-slide ${currentSlide === 9 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">10</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=80" alt="Oficina tradicional" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(30, 30, 30, 0.90) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Todo lo que necesitas en un solo lugar</h1>
                <div className="web-hero-features" style={{ gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <div className="web-hero-feature" style={{ fontSize: '1.25rem' }}><CheckCircle className="web-icon-small" style={{ width: '28px', height: '28px' }} /><span>Cierre de caja por turnos</span></div>
                  <div className="web-hero-feature" style={{ fontSize: '1.25rem' }}><CheckCircle className="web-icon-small" style={{ width: '28px', height: '28px' }} /><span>Control de stock en tiempo real</span></div>
                  <div className="web-hero-feature" style={{ fontSize: '1.25rem' }}><CheckCircle className="web-icon-small" style={{ width: '28px', height: '28px' }} /><span>Visualización de ventas minuto a minuto</span></div>
                  <div className="web-hero-feature" style={{ fontSize: '1.25rem' }}><CheckCircle className="web-icon-small" style={{ width: '28px', height: '28px' }} /><span>Reportes de compras y ventas</span></div>
                </div>
                <div className="web-hero-cta">
                  <a 
                    href="https://wa.me/5491166882626" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="web-btn-primary web-btn-whatsapp-large"
                  >
                    <MessageCircle className="web-icon-inline" />
                    &nbsp;Solicitar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="web-hero-controls">
          <button 
            className="web-hero-control-btn"
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? 9 : prev - 1))}
            aria-label="Slide anterior"
          >
            <ChevronLeft className="web-icon" />
          </button>
          <div className="web-hero-dots">
            {Array.from({ length: 10 }).map((_, index) => (
              <button
                key={index}
                className={`web-hero-dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
          <button 
            className="web-hero-control-btn"
            onClick={() => setCurrentSlide((prev) => (prev === 9 ? 0 : prev + 1))}
            aria-label="Slide siguiente"
          >
            <ChevronRight className="web-icon" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="web-section">
        <div className="web-container">
          <h2 className="web-section-title">Características Principales</h2>
          <div className="web-features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`web-feature-card ${featuresVisible ? 'web-feature-card-visible' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="web-feature-icon">
                  <feature.icon className="web-icon" />
                </div>
                <h3 className="web-feature-title">{feature.title}</h3>
                <p className="web-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Features Section */}
      <section className="web-section web-section-alt">
        <div className="web-container">
          <h2 className="web-section-title">Además</h2>
          <p className="web-section-subtitle">
            Estamos trabajando en estas funcionalidades que llegarán muy pronto
          </p>
          <div className="web-features-grid">
            {futureFeatures.map((feature, index) => {
              const futureImages = [
                "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80", // Reportes
                "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80", // Balanzas
                "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80", // Carrito online
                "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80", // Huella
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", // Catálogos
                "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&q=80" // Lectores de barra
              ];
              return (
                <div key={index} className="web-feature-card web-feature-card-coming">
                  <div className="web-feature-image">
                    <img src={futureImages[index]} alt={feature.title} />
                    <div className="web-feature-image-overlay"></div>
                  </div>
                  <div className="web-feature-icon web-feature-icon-coming">
                    <feature.icon className="web-icon" />
                  </div>
                  <h3 className="web-feature-title">{feature.title}</h3>
                  <p className="web-feature-description">{feature.description}</p>
                  <span className="web-badge-coming">Próximamente</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planes" className="web-section">
        <div className="web-container">
          <h2 className="web-section-title">Nuestros Planes</h2>
          <p className="web-section-subtitle">
            Elige el plan que mejor se adapte a tu negocio
          </p>
          <div className="web-plans-grid">
            {plans.map((plan, index) => {
              const isSelected = selectedPlan === index;
              return (
                <div 
                  key={index} 
                  className={`web-plan-card ${isSelected ? "web-plan-selected" : ""}`}
                  onMouseEnter={() => setSelectedPlan(index)}
                  onClick={() => setSelectedPlan(index)}
                  style={{ cursor: 'pointer' }}
                >
                  {isSelected && <div className="web-plan-badge">Más Popular</div>}
                  <h3 className="web-plan-name">{plan.name}</h3>
                  <div className="web-plan-price">
                    <div className="web-plan-price-annual">
                      {plan.desde && <span className="web-plan-desde">Desde</span>}
                      <span className="web-plan-amount">{plan.priceAnnual}</span>
                      {plan.period && <span className="web-plan-period">/{plan.period}</span>}
                      <span className="web-plan-billing">Pago anual</span>
                    </div>
                    <div className="web-plan-price-monthly">
                      {plan.desde && <span className="web-plan-desde">Desde</span>}
                      <span className="web-plan-amount-monthly">{plan.priceMonthly}</span>
                      {plan.period && <span className="web-plan-period">/{plan.period}</span>}
                      <span className="web-plan-billing">Pago mensual</span>
                    </div>
                  </div>
                  <ul className="web-plan-features">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="web-plan-feature">
                        <CheckCircle className="web-icon-small" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a 
                    href="https://wa.me/5491166882626" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`web-btn web-btn-whatsapp ${isSelected ? "web-btn-primary" : "web-btn-outline"}`}
                  >
                    <MessageCircle className="web-icon-inline" />
                    &nbsp;Solicitar
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Asesor Section */}
      <section className="web-section web-section-asesor">
        <div className="web-container">
          <div className="web-asesor-content">
            <h2 className="web-asesor-title">¿Necesitas ayuda para elegir el plan ideal?</h2>
            <p className="web-asesor-subtitle">Habla con nuestro equipo y te ayudamos a encontrar la solución perfecta para tu negocio</p>
            <a 
              href="https://wa.me/5491166882626" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="web-btn-asesor"
            >
              <MessageCircle className="web-asesor-icon" />
              <span>&nbsp;Solicitar Asesor</span>
            </a>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="web-footer">
        <div className="web-container">
          <div className="web-footer-content">
            <div className="web-footer-logo">
              <FileText className="web-logo-icon" />
              <span className="web-logo-text">Remitero</span>
            </div>
            <p className="web-footer-text">
              La evolución de tu negocio, a un click de distancia.
            </p>
            <div className="web-footer-links">
              <Link href="/auth/login">Iniciar Sesión</Link>
              <a href="#caracteristicas">Características</a>
              <a href="#planes">Planes</a>
              <a href="#contacto">Contacto</a>
            </div>
            <p className="web-footer-copyright">
              © {new Date().getFullYear()} Remitero - Punto Indigo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

