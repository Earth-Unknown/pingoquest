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
