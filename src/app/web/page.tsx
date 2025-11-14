"use client";

import { useState } from "react";
import { FileText, Package, Users, Building2, BarChart3, CheckCircle, ArrowRight, Phone, Mail, Send, TrendingUp, Shield, Zap, Globe, Fingerprint, MessageCircle } from "lucide-react";
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

      {/* Hero Section */}
      <section className="web-hero">
        <div className="web-hero-background">
          <img 
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80" 
            alt="Almacén moderno"
            className="web-hero-bg-image"
          />
          <div className="web-hero-overlay"></div>
        </div>
        <div className="web-container">
          <div className="web-hero-content">
            <h1 className="web-hero-title">
              Administra tu negocio desde cualquier lugar
            </h1>
            <p className="web-hero-subtitle">
              Sistema completo de gestión de remitos con control de stock, clientes y reportes en tiempo real.
              La evolución de tu empresa, a un click de distancia.
            </p>
            <div className="web-hero-features">
              <div className="web-hero-feature">
                <CheckCircle className="web-icon-small" />
                <span>Cierre de caja por turnos</span>
              </div>
              <div className="web-hero-feature">
                <CheckCircle className="web-icon-small" />
                <span>Control de stock en tiempo real</span>
              </div>
              <div className="web-hero-feature">
                <CheckCircle className="web-icon-small" />
                <span>Visualización de ventas minuto a minuto</span>
              </div>
              <div className="web-hero-feature">
                <CheckCircle className="web-icon-small" />
                <span>Recargos, descuentos y promociones</span>
              </div>
              <div className="web-hero-feature">
                <CheckCircle className="web-icon-small" />
                <span>Reportes de compras y ventas</span>
              </div>
            </div>
            <div className="web-hero-cta">
              <a href="#contacto" className="web-btn-primary">
                Solicitar Demo
                <ArrowRight className="web-icon-inline" />
              </a>
              <Link href="/auth/login" className="web-btn-outline">
                Probar Gratis
              </Link>
            </div>
          </div>
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

