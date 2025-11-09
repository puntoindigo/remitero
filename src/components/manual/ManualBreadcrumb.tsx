'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href: string;
}

interface ManualBreadcrumbProps {
  breadcrumbs: Breadcrumb[];
}

export function ManualBreadcrumb({ breadcrumbs }: ManualBreadcrumbProps) {
  return (
    <nav 
      className="mb-4 sm:mb-6 animate-fade-in animate-slide-in-from-top"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 mx-1" />
              )}
              {isLast ? (
                <span className="text-gray-600 dark:text-gray-400 font-medium px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {index === 0 && <Home className="w-3 h-3 sm:w-4 sm:h-4" />}
                  <span>{crumb.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

