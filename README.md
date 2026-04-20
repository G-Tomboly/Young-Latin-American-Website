# Young Latin American — Website

Plataforma de divulgação científica juvenil para jovens pesquisadores da América Latina.

## Estrutura do site

```
yla-site/
├── index.html          # Home
├── publicacoes.html    # Lista de publicações
├── artigo.html         # Página do artigo (exemplo)
├── enviar.html         # Formulário de submissão
├── sobre.html          # Sobre o projeto
├── diretrizes.html     # Diretrizes de publicação
├── faq.html            # Perguntas frequentes
├── acoes.html          # Programas e iniciativas
├── contato.html        # Contato
├── styles.css          # Estilos globais
├── main.js             # JavaScript
└── render.yaml         # Configuração Render
```

## Deploy no Render

### Opção 1: Deploy via GitHub (recomendado)

1. Suba o conteúdo da pasta `yla-site/` para um repositório GitHub
2. Acesse [render.com](https://render.com) e crie uma conta
3. Clique em **"New +"** → **"Static Site"**
4. Conecte ao seu repositório GitHub
5. Configure:
   - **Name:** `young-latin-american`
   - **Branch:** `main`
   - **Build Command:** deixe em branco ou coloque `echo "static"`
   - **Publish Directory:** `.` (ou o nome da pasta se você subiu dentro de uma pasta)
6. Clique em **"Create Static Site"**
7. O Render faz o deploy automaticamente em ~1 minuto

### Opção 2: Deploy manual via Render CLI

```bash
npm install -g @render-cli/render
render deploy --dir ./yla-site
```

## Personalização futura

- Substituir artigos de exemplo por conteúdo real
- Integrar um CMS headless (Contentful, Sanity, etc.) para gerenciar publicações
- Adicionar backend para processar o formulário de submissão (ex: Formspree, EmailJS ou Node.js)
- Configurar domínio personalizado no painel do Render

## Tecnologias

- HTML5 semântico
- CSS3 com variáveis CSS (design system próprio)
- JavaScript vanilla (sem dependências)
- Google Fonts: Syne, DM Sans, DM Serif Display
- Deploy: Render (Static Site)

## Identidade visual

- **Azul principal:** #2563eb / #0a1628
- **Laranja destaque:** #f97316
- **Branco/Cinza base:** #ffffff / #f9fafb
- **Fontes:** Syne (display/headings), DM Sans (body), DM Serif Display (citações)
