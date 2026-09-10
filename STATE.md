# STATE — Portfólio (flavioricardo/flavioricardo)

**Última sessão:** 2026-09-10 (sessão 2)
**No ar:** https://fmeira.dev/ serve hoje apenas uma página de "temporariamente fora do ar" — o site foi retirado do ar a pedido do Flávio em 2026-09-10. O domínio, o GitHub Pages e o workflow de deploy continuam ativos. A última versão completa do `index.html` está no commit `012b928` (blob `b912b1c`); restaurar é `git checkout 012b928 -- index.html` e mergear na `main`.

## Estado atual

**Fora do ar desde 2026-09-10.** O `index.html` da `main` é um placeholder estático (sem JS, sem fontes externas, sem links, `noindex`) com um recado bilíngue e nada mais. Tudo abaixo descreve o site completo, que segue intacto no histórico do git e volta com um único checkout.

Site pessoal completo em um único `index.html` sem dependências de build, publicado no GitHub Pages via `.github/workflows/pages.yml` (deploy automático a cada push na `main`). 12 PRs mesclados nesta sessão, último deploy verde (run #13, commit `9e15878`).

- **Conteúdo:** hero, 4 cases comerciais (iFood Order Manager, Magalu e-commerce, Ascensus 401(k), Conductor AISP + Bricks), 7 soluções sob medida (Movva Mais, Cardápio Zap, Agenda Fácil, Claru, Storyline — ex-Trajeto, agora em storyline.fmeira.dev —, Pelota, Petree Partners), sobre, ferramentas, experiência completa com datas, contato.
- **Bilíngue PT/EN** e **tema claro/escuro**, ambos com persistência em localStorage.
- **Animações GSAP** (core + ScrollTrigger + DrawSVG via CDN) como progressive enhancement.
- **Sem indexação:** meta robots + `robots.txt` bloqueiam buscadores e crawlers de IA.
- **Acessibilidade:** axe-core reporta zero violações WCAG AA nos dois temas.

## Decisões de arquitetura

- **HTML único, zero build.** Conteúdo e i18n vivem em objetos JS dentro do próprio arquivo; o Pages serve a raiz do repositório direto.
- **Identidade "folha de especificação":** grid de papel milimetrado, Archivo Black no display, IBM Plex Mono nas anotações, acento redline `#c03d17` / `#f0603c`. Cada produto é ilustrado por um wireframe desenhado em DOM (não imagem) da sua UI real.
- **GSAP degrada em silêncio:** se o CDN falhar ou o usuário pedir `prefers-reduced-motion`, a página renderiza estática e completa. Os ScrollTriggers são recriados a cada troca de tema/idioma porque o render reconstrói o DOM.
- **Produtos não lançados** aparecem com o domínio futuro borrado (`filter: blur`, `aria-hidden`) e o link desabilitado como SOON/EM BREVE.
- **Fontes pelo Google Fonts** (único recurso render-blocking).
- **Sem artifact de pré-visualização.** A revisão de qualquer mudança acontece no site publicado (https://fmeira.dev/) depois do merge; o artifact que existiu durante a construção foi descontinuado a pedido do Flávio em 2026-07-30.

## Pendências

- [ ] **Colocar o site de volta no ar quando o Flávio pedir** — `git checkout 012b928 -- index.html`, commit e merge na `main`; o deploy é automático. | Bloqueia: o portfólio inteiro está invisível. | Aberta desde: 2026-09-10 (sessão 2)
- [ ] **Informar a URL de Agenda Fácil quando lançar** — hoje o card está em SOON com domínio borrado; a troca é de 2 linhas. | Bloqueia: 1 dos 6 produtos não pode ser visitado por quem lê o site. | Aberta desde: 2026-07-30 (sessão 1)
- [x] ~~**Abrir https://movvamais.app/ no navegador e confirmar que carrega com HTTPS válido**~~ — confirmado pelo Flávio: o domínio está correto e no ar. | Resolvida em: 2026-07-30 (sessão 1)
- [x] ~~**Apontar o domínio claru.app para o app**~~ — decisão do Flávio: `flavioricardo.github.io/claru` é a URL correta do Claru; não haverá troca de domínio. | Resolvida em: 2026-07-30 (sessão 1)

## Próximos passos (opcionais, não bloqueiam)

- **Conteúdo estático no HTML** — hoje todo texto vem do JS; sem JavaScript a página é um esqueleto. Servir o EN estático e deixar o JS só trocar idioma é o refactor de resiliência que ficou de fora da auditoria.
- **`og:image`** — o preview de link mostra título e descrição, mas sem imagem.
- **Depoimento de cliente ou colega** (uma frase, nome e cargo) nos cases de "Trabalho em escala" — a prova social que nenhum wireframe substitui.

## Threads abertas em outros repositórios

- **Página de login sem link de volta para a landing** — mencionado em 2026-07-30 sobre um dos produtos (provavelmente Cardápio Zap ou Movva Mais); a mensagem foi interrompida antes de identificar qual. Precisa de acesso ao repositório do produto para resolver.
