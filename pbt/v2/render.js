// SPIKE v2 — monta as camadas SVG do palco a partir de shapes.json.
// Espaço do palco: 1536×1024. O mapa (PNG 1800×1500) entra em "cover" com object-position 50% 75%:
// scale 1536/1800 e translate(0,-192). Tudo que é do mapa vive dentro de #map e é escalado junto no zoom.
export const MAP_S = 1536 / 1800;
export const MAP_DY = -192;
export const S4 = 1536 / (420 * MAP_S);   // zoom do passo 4: 420 px do PNG preenchem a largura do palco
// mapa detalhado de Ward/Crane (slide 5): tamanho e caixa da acreage laranja, medidos com trace.py
const CRANE = { w: 1093, h: 766, box: [221, 200, 860, 590] };
const NS = 'http://www.w3.org/2000/svg';
const NAVY = '#1b2b3a';
const PAPER = 'rgb(250,250,250)';
const BASIN = {                                   // preenchimento e traço do PNG da Jen
  delaware: { fill: 'rgb(227,219,204)', stroke: 'rgb(112,72,0)' },
  cbp: { fill: 'rgb(242,244,248)', stroke: 'rgb(96,112,120)' },
  midland: { fill: 'rgb(252,242,224)', stroke: 'rgb(240,192,96)' },
};

function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}
const d = ring => 'M' + ring.map(p => p.join(' ')).join('L') + 'Z';
const dAll = rings => rings.map(d).join('');
/** Contorno suave: curva quadrática de ponto médio a ponto médio, com o vértice como controle — sem cantos nem pontas. */
function dRound(ring) {
  const n = ring.length, mid = i => [(ring[i % n][0] + ring[(i + 1) % n][0]) / 2, (ring[i % n][1] + ring[(i + 1) % n][1]) / 2];
  let s = 'M' + mid(0).join(' ');
  for (let i = 1; i <= n; i++) s += 'Q' + ring[i % n].join(' ') + ' ' + mid(i).join(' ');
  return s + 'Z';
}
/** Uma forma de luz do menu: anel [[x,y],…] (arredondado + margem), círculo {c:[x,y], r} ou linha {line:[[x,y],…], w}. */
function lightShape(shape, parent) {
  if (Array.isArray(shape)) return el('path', { d: dRound(shape), fill: '#000', stroke: '#000', 'stroke-width': 24, 'stroke-linejoin': 'round' }, parent);
  if (shape.c) {  // círculo {c, r} ou elipse {c, r:[rx, ry]}
    const [rx, ry] = Array.isArray(shape.r) ? shape.r : [shape.r, shape.r];
    return el('ellipse', { cx: shape.c[0], cy: shape.c[1], rx, ry, fill: '#000' }, parent);
  }
  return el('path', { d: 'M' + shape.line.map(p => p.join(' ')).join('L'), fill: 'none', stroke: '#000', 'stroke-width': shape.w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
}

function blur(defs, id, sd) {
  const f = el('filter', { id, x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
  el('feGaussianBlur', { stdDeviation: sd }, f);
  return f;
}

/** Máscara de luminância: branco = véu opaco; os "buracos" são formas pretas borradas. */
function spotMask(defs, id, w, h) {
  const m = el('mask', { id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: w, height: h }, defs);
  el('rect', { width: w, height: h, fill: '#fff' }, m);
  return m;
}

export function mapToStage([x, y]) {
  return [x * MAP_S, y * MAP_S + MAP_DY];
}

export async function build(svg, shapes, assets = '') {
  const m = shapes.map, il = shapes.illo;
  svg.setAttribute('viewBox', '0 0 1536 1024');
  const defs = el('defs', {}, svg);
  blur(defs, 'soft-map', 7);     // borda dos buracos das bacias (unidades do PNG; ~6 px no palco)
  blur(defs, 'soft-acre', 1.5);  // buraco da acreage: visto a ~6×, vira ~8 px
  blur(defs, 'soft-illo', 10);

  // ---------- mapa ----------
  const mapOuter = el('g', { id: 'map' }, svg);  // o zoom (GSAP) vai neste grupo, sem transform base
  const map = el('g', { id: 'map-base', transform: `translate(0 ${MAP_DY}) scale(${MAP_S})` }, mapOuter);
  const fillLayer = el('g', { id: 'vec-fill' }, map);  // papel + bacias preenchidas, POR BAIXO do PNG
  el('rect', { width: m.w, height: m.h, fill: PAPER }, fillLayer);
  for (const [name, ring] of Object.entries(m.basins)) el('path', { d: d(ring), fill: BASIN[name].fill }, fillLayer);
  const mapImg = el('image', { id: 'map-img', href: assets + 'map-permian.png', width: m.w, height: m.h, preserveAspectRatio: 'none' }, map);
  // traços por cima do PNG: nascem invisíveis (o PNG já desenha tudo isso; duplicar engrossava os contornos) e entram no zoom, quando o PNG some
  const vec = el('g', { id: 'vec', fill: 'none', opacity: 0 }, map);
  for (const c of m.counties) el('path', { d: d(c.points), stroke: 'rgb(176,176,176)', 'stroke-width': 1.5, 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round' }, vec);
  for (const [name, ring] of Object.entries(m.basins)) el('path', { d: d(ring), stroke: BASIN[name].stroke, 'stroke-width': 3, 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round' }, vec);
  for (const ring of m.minerals) el('path', { d: d(ring), fill: 'rgb(176,176,176)' }, vec);
  for (const ring of m.surface) el('path', { d: d(ring), stroke: 'rgb(200,120,0)', 'stroke-width': 2.5, 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round' }, vec);
  const labels = el('g', { id: 'labels', fill: 'rgb(150,150,150)', 'font-family': '"Noto Sans", sans-serif', 'font-size': 26 }, vec);
  for (const c of m.counties) {
    const t = el('text', { transform: `translate(${c.label[0]} ${c.label[1]})`, 'text-anchor': 'middle' }, labels);
    t.textContent = c.name;
  }
  const spotMap = spotMask(defs, 'spot-map', m.w, m.h);
  const holes = {};
  for (const [name, rings, filter] of [
    ['delaware', [m.basins.delaware], 'soft-map'], ['midland', [m.basins.midland], 'soft-map'],
    ['cbp', [m.basins.cbp], 'soft-map'], ['surface', m.surface, 'soft-acre'],
  ]) {
    holes[name] = el('g', { id: 'h-' + name, class: 'hole', opacity: 0 }, spotMap);
    el('path', { d: dAll(rings), fill: '#000', filter: `url(#${filter})` }, holes[name]);
  }
  const veilMap = el('rect', { id: 'veil-map', width: m.w, height: m.h, fill: NAVY, 'fill-opacity': 0.62, mask: 'url(#spot-map)', opacity: 0, visibility: 'hidden' }, map);

  // ---------- mapa Ward/Crane (passo 5) ----------
  // Alinhado pela acreage: mesma largura e mesmo centro que a acreage vetorial tem no palco com o zoom S4.
  const focal = mapToStage(m.focal);
  const xs = m.surface.flat().map(p => p[0]), ys = m.surface.flat().map(p => p[1]);
  const cPng = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  const cSt = mapToStage(cPng).map((v, i) => focal[i] + S4 * (v - focal[i]));
  const wSt = (Math.max(...xs) - Math.min(...xs)) * MAP_S * S4;
  const [bx0, by0, bx1, by1] = CRANE.box;
  const k = wSt / (bx1 - bx0);
  const tx = cSt[0] - k * (bx0 + bx1) / 2, ty = cSt[1] - k * (by0 + by1) / 2;
  const crane = el('g', { id: 'crane', opacity: 0, visibility: 'hidden' }, svg);
  const craneBase = el('g', { id: 'crane-base', transform: `translate(${tx} ${ty}) scale(${k})` }, crane);
  el('image', { href: assets + 'map-crane.png', width: CRANE.w, height: CRANE.h }, craneBase);
  // quanto o passo 5 precisa aproximar (em torno do foco) pra esse mapa cobrir o palco inteiro
  const [fx, fy] = focal;
  const craneZoom = Math.max(1.15,
    tx < fx ? fx / (fx - tx) : 9, (tx + k * CRANE.w) > fx ? (1536 - fx) / (tx + k * CRANE.w - fx) : 9,
    ty < fy ? fy / (fy - ty) : 9, (ty + k * CRANE.h) > fy ? (1024 - fy) / (ty + k * CRANE.h - fy) : 9);

  // ---------- ilustração ----------
  const illo = el('g', { id: 'illo', opacity: 0, visibility: 'hidden' }, svg);
  const piece = (id, clipAttr) => {
    const g = el('g', { id: 'piece-' + id, class: 'piece', opacity: 0 }, illo);
    el('image', { href: assets + 'illustration.webp', width: il.w, height: il.h, ...clipAttr }, g);
    return g;
  };
  const clip = (id, rings) => { const c = el('clipPath', { id }, defs); el('path', { d: dAll(rings) }, c); return `url(#${id})`; };
  // montagem em duas camadas: o bloco de solo (recorte) e, por cima, a imagem inteira — sem recortar os itens,
  // que deixavam buracos e emendas visíveis na arte de uma camada só
  const pieces = {};
  pieces.slab = piece('slab', { 'clip-path': clip('clip-slab', [il.slab]) });
  pieces.surface = piece('surface', {});

  const spotIllo = spotMask(defs, 'spot-illo', il.w, il.h);
  const menuHolesG = el('g', { id: 'menu-holes' }, spotIllo);
  const menuHoles = {};
  for (const g of ['1', '2', '3', '4']) {
    menuHoles[g] = el('g', { class: 'mhole', 'data-g': g, opacity: 0, filter: 'url(#soft-illo)' }, menuHolesG);
    for (const shape of il.groups[g]) lightShape(shape, menuHoles[g]);
  }
  const veilIllo = el('rect', { id: 'veil-illo', width: il.w, height: il.h, fill: NAVY, 'fill-opacity': 0.82, mask: 'url(#spot-illo)', opacity: 0 }, svg);

  return { map: mapOuter, mapImg, vec, labels, veilMap, holes, crane, craneZoom, illo, pieces, veilIllo, menuHoles, focal };
}
