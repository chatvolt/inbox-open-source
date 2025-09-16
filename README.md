# Inbox Open-Source - Chatvolt

Bem-vindo ao projeto Inbox Open-Source da Chatvolt! Esta é uma aplicação full-stack que fornece uma interface de caixa de entrada completa e personalizável para gerenciar conversas da plataforma Chatvolt. A aplicação é dividida em um back-end (middleware) construído com Fastify e um front-end moderno construído com Next.js e Material-UI.

## Visão Geral

O objetivo deste projeto é oferecer uma solução de inbox robusta e de código aberto, permitindo que os desenvolvedores a utilizem, personalizem e integrem facilmente com a API da Chatvolt. O back-end atua como um proxy seguro que gerencia a comunicação com a API principal da Chatvolt, enquanto o front-end oferece uma experiência de usuário rica e reativa para os agentes.

---

## 🚀 Principais Funcionalidades

### Front-End

-   **Interface de Inbox Completa:** Visualize e gerencie todas as suas conversas em um só lugar.
-   **Lista de Conversas com Scroll Infinito:** Carregue conversas de forma eficiente à medida que rola a lista.
-   **Filtros Avançados e Pesquisa:**
    -   Pesquise por nome de usuário ou conteúdo da conversa.
    -   Filtre por status (Não Resolvida, Resolvida, Solicitação Humana).
    -   Filtre por prioridade, canal e etiquetas (tags).
-   **Janela de Chat em Tempo Real:**
    -   Visualize o histórico de mensagens completo com scroll infinito para carregar mensagens mais antigas.
    -   Envie mensagens como agente quando a IA estiver desativada.
    -   Indicador visual claro quando a IA está desligada.
-   **Painel de Detalhes da Conversa:**
    -   Altere o **Status** e a **Prioridade** da conversa.
    -   Adicione e remova **Etiquetas (Tags)** para organização.
    -   **Intervenha na IA:** Pause e reative a automação da IA com um único clique.
    -   Visualize e delete **Variáveis da Conversa**.
-   **Alta Personalização de Tema:**
    -   Alterne entre os modos **Claro (Light)** e **Escuro (Dark)**.
    -   Personalize o **Nome da Aplicação** e a **URL do Logo**.
    -   Modifique todas as cores primárias e secundárias da interface.
    -   Salve, aplique e delete seus próprios **temas customizados**.
-   **Design Responsivo:** Experiência de uso otimizada para desktops, tablets e dispositivos móveis.

### Back-End

-   **Middleware Seguro:** Atua como um proxy entre o front-end e a API da Chatvolt, protegendo sua `API_KEY`.
-   **API RESTful com Fastify:** Endpoints rápidos e eficientes para todas as operações do front-end.
-   **Validação com Zod:** Garante a segurança e a integridade dos dados que entram e saem da API.
-   **Documentação de API:** Gera automaticamente uma documentação interativa com Swagger/Scalar em ambiente de desenvolvimento.

---

## 🛠️ Tecnologias Utilizadas

| Área        | Tecnologia                                                                                              |
| :---------- | :------------------------------------------------------------------------------------------------------ |
| **Front-End** | [Next.js](https://nextjs.org), [React](https://reactjs.org), [TypeScript](https://www.typescriptlang.org), [Material-UI (MUI)](https://mui.com), [Zustand](https://github.com/pmndrs/zustand) |
| **Back-End**  | [Node.js](https://nodejs.org), [Fastify](https://www.fastify.io), [TypeScript](https://www.typescriptlang.org), [Zod](https://zod.dev), [Dotenv](https://github.com/motdotla/dotenv) |

---

## ⚙️ Instalação e Execução

Siga os passos abaixo para configurar e executar o projeto localmente.

### Pré-requisitos

-   [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
-   [npm](https://www.npmjs.com), [yarn](https://yarnpkg.com), ou [pnpm](https://pnpm.io)
-   Uma **API Key** válida da plataforma Chatvolt.

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/inbox-open-source.git
cd inbox-open-source
```

### 2. Configurar o Back-End

O back-end é responsável por se comunicar com a API da Chatvolt.

```bash
# 1. Navegue até a pasta do back-end
cd back_end

# 2. Crie o arquivo de variáveis de ambiente
# No Windows (prompt):
copy .env.example .env
# No Linux/macOS:
cp .env.example .env

# 3. Abra o arquivo .env e adicione sua API Key
# Exemplo: API_KEY=sua_chave_secreta_aqui

# 4. Instale as dependências
npm install

# 5. Inicie o servidor em modo de desenvolvimento
npm run dev
```

O servidor back-end estará rodando em `http://localhost:3001`.

### 3. Configurar o Front-End

O front-end é a interface de usuário com a qual você irá interagir.

```bash
# 1. Abra um novo terminal e navegue até a pasta do front-end
cd front_end

# 2. Instale as dependências
npm install

# 3. Inicie a aplicação Next.js
npm run dev
```

A aplicação front-end estará disponível em `http://localhost:3000`.

### 4. Acessar a Aplicação

Abra seu navegador e acesse **[http://localhost:3000](http://localhost:3000)** para ver a aplicação em funcionamento.

---

## 📖 Documentação da API do Back-End

Quando o servidor back-end está rodando em modo de desenvolvimento (`npm run dev`), você pode acessar uma documentação interativa da API gerada pelo Scalar.

-   **URL da Documentação:** [http://localhost:3001/docs](http://localhost:3001/docs)

Lá você encontrará todos os endpoints disponíveis no middleware, seus parâmetros e os schemas de resposta.

---

## 🎨 Personalização

Uma das funcionalidades mais poderosas deste projeto é a capacidade de personalizar a aparência da aplicação.

1.  Clique no ícone de **Configurações (engrenagem)** no canto superior direito.
2.  Na janela modal, você pode:
    -   Alterar o **Nome da Aplicação** e a **URL do Logo**.
    -   Mudar as cores dos temas claro e escuro.
    -   Salvar suas customizações como um novo tema para aplicá-lo mais tarde.
    -   Restaurar as configurações para o padrão.

Clique em **"Aplicar"** para ver as mudanças refletidas em tempo real.