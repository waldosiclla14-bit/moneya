// Auditoría visual en navegador real (Chrome headless + CDP por WebSocket nativo de Node).
// Mide, con estilos computados: contraste WCAG de cada texto, jerarquía de
// encabezados, nombres accesibles de los campos y contraste de los bordes de
// control. Es la puerta de calidad de la interfaz (ver CI: job "auditoria-visual").
//
// Uso:
//   node scripts/auditar-visual.mjs [url] [--tema claro,oscuro] [--ancho 390,1280] [--rutas /,/gastos] [--fallo]
//   node scripts/auditar-visual.mjs http://localhost:3000 --tema claro --fallo
//   node scripts/auditar-visual.mjs http://localhost:3000 --sesion --rutas /cuenta
//
// Requiere Chrome o Edge instalado (o CHROME_PATH). No usa dependencias.
// Con --fallo devuelve código 1 si hay texto con contraste < 4.5, campos sin
// nombre accesible, bordes de control < 3:1 o saltos de encabezado.
//
// --sesion: siembra una sesión Supabase falsa (no vencida, sin red) en
// localStorage antes de cargar la app, para auditar la UI con sesión. Exige
// NEXT_PUBLIC_SUPABASE_URL (la misma que usó el build) porque el cliente solo
// se crea si esa env está presente; en /cuenta verifica que la UI con sesión
// realmente se haya renderizado. En CI no se usa: Pages no tiene secretos.
import { spawn } from 'node:child_process';
import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const valor = (n, porDefecto) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : porDefecto;
};
const lista = (n, porDefecto) => valor(n, porDefecto).split(',').map((s) => s.trim()).filter(Boolean);

const BASE = valor('--url', args.find((a) => a.startsWith('http')) || 'http://localhost:3000').replace(/\/$/, '');
const TEMAS = lista('--tema', 'claro,oscuro');
const ANCHOS = lista('--ancho', '390,1280').map(Number);
const RUTAS = lista('--rutas', '/,/gastos,/finanzas,/aprender,/datos,/metodologia,/login,/perfil,/cuenta,/misiones,/onboarding,/simular');
const CON_FALLO = flag('--fallo');
const CON_SESION = flag('--sesion');
const PUERTO = 9331 + (process.pid % 300);

// Siembra de sesión (solo con --sesion): la misma derivación de clave que usa
// supabase-js v2 (sb-<hostname[0]>-auth-token) y la forma que admite
// _isValidSession (access_token + refresh_token + expires_at). Sin expiración
// cercana => __loadSession no intenta refrescar => cero llamadas de red.
let SCRIPT_SESION = null;
if (CON_SESION) {
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supaUrl || !supaUrl.startsWith('https://')) {
    console.error('--sesion requiere NEXT_PUBLIC_SUPABASE_URL (la misma env con la que compilaste la app).');
    process.exit(2);
  }
  const host = new URL(supaUrl).hostname.split('.')[0];
  SCRIPT_SESION = `(() => {
    try {
      const clave = ${JSON.stringify(`sb-${host}-auth-token`)};
      if (localStorage.getItem(clave)) return;
      const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 10;
      const b64 = (o) => btoa(JSON.stringify(o)).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
      const id = '00000000-0000-4000-8000-000000000001';
      localStorage.setItem(clave, JSON.stringify({
        access_token: b64({ alg: 'none', typ: 'JWT' }) + '.' + b64({ sub: id, exp, role: 'authenticated', aud: 'authenticated' }) + '.sin-firmar',
        refresh_token: 'rt-auditoria',
        expires_at: exp,
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id, aud: 'authenticated', role: 'authenticated',
          email: 'auditoria@demo.local',
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
          app_metadata: { provider: 'email', providers: ['email'] },
          user_metadata: {}, identities: [],
        },
      }));
    } catch (e) { console.error('no se pudo sembrar la sesión: ' + e); }
  })()`;
}

function buscarChrome() {
  const candidatos = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const encontrado = candidatos.find((c) => existsSync(c));
  if (!encontrado) {
    console.error('No se encontro Chrome/Edge. Define CHROME_PATH con la ruta al ejecutable.');
    process.exit(2);
  }
  return encontrado;
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const perfil = mkdtempSync(path.join(tmpdir(), 'moneya-audit-'));
const chrome = spawn(buscarChrome(), [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${perfil}`,
  '--window-size=390,900', 'about:blank',
], { stdio: 'ignore' });

let ws;
let fallos = 0;
try {
  let urlWs = null;
  for (let i = 0; i < 100 && !urlWs; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PUERTO}/json`);
      const l = await r.json();
      const p = l.find((t) => t.type === 'page');
      if (p) urlWs = p.webSocketDebuggerUrl;
    } catch { /* Chrome aun no expone el puerto */ }
    if (!urlWs) await espera(250);
  }
  if (!urlWs) throw new Error('Chrome no expuso el puerto de depuracion');
  ws = new WebSocket(urlWs);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('no se pudo abrir el WebSocket')); });

  let id = 0;
  const pend = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) {
      const { res, rej } = pend.get(m.id);
      pend.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  };
  const send = (method, params = {}) => {
    const mid = ++id;
    ws.send(JSON.stringify({ id: mid, method, params }));
    return new Promise((res, rej) => pend.set(mid, { res, rej }));
  };
  const evaluar = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'error al evaluar');
    return r.result.value;
  };
  const irA = async (ruta) => {
    await send('Page.navigate', { url: BASE + ruta });
    for (let i = 0; i < 100; i++) {
      if (await evaluar('document.readyState === "complete"').catch(() => false)) break;
      await espera(150);
    }
    await espera(1200);
  };

  await send('Page.enable');
  await send('Runtime.enable');
  if (SCRIPT_SESION) await send('Page.addScriptToEvaluateOnNewDocument', { source: SCRIPT_SESION });

  // El tema lo guarda el layout en localStorage (moneya:tema) al montar.
  await irA('/');

  const SCRIPT = `(() => {
    const lum = (c) => { const m = c.match(/[\\d.]+/g).map(Number); const [r,g,b] = m; const f=(v)=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
    const ratio = (a,b) => { const l1=lum(a), l2=lum(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };
    const bgDe = (el) => { let n = el; while (n && n !== document.documentElement) { const c = getComputedStyle(n).backgroundColor; if (c && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(c)) return c; n = n.parentElement; } return getComputedStyle(document.body).backgroundColor; };
    const txt = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 44);
    const esTexto = (el) => { const s = getComputedStyle(el); if (el.children.length) return false; const t = txt(el); if (!t) return false; return s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.1; };
    const nodos = [...document.querySelectorAll('body *')].filter(esTexto);
    const fallos = [];
    for (const el of nodos) {
      const s = getComputedStyle(el);
      const fg = s.color, bg = bgDe(el);
      const cr = ratio(fg, bg);
      const fs = parseFloat(s.fontSize);
      const grande = fs >= 24 || (fs >= 18.66 && +s.fontWeight >= 700);
      if (cr < (grande ? 3 : 4.5)) fallos.push({ tag: el.tagName.toLowerCase(), txt: txt(el), fg, bg, cr: +cr.toFixed(2), fs, grande });
    }
    const encabezados = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({ tag: h.tagName, txt: txt(h), fs: parseFloat(getComputedStyle(h).fontSize) }));
    // El borde de un control con fondo propio no define su contorno: se compara
    // contra el fondo exterior (el del padre), no contra su propio relleno.
    // Solo controles de formulario y botones: el subrayado decorativo de un
    // enlace no exige 3:1 (WCAG 1.4.11 aplica a componentes de UI).
    const controles = [...document.querySelectorAll('input,select,textarea,button')].map((el) => {
      const s = getComputedStyle(el);
      const borde = s.borderTopWidth !== '0px' ? s.borderTopColor : null;
      const propio = s.backgroundColor;
      const referencia = /rgba\\(0, 0, 0, 0\\)|transparent/.test(propio) ? bgDe(el) : bgDe(el.parentElement || el);
      const crBorde = borde ? ratio(borde, referencia) : null;
      return { tag: el.tagName.toLowerCase(), tipo: el.type || '', borde: borde || '', crBorde: crBorde === null ? null : +crBorde.toFixed(2) };
    });
    // Nombre accesible real: la API labels del navegador ya resuelve
    // <label for>, <label> envolvente, aria-label y aria-labelledby.
    const campos = [...document.querySelectorAll('input,select,textarea')].map((i) => {
      const etiquetado = !!(i.getAttribute('aria-label') || i.getAttribute('aria-labelledby') || (i.labels && i.labels.length));
      return { tipo: i.type || i.tagName.toLowerCase(), nombre: etiquetado };
    });
    return {
      titulo: document.title,
      url: location.pathname,
      scrollH: document.documentElement.scrollHeight,
      fallidos: fallos,
      encabezados,
      controles,
      camposSinNombre: campos.filter((c) => !c.nombre).length,
      totalCampos: campos.length,
      h1: encabezados.filter((h) => h.tag === 'H1').length,
      saltos: encabezados.map((h, i, a) => ({ de: a[i - 1]?.tag, a: h.tag })).filter((s) => s.de && +s.a[1] - +s.de[1] > 1),
      tema: document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro',
    };
  })()`;

  console.log(`Auditoria visual — ${BASE}${CON_SESION ? ' · con sesión sembrada' : ''}`);
  for (const tema of TEMAS) {
    for (const ancho of ANCHOS) {
      await send('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 600 });
      await irA('/');
      await evaluar(`localStorage.setItem('moneya:tema', ${JSON.stringify(tema)})`);
      await send('Page.reload');
      await espera(2200);

      console.log(`\n### tema ${tema} · viewport ${ancho}px`);
      for (const ruta of RUTAS) {
        await irA(ruta);
        const r = await evaluar(SCRIPT);
        console.log(`  ${r.url} (${r.tema}) · ${r.titulo} · alto ${r.scrollH}px`);
        console.log(`    h1: ${r.h1} | campos sin nombre: ${r.camposSinNombre}/${r.totalCampos} | saltos: ${r.saltos.length ? r.saltos.map((s) => s.de + '->' + s.a).join(',') : 'ninguno'}`);
        if (r.fallidos.length) {
          fallos += r.fallidos.length;
          const porTipo = {};
          for (const f of r.fallidos) porTipo[f.tag] = (porTipo[f.tag] || 0) + 1;
          console.log(`    CONTRASTE < 4.5: ${r.fallidos.length} textos (${JSON.stringify(porTipo)})`);
          for (const f of r.fallidos.slice(0, 6)) console.log(`      <${f.tag}> ${f.fs}px "${f.txt}" ${f.fg} sobre ${f.bg} -> ${f.cr}`);
        }
        const bordesFlojos = r.controles.filter((c) => c.crBorde !== null && c.crBorde < 3);
        if (bordesFlojos.length) {
          fallos += bordesFlojos.length;
          console.log(`    bordes de control con contraste < 3: ${bordesFlojos.length} (${bordesFlojos.slice(0, 4).map((b) => b.tag + ' ' + b.borde + ' -> ' + b.crBorde).join(' | ')})`);
        }
        if (r.camposSinNombre > 0) {
          fallos += r.camposSinNombre;
          console.log(`    CAMPOS SIN NOMBRE ACCESIBLE: ${r.camposSinNombre}`);
        }
        if (r.saltos.length) {
          fallos += r.saltos.length;
          console.log(`    SALTOS DE ENCABEZADO: ${r.saltos.map((s) => s.de + '->' + s.a).join(',')}`);
        }
        // Prueba de que la sesión sembrada fue consumida: /cuenta con sesión
        // muestra la tarjeta de exportación, no el aviso de "inicia sesión".
        if (CON_SESION && ruta === '/cuenta') {
          const uiSesion = await evaluar(`document.body.innerText.includes('Exportar mis datos')`);
          if (!uiSesion) {
            fallos++;
            console.log('    SESION NO APLICADA: /cuenta no renderiza la UI con sesión (el build no tiene NEXT_PUBLIC_SUPABASE_URL?)');
          }
        }
      }
    }
  }
  console.log(`\nTotal de hallazgos: ${fallos}`);
  if (CON_FALLO && fallos > 0) process.exitCode = 1;
} catch (e) {
  console.error('ERROR: ' + e.message);
  process.exitCode = 2;
} finally {
  try { ws?.close(); } catch { /* ignorar */ }
  chrome.kill();
}
