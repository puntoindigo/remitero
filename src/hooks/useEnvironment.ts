"use client";

import { useEffect, useState } from 'react';

type Environment = 'development' | 'production' | 'preview';

export function useEnvironment(): Environment {
  const [environment, setEnvironment] = useState<Environment>('development');

  useEffect(() => {
    const detectEnvironment = () => {
      // Detectar si estamos en localhost
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          setEnvironment('development');
          return;
        }
        
        // Detectar si es un preview de Vercel
        if (hostname.includes('vercel.app') && !hostname.includes('remitero-prod')) {
          setEnvironment('preview');
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
