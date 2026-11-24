// Extrai do jogo atual (src/jogo.html) o CSS e os dados do avatar, para o app React reutilizar.
// Uso: node tools/extract-legacy.mjs
import fs from 'node:fs'
import vm from 'node:vm'
const src = fs.readFileSync(new URL('../src/jogo.html', import.meta.url), 'utf8')
const out = new URL('../app/src/legacy/', import.meta.url)
const css = src.slice(src.indexOf('<style>') + 7, src.indexOf('</style>'))
fs.writeFileSync(new URL('jogo.css', out), css)
const a = src.indexOf('var AVD={'), b = src.indexOf('function pingo(')
const ctx = { doneCount: () => 0, PF_TOTAL: () => 0, S: { bosses: 0 }, isAdm: () => false, JSON, Math }
const code = src.slice(a, b) + '\n' + src.slice(src.indexOf('var AV_COR='), src.indexOf('var AV_DEF=')) + '\n' +
  src.slice(src.indexOf('var AV_DEF='), src.indexOf('function avKey'))
vm.createContext(ctx); vm.runInContext(code, ctx)
const slots = JSON.parse(JSON.stringify(ctx.AV_SLOTS))
fs.writeFileSync(new URL('avatar.json', out), JSON.stringify({ AVD: ctx.AVD, AV_COR: ctx.AV_COR, AV_OLHOS: ctx.AV_OLHOS, AV_DEF: ctx.AV_DEF, AV_SLOTS: slots }))
console.log('css', css.length, 'avd slots', Object.keys(ctx.AVD))

// --- arte da trilha: ícones e cenas SVG (strings) ---
function slice(from, to) { return src.slice(src.indexOf(from), src.indexOf(to)) }
const ctx2 = { JSON, Math, S: { done: {}, bosses: 0 }, CURSO: 'redes', RM: false, NOANIM: false, COURSES: [], esc: (t) => String(t) }
const code2 = [
  src.slice(src.indexOf('var IC={'), src.indexOf('/* Desenhos dos adere')),
  src.slice(src.indexOf('var PLACE_IC=['), src.indexOf('function placeIcon')),
  src.slice(src.indexOf('var NAV={'), src.indexOf('/* ---------- trilha')),
  src.slice(src.indexOf('var IC_TERM='), src.indexOf('\n', src.indexOf('var IC_TERM=')) + 1),
  src.slice(src.indexOf('var DVI={'), src.indexOf('function nodeArt')),
  src.slice(src.indexOf('function pkt('), src.indexOf('function courseFlag')),
].join('\n')
vm.createContext(ctx2); vm.runInContext(code2, ctx2)
// --- telas Missões / Conquistas: baú, artes das conquistas e habilidades, ícones das etapas ---
const code3 = [
  slice('var DV={', 'function hashStr'),
  slice('var SKILL_ART={', '/* ===== Conquistas'),
  slice('var CQ_ART={', 'var CONQ=['),
  slice('function chestSVG(', 'function chestReady'),
  slice('var DU_COL=', 'var WHEEL_MINI'),
].join('\n')
vm.runInContext(code3, ctx2)
const extra = { DV: ctx2.DV, SKILL_ART: ctx2.SKILL_ART, CQ_ART: ctx2.CQ_ART, chest: vm.runInContext("chestSVG('a')", ctx2),
  chestZ: vm.runInContext("chestSVG('z')", ctx2), DU_COL: ctx2.DU_COL, DU: [...Array(10).keys()].map(i => vm.runInContext('duIcon(' + i + ')', ctx2)) }
const art = { ...extra, NAV: ctx2.NAV, IC: ctx2.IC, PLACE_IC: ctx2.PLACE_IC, IC_TERM: ctx2.IC_TERM, DVI: ctx2.DVI, DVPOOL: ctx2.DVPOOL,
  worldScene: vm.runInContext('worldScene()', ctx2), linuxScene: vm.runInContext('linuxScene()', ctx2) }
fs.writeFileSync(new URL('art.json', out), JSON.stringify(art))
console.log('art', Object.keys(art.IC).length, art.PLACE_IC.length, art.worldScene.length, art.linuxScene.length)
