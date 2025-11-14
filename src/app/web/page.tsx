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

  // Auto-play del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 9 ? 0 : prev + 1));
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
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
      icon: Building2,
      title: "Multi-Empresa",
      description: "Gestiona múltiples empresas desde una sola plataforma con roles y permisos."
    },
    {
      icon: Shield,
      title: "Seguridad Total",
      description: "Autenticación segura con Google OAuth y control de acceso por roles."
    },
    {
      icon: Fingerprint,
      title: "Control de Horarios con Huella Digital",
      description: "Integración con lectores de huella digital para control de asistencia, turnos e identidad de personal."
    }
  ];

  const futureFeatures = [
    {
      icon: TrendingUp,
      title: "Reportes Avanzados",
      description: "Genera reportes personalizados de ventas, compras y análisis de tendencias."
    },
    {
      icon: Zap,
      title: "Integración con Balanzas",
      description: "Conecta tu sistema con balanzas para control de peso en tiempo real."
    },
    {
      icon: Globe,
      title: "Carrito Online",
      description: "Permite que tus clientes realicen pedidos online integrados con tu sistema."
    }
  ];

  const plans = [
    {
      name: "Básico",
      price: "$25.000",
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
      price: "$55.000",
      period: "mes",
      features: [
        "Usuarios ilimitados",
        "Multi-empresa",
        "Roles y permisos avanzados",
        "Reportes personalizados",
        "Integración con balanzas",
        "Soporte prioritario",
        "Carrito online (próximamente)"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Desde $120.000",
      period: "mes",
      features: [
        "Todo lo del plan Profesional",
        "Soporte 24/7",
        "Capacitación personalizada",
        "Desarrollo de features a medida",
        "API personalizada",
        "Múltiples sucursales"
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
            <div className="web-logo">
              <FileText className="web-logo-icon" />
              <span className="web-logo-text">Remitero</span>
            </div>
            <nav className="web-nav">
              <a href="#caracteristicas">Características</a>
              <a href="#planes">Planes</a>
              <a href="#contacto">Contacto</a>
              <Link href="/auth/login" className="web-btn-secondary">
                Iniciar Sesión
              </Link>
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
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80" alt="Almacén" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.92) 0%, rgba(79, 70, 229, 0.92) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Administra tu negocio desde cualquier lugar</h1>
                <p className="web-hero-subtitle">Sistema completo de gestión de remitos con control de stock, clientes y reportes en tiempo real.</p>
                <div className="web-hero-cta">
                  <a href="#contacto" className="web-btn-primary">Solicitar Demo <ArrowRight className="web-icon-inline" /></a>
                  <Link href="/auth/login" className="web-btn-outline">Probar Gratis</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2: Cajas de supermercado con overlay verde */}
          <div className={`web-hero-slide ${currentSlide === 1 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">2</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80" alt="Cajas" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.92) 0%, rgba(16, 185, 129, 0.92) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Control total de tu inventario</h1>
                <p className="web-hero-subtitle">Gestiona productos, stock y ventas desde un solo lugar. La solución completa para tu negocio.</p>
                <div className="web-hero-cta">
                  <a href="#contacto" className="web-btn-primary">Solicitar Demo <ArrowRight className="web-icon-inline" /></a>
                  <Link href="/auth/login" className="web-btn-outline">Probar Gratis</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3: Almacén industrial con overlay naranja */}
          <div className={`web-hero-slide ${currentSlide === 2 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">3</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80" alt="Almacén industrial" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.92) 0%, rgba(245, 158, 11, 0.92) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">La evolución de tu empresa</h1>
                <p className="web-hero-subtitle">Tecnología de punta para gestionar remitos, stock y clientes. Todo en un solo sistema integrado.</p>
                <div className="web-hero-cta">
                  <a href="#contacto" className="web-btn-primary">Solicitar Demo <ArrowRight className="web-icon-inline" /></a>
                  <Link href="/auth/login" className="web-btn-outline">Probar Gratis</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 4: Naturaleza/empresa con overlay púrpura */}
          <div className={`web-hero-slide ${currentSlide === 3 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">4</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&q=80" alt="Naturaleza" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.92) 0%, rgba(168, 85, 247, 0.92) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Gestiona tu negocio con inteligencia</h1>
                <p className="web-hero-subtitle">Dashboard inteligente, reportes en tiempo real y control total. Tu negocio al siguiente nivel.</p>
                <div className="web-hero-cta">
                  <a href="#contacto" className="web-btn-primary">Solicitar Demo <ArrowRight className="web-icon-inline" /></a>
                  <Link href="/auth/login" className="web-btn-outline">Probar Gratis</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 5: Servidores/tecnología con overlay azul oscuro */}
          <div className={`web-hero-slide ${currentSlide === 4 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">5</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80" alt="Tecnología" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 58, 138, 0.92) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Tecnología que impulsa tu negocio</h1>
                <p className="web-hero-subtitle">Sistema robusto y seguro en la nube. Accede desde cualquier dispositivo, en cualquier momento.</p>
                <div className="web-hero-cta">
                  <a href="#contacto" className="web-btn-primary">Solicitar Demo <ArrowRight className="web-icon-inline" /></a>
                  <Link href="/auth/login" className="web-btn-outline">Probar Gratis</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 6: Almacén con estanterías - diseño minimalista */}
          <div className={`web-hero-slide ${currentSlide === 5 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">6</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1920&q=80" alt="Estanterías" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)' }}></div>
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
                  <a href="#contacto" className="web-btn-primary">Solicitar Demo <ArrowRight className="web-icon-inline" /></a>
                  <Link href="/auth/login" className="web-btn-outline">Probar Gratis</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 7: Supermercado moderno - enfoque en retail */}
          <div className={`web-hero-slide ${currentSlide === 6 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">7</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80" alt="Supermercado" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.92) 0%, rgba(239, 68, 68, 0.92) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Perfecto para supermercados y almacenes</h1>
                <p className="web-hero-subtitle">Sistema diseñado para el retail. Control de caja, inventario y ventas en un solo lugar.</p>
                <div className="web-hero-cta">
                  <a href="#contacto" className="web-btn-primary">Solicitar Demo <ArrowRight className="web-icon-inline" /></a>
                  <Link href="/auth/login" className="web-btn-outline">Probar Gratis</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 8: Logística y distribución */}
          <div className={`web-hero-slide ${currentSlide === 7 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">8</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80" alt="Logística" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.92) 0%, rgba(6, 182, 212, 0.92) 100%)' }}></div>
            </div>
            <div className="web-container">
              <div className="web-hero-content">
                <h1 className="web-hero-title">Optimiza tu logística y distribución</h1>
                <p className="web-hero-subtitle">Gestiona entregas, remitos y stock con precisión. Multi-empresa y multi-sucursal.</p>
                <div className="web-hero-cta">
                  <a href="#contacto" className="web-btn-primary">Solicitar Demo <ArrowRight className="web-icon-inline" /></a>
                  <Link href="/auth/login" className="web-btn-outline">Probar Gratis</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 9: Diseño limpio con texto centrado grande */}
          <div className={`web-hero-slide ${currentSlide === 8 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">9</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80" alt="Minimalista" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.92) 0%, rgba(139, 92, 246, 0.92) 100%)' }}></div>
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
                  <a href="#contacto" className="web-btn-primary">Solicitar Demo <ArrowRight className="web-icon-inline" /></a>
                  <Link href="/auth/login" className="web-btn-outline">Probar Gratis</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 10: Enfoque en beneficios con lista destacada */}
          <div className={`web-hero-slide ${currentSlide === 9 ? 'active' : ''}`}>
            <div className="web-hero-slide-number">10</div>
            <div className="web-hero-background">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80" alt="Beneficios" className="web-hero-bg-image" />
              <div className="web-hero-overlay" style={{ background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.94) 0%, rgba(59, 130, 246, 0.94) 100%)' }}></div>
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
                  <a href="#contacto" className="web-btn-primary">Solicitar Demo <ArrowRight className="web-icon-inline" /></a>
                  <Link href="/auth/login" className="web-btn-outline">Probar Gratis</Link>
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
              <div key={index} className="web-feature-card">
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
          <h2 className="web-section-title">Próximamente</h2>
          <p className="web-section-subtitle">
            Estamos trabajando en estas funcionalidades que llegarán muy pronto
          </p>
          <div className="web-features-grid">
            {futureFeatures.map((feature, index) => {
              const futureImages = [
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80", // Reportes
                "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80", // Balanzas
                "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80" // Carrito online
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
            {plans.map((plan, index) => (
              <div key={index} className={`web-plan-card ${plan.popular ? "web-plan-popular" : ""}`}>
                {plan.popular && <div className="web-plan-badge">Más Popular</div>}
                <h3 className="web-plan-name">{plan.name}</h3>
                <div className="web-plan-price">
                  <span className="web-plan-amount">{plan.price}</span>
                  {plan.period && <span className="web-plan-period">/{plan.period}</span>}
                </div>
                <ul className="web-plan-features">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="web-plan-feature">
                      <CheckCircle className="web-icon-small" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href="#contacto" className={`web-btn ${plan.popular ? "web-btn-primary" : "web-btn-outline"}`}>
                  Solicitar Información
                </a>
              </div>
            ))}
          </div>
          <div className="web-plans-note">
            <div className="web-whatsapp-cta">
              <MessageCircle className="web-whatsapp-icon" />
              <div>
                <strong>Solicite un asesor sin cargo</strong> para realizar una consulta.
                <br />
                <a href="https://wa.me/549XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="web-whatsapp-link">
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="web-section web-section-contact">
        <div className="web-container">
          <h2 className="web-section-title">¡Ponete en contacto con nosotros!</h2>
          <div className="web-contact-grid">
            <div className="web-contact-info">
              <div className="web-contact-item">
                <Phone className="web-icon" />
                <div>
                  <h3>Teléfono</h3>
                  <p>Llamanos para más información</p>
                </div>
              </div>
              <div className="web-contact-item">
                <Mail className="web-icon" />
                <div>
                  <h3>Email</h3>
                  <p>Envianos un mensaje</p>
                </div>
              </div>
            </div>
            <form className="web-contact-form" onSubmit={handleSubmit}>
              <div className="web-form-group">
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="web-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="web-form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="web-form-group">
                <label htmlFor="message">Mensaje</label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <div className="web-form-group">
                <label className="web-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.wantCall}
                    onChange={(e) => setFormData({ ...formData, wantCall: e.target.checked })}
                  />
                  <span>Quiero recibir una llamada</span>
                </label>
              </div>
              <button type="submit" className="web-btn-primary" disabled={formStatus === "sending"}>
                {formStatus === "sending" ? (
                  "Enviando..."
                ) : formStatus === "success" ? (
                  "✓ Enviado"
                ) : (
                  <>
                    Enviar Mensaje
                    <Send className="web-icon-inline" />
                  </>
                )}
              </button>
              {formStatus === "success" && (
                <div className="web-form-success">
                  Su mensaje ha sido enviado. Muchas gracias.
                </div>
              )}
              {formStatus === "error" && (
                <div className="web-form-error">
                  Ha habido un error al enviar el mensaje. Por favor inténtelo nuevamente más tarde.
                </div>
              )}
            </form>
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

