# Young Latin American — Website

Plataforma jovem latino-americana com três frentes complementares: **revista científica**, **Opportunities** (bolsas, cursos, programas, competições e estágios) e **Youth Map** (mapa de iniciativas estudantis).

O ZIP contém o site estático completo, mantendo as páginas e o painel já existentes. As duas novas áreas são administradas pelo Supabase: não há oportunidades ou projetos inventados pré-cadastrados.

## Novidades implementadas

- **`opportunities.html`:** diretório de oportunidades publicadas pela equipe, com busca, filtro de categoria, país, modalidade e inscrições abertas. Links levam à página oficial das organizações. Datas encerradas são ocultadas por padrão, mas podem ser vistas desmarcando o filtro.
- **`youth-map.html`:** mapa interativo baseado em Leaflet/OpenStreetMap, busca por iniciativa, área e país, seleção de localização opcional para ordenar por proximidade, lista de projetos e formulário gratuito de cadastramento. Projetos enviados ficam **pendentes** até aprovação editorial.
- **`admin.html`:** novas abas **Opportunities** (criar, editar, publicar, ocultar e excluir) e **Youth Map** (avaliar, aprovar, rejeitar, excluir e configurar localização aproximada).
- **Página inicial, Sobre e Ações:** apresentação do problema de acesso, conexão e visibilidade e dos dois produtos que compõem o ecossistema. Navegação e rodapés atualizados.
- **`supabase_ecossistema.sql`:** tabelas, políticas e índices novos. Não altera nem apaga os artigos científicos existentes.

## ⚠️ Ativação no Supabase (obrigatória)

Sem esta etapa o layout abre normalmente, mas **não é possível carregar oportunidades nem cadastrar projetos**.

1. Acesse o **mesmo projeto Supabase** já configurado no arquivo `supabase.js`.
2. Abra **SQL Editor → New query** no painel Supabase.
3. Copie o conteúdo inteiro de `supabase_ecossistema.sql`, cole e clique em **Run**.
4. Verifique em **Table Editor** as tabelas `oportunidades` e `projetos_juvenis`.
5. Faça login no painel **`admin.html`** com a conta Supabase Auth usada pela equipe editorial. Abra **Opportunities**, cadastre e publique oportunidades reais, com fonte oficial e prazo correto. Depois abra **Youth Map** para revisar e aprovar projetos recebidos.
6. Envie os arquivos alterados para o repositório do site/Render (sem alterar o arquivo `supabase.js`, pois ele já está configurado para o projeto existente).

> **Importante sobre segurança:** As novas políticas do SQL seguem o padrão atual do painel: **qualquer usuário autenticado no Supabase** tem privilégios editoriais nessas tabelas. Enquanto esse padrão for usado, **mantenha o cadastro público de usuários desativado e controle estritamente as contas no Supabase Auth**. Antes de criar contas para o público, implemente uma lista de editores autorizados e endureça também as políticas existentes das pesquisas e contatos.

## Como publicar conteúdos

### Opportunities

No painel de administração, clique na aba **Opportunities**, preencha título, organização, categoria, país/abrangência, modalidade, descrição, URL oficial e prazo final, se houver. Salve como **Rascunho** ou **Publicado**. A equipe deve verificar se a inscrição está realmente aberta; o site apenas compara a data informada ao dia atual, não verifica automaticamente o status na instituição.

### Youth Map

No site, uma pessoa pode enviar projeto, descrição, tema, cidade/país, nome público da equipe e site/perfil **público** (opcional). A equipe revisa o conteúdo no admin antes de publicar. O mapa usa coordenadas aproximadas de grandes cidades ou de países, nunca dados de endereço residencial. O editor pode definir coordenadas **aproximadas**, ou usar o botão **Encontrar cidade** (consulta manual ao serviço público Nominatim/OpenStreetMap) e então salvar. Para cidades pequenas, ajustar o centro da cidade no painel melhora a localização e a busca por proximidade.

O botão **Projetos perto de mim** pede permissão ao navegador. A posição serve apenas para ordenar a lista no dispositivo do visitante e não é salva pelo código do site.

## Estrutura

```text
index.html                 Página inicial
sobre.html                 Contexto e objetivos do projeto
acoes.html                 Iniciativas e programas
opportunities.html         Canal de oportunidades

youth-map.html             Mapa e inscrição de projetos
admin.html                 Painel editorial existente + duas novas abas
publicacoes.html           Revista: lista de pesquisas
artigo.html                Revista: leitura de pesquisa
enviar.html                Revista: submissão científica
diretrizes.html            Diretrizes de publicação
faq.html                   Perguntas frequentes
contato.html               Contato
styles.css                 CSS global original, com ajuste responsivo na navegação
ecossistema.css            CSS das novas áreas
main.js                    Funcionalidades originais
supabase.js                Conexão Supabase original
ecossistema.js             Busca, mapa e envio de projetos
admin_ecossistema.css      Aparência das novas abas do painel
admin_ecossistema.js       Gestão de oportunidades e moderação de projetos
supabase_ecossistema.sql   Migração SQL para os novos conteúdos
```

## Publicar no Render

O site continua **estático** (HTML + CSS + JavaScript), sem processo de build. Configure no Render **Static Site**, Build Command vazio ou `echo static` e Publish Directory `.` quando os arquivos estiverem na raiz do repositório. Serviços externos utilizados: Supabase, bibliotecas Supabase JS e Leaflet via CDN, OpenStreetMap tiles e, ao pedir manualmente no admin, Nominatim para consulta de centro de cidade.

**Não é necessário enviar o ZIP dentro da aplicação.** Extraia o conteúdo e use os arquivos da pasta como raiz do site. Não armazene chaves `service_role` ou segredos do Supabase no frontend; o arquivo existente contém apenas a chave pública (`anon`) destinada ao navegador.
