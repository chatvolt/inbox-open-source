/**
 * Detecta se o texto contém sintaxe markdown
 */
export function hasMarkdownSyntax(text: string): boolean {
  if (!text) return false
  
  // Padrões comuns de markdown
  const markdownPatterns = [
    /\*\*.*\*\*/,           // **bold**
    /\*.*\*/,               // *italic*
    /__.*__/,               // __bold__
    /_.*_/,                 // _italic_
    /`.*`/,                 // `code`
    /```[\s\S]*```/,        // ```code block```
    /^#{1,6}\s/m,           // # headers
    /^\s*[-*+]\s/m,         // - list items
    /^\s*\d+\.\s/m,         // 1. numbered lists
    /^\s*>\s/m,             // > blockquotes
    /\[.*\]\(.*\)/,         // [link](url)
    /!\[.*\]\(.*\)/,        // ![image](url)
    /\|.*\|/,               // | table |
    /^---+$/m,              // --- horizontal rule
    /~~.*~~/,               // ~~strikethrough~~
  ]
  
  return markdownPatterns.some(pattern => pattern.test(text))
}

/**
 * Detecta se o texto é principalmente código
 */
export function isCodeBlock(text: string): boolean {
  if (!text) return false
  
  // Se começa e termina com ```
  if (text.trim().startsWith('```') && text.trim().endsWith('```')) {
    return true
  }
  
  // Se tem muitas linhas que parecem código
  const lines = text.split('\n')
  const codeLines = lines.filter(line => {
    const trimmed = line.trim()
    return trimmed.includes('(') && trimmed.includes(')') ||
           trimmed.includes('{') && trimmed.includes('}') ||
           trimmed.includes('[') && trimmed.includes(']') ||
           trimmed.includes(';') ||
           trimmed.includes('=') ||
           /^\s*\/\//.test(trimmed) ||  // comentários //
           /^\s*\/\*/.test(trimmed) ||  // comentários /*
           /^\s*#/.test(trimmed)        // comentários #
  })
  
  return codeLines.length > lines.length * 0.5
}

/**
 * Limpa e prepara o texto para renderização markdown
 */
export function prepareMarkdownContent(text: string): string {
  if (!text) return ''
  
  // Remove espaços extras no início e fim
  let cleaned = text.trim()
  
  // Corrige quebras de linha duplas
  cleaned = cleaned.replace(/\n\n\n+/g, '\n\n')
  
  // Corrige listas que podem estar mal formatadas
  cleaned = cleaned.replace(/^(\s*)[-*+](\S)/gm, '$1- $2')
  
  return cleaned
}