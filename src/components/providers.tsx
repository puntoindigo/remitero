"use client";

import React from "react";
import { DBProvider } from "@/lib/db";

export function Providers({ children }: { children: React.ReactNode }) {
  return <DBProvider>{children}</DBProvider>;
}
