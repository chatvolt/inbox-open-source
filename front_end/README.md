# Inbox Chatvolt - Open Source

Bem-vindo ao Inbox Chatvolt Open Source! Uma caixa de entrada de conversas rica em funcionalidades, projetada para centralizar e gerenciar interações de múltiplos canais. Construída com uma stack de tecnologia moderna, ela oferece uma interface de usuário limpa, capacidades de filtragem poderosas e opções de personalização extensivas.

Este projeto é dividido em um front-end **Next.js** e um back-end **Fastify** que atua como um middleware seguro para a API da Chatvolt.

## 📸 Screenshots

### Tema Escuro (Padrão)
![Dark Theme Interface](front_end/public/image-exemple-dark.png)

### Tema Claro
![Light Theme Interface](front_end/public/image-exemple-white.png)

### Personalização Avançada
![Settings and Customization Panel](front_end/public/exemple-image-configuratios.png)

## ✨ Funcionalidades Principais

-   **Caixa de Entrada Unificada**: Visualize e gerencie conversas de todos os canais conectados em um só lugar.
-   **Chat em Tempo Real**: Interaja com os usuários em uma interface de chat familiar e intuitiva.
-   **Controle da IA**: Ative ou desative a automação da IA para qualquer conversa, permitindo intervenção humana sempre que necessário.
-   **Filtros Avançados e Busca**: Encontre conversas rapidamente por status (não resolvida, resolvida, solicitação humana), prioridade, canal, etiquetas ou através de uma busca por texto.
-   **Gerenciamento de Conversas**: Atualize o status e a prioridade da conversa, adicione ou remova etiquetas para melhor organização, e visualize/delete variáveis da conversa.
-   **Scroll Infinito**: Carregue conversas de forma eficiente à medida que você rola a lista.
-   **Personalização Profunda**:
    -   Alterne facilmente entre os temas claro e escuro.
    -   Personalize o nome e o logo da aplicação.
    -   Ajuste a paleta de cores para ambos os temas diretamente do painel de configurações.
    -   Salve e gerencie múltiplos temas personalizados.
-   **Design Responsivo**: Uma experiência fluida tanto em desktops quanto em dispositivos móveis.

## 🛠️ Stack Tecnológica

-   **Front-end**:
    -   **Framework**: Next.js (com Turbopack)
    -   **Linguagem**: TypeScript
    -   **UI**: Material-UI (MUI)
    -   **Gerenciamento de Estado**: Zustand
    -   **Estilização**: Emotion & CSS Globals

-   **Back-end**:
    -   **Framework**: Fastify
    -   **Linguagem**: TypeScript
    -   **Validação**: Zod
    -   **Ambiente**: Node.js

## 🚀 Como Começar

### Pré-requisitos
-   Node.js (versão 18 ou superior)
-   Um gerenciador de pacotes (npm, yarn, ou pnpm)
-   Uma chave de API da Chatvolt

### 1. Configuração do Back-end

O back-end atua como um proxy seguro que adiciona sua `API_KEY` a cada requisição para a API da Chatvolt.

```bash
# 1. Navegue até o diretório do back-end
cd back_end

# 2. Instale as dependências
npm install

# 3. Crie um arquivo de ambiente copiando o exemplo
cp .env.example .env

# 4. Edite o arquivo .env e adicione sua chave da API da Chatvolt
# Substitua 'your_api_key_here' pela sua chave real
API_KEY=your_api_key_here

# 5. Inicie o servidor de desenvolvimento
npm run dev
```
O servidor back-end estará rodando em `http://localhost:3001`.

### 2. Configuração do Front-end

```bash
# 1. Navegue até o diretório do front-end
cd front_end

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```
Abra seu navegador e acesse `http://localhost:3000` para ver a aplicação em funcionamento.

## 📚 Documentação da API

Com o servidor back-end rodando em modo de desenvolvimento, você pode acessar a documentação da API, que é gerada automaticamente. Isso fornece uma referência completa para todos os endpoints de middleware disponíveis.

Acesse: [http://localhost:3001/docs](http://localhost:3001/docs)

---