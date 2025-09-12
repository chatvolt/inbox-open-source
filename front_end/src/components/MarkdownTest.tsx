"use client"

import { MarkdownRenderer } from './MarkdownRenderer'

const testMarkdown = `# Teste de Markdown

Este é um **texto em negrito** e este é *texto em itálico*.

## Lista de itens:
- Item 1
- Item 2 com **negrito**
- Item 3

### Código:
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
  return "markdown funcionando!";
}
\`\`\`

> Esta é uma citação em markdown
> que pode ter múltiplas linhas

### Tabela:
| Nome | Idade | Cidade |
|------|-------|--------|
| João | 25    | SP     |
| Maria| 30    | RJ     |

### Link:
[Clique aqui](https://example.com) para ver um link.

### Código inline:
Use \`console.log()\` para debug.`

export function MarkdownTest() {
  return (
    <div className="p-4 border rounded-lg bg-background">
      <h3 className="text-lg font-semibold mb-4">Teste de Renderização Markdown</h3>
      <MarkdownRenderer content={testMarkdown} />
    </div>
  )
}