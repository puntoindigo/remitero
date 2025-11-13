'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { TaskCheckbox } from './TaskCheckbox';

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Animación de entrada al cambiar de contenido
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.opacity = '0';
      contentRef.current.style.transform = 'translateY(10px)';
      
      const timer = setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          contentRef.current.style.opacity = '1';
          contentRef.current.style.transform = 'translateY(0)';
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [pathname]);
  
  // Convertir TaskCheckbox y enlaces del markdown
  const processedContent = content
    // Procesar enlaces primero
    .replace(
      /\[([^\]]+)\]\((\/[^)]+)\)/g,
      (match, text, href) => {
        // Si es un enlace interno, usar Link de Next.js
        if (href.startsWith('/manual/') || href.startsWith('/docs/')) {
          return `[${text}](${href})`;
        }
        return match;
      }
    );

  return (
    <div 
      ref={contentRef}
      className="manual-content max-w-none"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, href, children, ...props }) => {
            if (href?.startsWith('/manual/') || href?.startsWith('/docs/')) {
              return (
                <Link 
                  href={href} 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200 font-medium"
                >
                  {children}
                </Link>
              );
            }
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200 font-medium" 
                {...props}
              >
                {children}
              </a>
            );
          },
          h1: ({ node, children, ...props }) => (
            <h1 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-6 sm:mt-8 mb-4 sm:mb-6 text-gray-900 dark:text-gray-100 scroll-mt-20" 
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 
              className="text-xl sm:text-2xl lg:text-3xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-gray-800 dark:text-gray-200 scroll-mt-20 border-b border-gray-200 dark:border-gray-700 pb-2" 
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 
              className="text-lg sm:text-xl lg:text-2xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3 text-gray-700 dark:text-gray-300 scroll-mt-20" 
              {...props}
            >
              {children}
            </h3>
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            // Detectar si es un TaskCheckbox (bloque de código con lenguaje task-checkbox)
            if (!inline && className && className.includes('language-task-checkbox')) {
              try {
                const content = Array.isArray(children) ? children.join('') : String(children);
                const jsonMatch = content.trim();
                if (jsonMatch) {
                  const { taskId, label, defaultResolved } = JSON.parse(jsonMatch);
                  return <TaskCheckbox key={taskId} taskId={taskId} label={label} defaultResolved={defaultResolved || false} />;
                }
              } catch (e) {
                console.error('Error parsing TaskCheckbox:', e);
              }
            }
            
            if (inline) {
              return (
                <code 
                  className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700" 
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code 
                className="block bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 my-4" 
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, children, ...props }) => (
            <pre 
              className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg overflow-x-auto mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700 shadow-sm" 
              {...props}
            >
              {children}
            </pre>
          ),
          ul: ({ node, children, ...props }) => (
            <ul 
              className="list-disc list-outside mb-4 sm:mb-6 space-y-2 sm:space-y-3 ml-4 sm:ml-6 text-gray-700 dark:text-gray-300" 
              {...props}
            >
              {children}
            </ul>
          ),
          ol: ({ node, children, ...props }) => (
            <ol 
              className="list-decimal list-outside mb-4 sm:mb-6 space-y-2 sm:space-y-3 ml-4 sm:ml-6 text-gray-700 dark:text-gray-300" 
              {...props}
            >
              {children}
            </ol>
          ),
          li: ({ node, children, ...props }) => (
            <li 
              className="ml-2 sm:ml-4 leading-relaxed" 
              {...props}
            >
              {children}
            </li>
          ),
          blockquote: ({ node, children, ...props }) => (
            <blockquote 
              className="border-l-4 border-blue-500 pl-4 sm:pl-6 italic my-4 sm:my-6 text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 py-3 sm:py-4 rounded-r-lg" 
              {...props}
            >
              {children}
            </blockquote>
          ),
          p: ({ node, children, ...props }) => (
            <p 
              className="mb-3 sm:mb-4 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base" 
              {...props}
            >
              {children}
            </p>
          ),
          strong: ({ node, children, ...props }) => (
            <strong 
              className="font-bold text-gray-900 dark:text-gray-100" 
              {...props}
            >
              {children}
            </strong>
          ),
          hr: ({ node, ...props }) => (
            <hr 
              className="my-6 sm:my-8 border-gray-200 dark:border-gray-700" 
              {...props}
            />
          ),
          table: ({ node, children, ...props }) => (
            <div className="overflow-x-auto my-4 sm:my-6">
              <table 
                className="min-w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg" 
                {...props}
              >
                {children}
              </table>
            </div>
          ),
          th: ({ node, children, ...props }) => (
            <th 
              className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100" 
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ node, children, ...props }) => (
            <td 
              className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-700 dark:text-gray-300" 
              {...props}
            >
              {children}
            </td>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

