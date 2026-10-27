// Helper de DOM: monta elementos sem usar innerHTML.
const SVG_NS = 'http://www.w3.org/2000/svg';

function apply(node, props) {
  let value;
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.setAttribute('class', v);
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') value = v;
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  return value;
}

export function append(node, children) {
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

// Troca os filhos de um nó ignorando null/false (replaceChildren escreveria "null" na tela).
export function trocar(node, ...children) {
  node.replaceChildren();
  return append(node, children);
}

export function el(tag, props, ...children) {
  const node = document.createElement(tag);
  const value = apply(node, props);
  append(node, children);
  if (value !== undefined) node.value = value; // depois dos filhos (necessário para <select>)
  return node;
}

export function svgEl(tag, props, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  apply(node, props);
  return append(node, children);
}

const ICONS = {
  inicio: [['path', { d: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z' }]],
  grupos: [['circle', { cx: 9, cy: 8, r: 3.5 }], ['path', { d: 'M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6' }]],
  agenda: [['rect', { x: 3.5, y: 5, width: 17, height: 15, rx: 2 }], ['path', { d: 'M3.5 10h17M8 3v4M16 3v4' }]],
  materiais: [['path', { d: 'M6 3h8l4 4v14H6z' }], ['path', { d: 'M14 3v4h4' }]],
  atividades: [['path', { d: 'M6 3h8l4 4v14H6z' }], ['path', { d: 'M9 13h6M9 17h6' }]],
  projetos: [['path', { d: 'M4 20V4M4 20h16M8 15l4-4 3 3 5-6' }]],
  video: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M10 8.5l5 3.5-5 3.5z' }]],
  chat: [['path', { d: 'M4 5h16v11H9l-5 4z' }]],
  feedback: [['path', { d: 'M4 5h16v11H9l-5 4z' }], ['path', { d: 'M8 10h8' }]],
  bell: [['path', { d: 'M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4' }]],
  acess: [['circle', { cx: 12, cy: 5, r: 2 }], ['path', { d: 'M5 9l7 2 7-2M12 11v5l-3 5M12 16l3 5' }]],
  dashboard: [['rect', { x: 3, y: 3, width: 7, height: 7 }], ['rect', { x: 14, y: 3, width: 7, height: 7 }], ['rect', { x: 3, y: 14, width: 7, height: 7 }], ['rect', { x: 14, y: 14, width: 7, height: 7 }]],
  relatorios: [['path', { d: 'M5 20V10M12 20V4M19 20v-7' }]],
  sair: [['path', { d: 'M9 4H5v16h4M16 8l4 4-4 4M20 12H9' }]],
  fechar: [['path', { d: 'M6 6l12 12M18 6L6 18' }]],
  ok: [['path', { d: 'M5 12l4.5 4.5L19 7' }]],
  alerta: [['path', { d: 'M12 8v5M12 16.5v.5' }], ['circle', { cx: 12, cy: 12, r: 9 }]],
  play: [['path', { d: 'M8 5l11 7-11 7z' }]],
  pausa: [['path', { d: 'M8 5v14M16 5v14' }]],
};

export function icon(name, size = 16, extra = {}) {
  const s = svgEl('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'aria-hidden': 'true', ...extra });
  for (const [tag, attrs] of ICONS[name] || []) s.append(svgEl(tag, attrs));
  return s;
}
