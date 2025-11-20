'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none" style={{
      padding: '1.5rem',
      lineHeight: '1.8',
    }}>
      <style jsx global>{`
        .prose {
          color: #374151;
        }
        .prose h1 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.2;
        }
        .prose h2 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.3;
        }
        .prose h3 {
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
        }
        .prose p {
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .prose ul, .prose ol {
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
        }
        .prose li {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .prose code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        .prose pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .prose pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }
        .prose blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin-left: 0;
          margin-top: 1rem;
          margin-bottom: 1rem;
          color: #6b7280;
        }
        .prose hr {
          margin-top: 2rem;
          margin-bottom: 2rem;
          border: none;
          border-top: 1px solid #e5e7eb;
        }
        .prose table {
          width: 100%;
          margin-top: 1rem;
          margin-bottom: 1rem;
          border-collapse: collapse;
        }
        .prose table th,
        .prose table td {
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        .prose table th {
          background-color: #f9fafb;
          font-weight: 600;
        }
      `}</style>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

