"use client";

import EnvironmentBanner from './EnvironmentBanner';
import { useEnvironment } from '@/hooks/useEnvironment';

export default function EnvironmentBannerWrapper() {
  const environment = useEnvironment();
  
  return <EnvironmentBanner environment={environment} />;
}
