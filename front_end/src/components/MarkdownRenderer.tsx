"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { hasMarkdownSyntax, prepareMarkdownContent } from '@/utils/markdown'
import '@/styles/markdown.css'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Preparar e limpar o conteúdo
  const cleanContent = prepareMarkdownContent(content)
  
  // Detectar se o conteúdo tem sintaxe markdown
  const isMarkdown = hasMarkdownSyntax(cleanContent)
  
  // Se não é markdown, renderizar como texto simples com quebras de linha
  if (!isMarkdown) {
    return (
      <div className={`text-sm ${className}`}>
        {cleanContent.split('\n').map((line, index) => (
          <p key={index} className={index > 0 ? 'mt-2' : ''}>
            {line || '\u00A0'} {/* Non-breaking space para linhas vazias */}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Customizar links para abrir em nova aba
          a: ({ href, children, ...props }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              {...props}
            >
              {children}
            </a>
          ),
          // Customizar código inline
          code: ({ children, ...props }) => (
            <code 
              className="bg-muted px-1 py-0.5 rounded text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          ),
          // Customizar blocos de código
          pre: ({ children, ...props }) => (
            <pre 
              className="bg-muted p-3 rounded-md overflow-x-auto"
              {...props}
            >
              {children}
            </pre>
          ),
          // Customizar blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote 
              className="border-l-4 border-primary pl-4 italic text-muted-foreground"
              {...props}
            >
              {children}
            </blockquote>
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  )
}