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
        
        // Detectar si es un preview de Vercel (URLs con hash muy largo)
        if (hostname.includes('vercel.app') && hostname.includes('-') && 
            hostname.split('-').length >= 4) {
          setEnvironment('preview');
          return;
        }
        
        // Todo lo demás es producción
        setEnvironment('production');
      }
    };

    detectEnvironment();
  }, []);

  return environment;
}