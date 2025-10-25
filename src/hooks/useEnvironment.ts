"use client";

import { useEffect, useState } from 'react';

type Environment = 'development' | 'production' | 'preview';

export function useEnvironment(): Environment {
  const [environment, setEnvironment] = useState<Environment>('development');

  useEffect(() => {
    const detectEnvironment = () => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        // Detectar si estamos en localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          setEnvironment('development');
          return;
        }
        
        // Detectar si es preview (remitero-dev.vercel.app)
        if (hostname === 'remitero-dev.vercel.app') {
          setEnvironment('preview');
          return;
        }
        
        // Detectar si es producción (v0-remitero.vercel.app)
        if (hostname === 'v0-remitero.vercel.app') {
          setEnvironment('production');
          return;
        }
        
        // Por defecto, producción
        setEnvironment('production');
      }
    };

    detectEnvironment();
  }, []);

  return environment;
}