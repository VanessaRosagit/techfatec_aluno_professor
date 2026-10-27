// Gera js/app.bundle.js (script comum, sem módulos) e data/db.js a partir dos arquivos-fonte.
// Assim o index.html abre com duplo clique, sem servidor. Rode: node build.js
const fs = require('fs');
const path = require('path');

const ORDEM = ['js/dom.js', 'js/store.js', 'js/auth.js', 'js/ui.js', 'js/pages/comum.js', 'js/pages/acesso.js', 'js/pages/aluno.js', 'js/pages/prof.js', 'js/app.js'];
const nome = (f) => path.basename(f, '.js');
let saida = '// ARQUIVO GERADO por build.js. Edite os arquivos em js/ e rode "node build.js".\n"use strict";\nconst __m = {};\n';

for (const arq of ORDEM) {
  let src = fs.readFileSync(path.join(__dirname, arq), 'utf8');
  const exportados = [];
  src = src.replace(/^import\s+\*\s+as\s+(\w+)\s+from\s+'[^']*?(\w+)\.js';?$/gm, (_, v, m) => `const ${v} = __m["${m}"];`);
  src = src.replace(/^import\s+\{([^}]*)\}\s+from\s+'[^']*?(\w+)\.js';?$/gm, (_, nomes, m) =>
    `const { ${nomes.split(',').map((n) => n.trim()).filter(Boolean).map((n) => n.replace(/\s+as\s+/, ': ')).join(', ')} } = __m["${m}"];`);
  src = src.replace(/^export\s+(async\s+function|function|const|let)\s+(\w+)/gm, (_, tipo, n) => { exportados.push(n); return `${tipo} ${n}`; });
  saida += `\n__m["${nome(arq)}"] = (function () {\n${src}\nreturn { ${exportados.join(', ')} };\n})();\n`;
}
fs.writeFileSync(path.join(__dirname, 'js/app.bundle.js'), saida);

const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/db.json'), 'utf8'));
fs.writeFileSync(path.join(__dirname, 'data/db.js'), '// ARQUIVO GERADO por build.js a partir de db.json (usado quando a página abre sem servidor).\nwindow.TF_SEED = ' + JSON.stringify(db, null, 2) + ';\n');
console.log('Gerados: js/app.bundle.js e data/db.js');
