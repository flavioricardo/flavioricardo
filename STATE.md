# STATE — Portfólio (flavioricardo/flavioricardo)

**Última sessão:** 2026-07-30 (sessão 1)
**No ar:** https://flavioricardo.github.io/flavioricardo/

## Estado atual

Site pessoal completo em um único `index.html` sem dependências de build, publicado no GitHub Pages via `.github/workflows/pages.yml` (deploy automático a cada push na `main`). 12 PRs mesclados nesta sessão, último deploy verde (run #13, commit `9e15878`).

- **Conteúdo:** hero, 4 cases comerciais (iFood Order Manager, Magalu e-commerce, Ascensus 401(k), Conductor AISP + Bricks), 6 soluções sob medida, sobre, ferramentas, experiência completa com datas, contato.
- **Bilíngue PT/EN** e **tema claro/escuro**, ambos com persistência em localStorage.
- **Animações GSAP** (core + ScrollTrigger + DrawSVG via CDN) como progressive enhancement.
- **Sem indexação:** meta robots + `robots.txt` bloqueiam buscadores e crawlers de IA.
- **Acessibilidade:** axe-core reporta zero violações WCAG AA nos dois temas.

## Decisões de arquitetura

- **HTML único, zero build.** Conteúdo e i18n vivem em objetos JS dentro do próprio arquivo; o Pages serve a raiz do repositório direto.
- **Identidade "folha de especificação":** grid de papel milimetrado, Archivo Black no display, IBM Plex Mono nas anotações, acento redline `#c03d17` / `#f0603c`. Cada produto é ilustrado por um wireframe desenhado em DOM (não imagem) da sua UI real.
- **GSAP degrada em silêncio:** se o CDN falhar ou o usuário pedir `prefers-reduced-motion`, a página renderiza estática e completa. Os ScrollTriggers são recriados a cada troca de tema/idioma porque o render reconstrói o DOM.
- **Produtos não lançados** aparecem com o domínio futuro borrado (`filter: blur`, `aria-hidden`) e o link desabilitado como SOON/EM BREVE.
- **Fontes pelo Google Fonts** (único recurso render-blocking); a build do artifact de pré-visualização embute fontes e GSAP porque o CSP de artifacts bloqueia CDNs.

## Pendências

- [ ] **Informar as URLs de Agenda Fácil e Trajeto quando lançarem** — hoje os dois cards estão em SOON com domínio borrado; a troca é de 2 linhas por produto. | Bloqueia: 2 dos 6 produtos não podem ser visitados por quem lê o site. | Aberta desde: 2026-07-30 (sessão 1)
- [x] ~~**Abrir https://movvamais.app/ no navegador e confirmar que carrega com HTTPS válido**~~ — confirmado pelo Flávio: o domínio está correto e no ar. | Resolvida em: 2026-07-30 (sessão 1)
- [x] ~~**Apontar o domínio claru.app para o app**~~ — decisão do Flávio: `flavioricardo.github.io/claru` é a URL correta do Claru; não haverá troca de domínio. | Resolvida em: 2026-07-30 (sessão 1)

## Próximos passos (opcionais, não bloqueiam)

- **Conteúdo estático no HTML** — hoje todo texto vem do JS; sem JavaScript a página é um esqueleto. Servir o EN estático e deixar o JS só trocar idioma é o refactor de resiliência que ficou de fora da auditoria.
- **`og:image`** — o preview de link mostra título e descrição, mas sem imagem.
- **Depoimento de cliente ou colega** (uma frase, nome e cargo) nos cases de "Trabalho em escala" — a prova social que nenhum wireframe substitui.
- **Domínio próprio para o portfólio** (Settings → Pages → Custom domain).

## Threads abertas em outros repositórios

- **Página de login sem link de volta para a landing** — mencionado em 2026-07-30 sobre um dos produtos (provavelmente Cardápio Zap ou Movva Mais); a mensagem foi interrompida antes de identificar qual. Precisa de acesso ao repositório do produto para resolver.
