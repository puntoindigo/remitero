"use client";

import { useState } from "react";
import { X, CreditCard, Lock, CheckCircle } from "lucide-react";
import { showToast } from "./Toast";
import type { ServiceCardData } from "@/types/web2";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ServiceCardData | null;
}

export function PaymentModal({ isOpen, onClose, product }: PaymentModalProps) {
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    address: ""
  });

  if (!isOpen || !product || product.price === undefined) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    
    // Simular procesamiento
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        showToast("¡Pago procesado exitosamente!", "success");
        onClose();
        setStep("form");
        setFormData({
          name: "",
          email: "",
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          address: ""
        });
      }, 2000);
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <CreditCard className="icon" style={{ width: "24px", height: "24px", marginRight: "0.5rem" }} />
            Procesar Pago
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X className="icon" />
          </button>
        </div>

        {step === "form" && (
          <div className="payment-content">
            <div className="payment-product-summary">
              <div className="payment-product-image">
                <img src={product.image} alt={product.title} />
              </div>
              <div className="payment-product-info">
                <h3>{product.title}</h3>
                <p className="payment-product-description">{product.description}</p>
                <div className="payment-total">
                  <span>Total:</span>
                  <span className="payment-amount">${product.price.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan@ejemplo.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle 123, Ciudad"
                  required
                />
              </div>

              <div className="form-group">
                <label>Número de tarjeta</label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vencimiento</label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: formatExpiryDate(e.target.value) })}
                    placeholder="MM/AA"
                    maxLength={5}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').substring(0, 3) })}
                    placeholder="123"
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div className="payment-security">
                <Lock className="icon" />
                <span>Tu información está protegida con encriptación SSL</span>
              </div>

              <button type="submit" className="btn-primary payment-submit">
                Pagar ${product.price.toLocaleString('es-AR')}
              </button>
            </form>
          </div>
        )}

        {step === "processing" && (
          <div className="payment-processing">
            <div className="payment-spinner"></div>
            <h3>Procesando pago...</h3>
            <p>Por favor, no cierres esta ventana</p>
          </div>
        )}

        {step === "success" && (
          <div className="payment-success">
            <CheckCircle className="icon success-icon" />
            <h3>¡Pago exitoso!</h3>
            <p>Tu pedido ha sido procesado correctamente</p>
            <p className="payment-success-details">
              Recibirás un email de confirmación en <strong>{formData.email}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

