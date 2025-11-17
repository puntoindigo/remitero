"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Upload, Save } from "lucide-react";
import { showToast } from "./Toast";
import type { UserProfileData } from "@/types/web2";

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfileData>({
    name: "",
    email: "",
    avatar: "",
    preferences: {
      theme: "auto",
      language: "es"
    }
  });

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("web2-user-profile");
      if (saved) {
        try {
          setProfile(JSON.parse(saved));
        } catch (e) {
          console.error("Error loading profile:", e);
        }
      }
    }
  }, [isOpen]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem("web2-user-profile", JSON.stringify(profile));
    showToast("Perfil actualizado", "success");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Perfil de Usuario</h2>
          <button className="modal-close" onClick={onClose}>
            <X className="icon" />
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" />
              ) : (
                <User className="avatar-placeholder" />
              )}
            </div>
            <label className="avatar-upload-btn">
              <Upload className="icon" />
              Cambiar Foto
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label className="form-label">
                <User className="icon" />
                Nombre
              </label>
              <input
                type="text"
                className="form-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Tu nombre"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail className="icon" />
                Email
              </label>
              <input
                type="email"
                className="form-input"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tema</label>
              <select
                className="form-input"
                value={profile.preferences.theme}
                onChange={(e) => setProfile({
                  ...profile,
                  preferences: { ...profile.preferences, theme: e.target.value as any }
                })}
              >
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Idioma</label>
              <select
                className="form-input"
                value={profile.preferences.language}
                onChange={(e) => setProfile({
                  ...profile,
                  preferences: { ...profile.preferences, language: e.target.value }
                })}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleSave}>
              <Save className="icon" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

