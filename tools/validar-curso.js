// Confere um arquivo de conteúdo (content/*.json) sem abrir o jogo.
// Uso: node tools/validar-curso.js content/redes.json
const fs=require('fs');
const arq=process.argv[2]||'content/redes.json';
const src=fs.readFileSync(__dirname+'/../src/jogo.html','utf8');
const a=src.indexOf('function lerCurso'),b=src.indexOf('function carregarCurso');
const lerCurso=new Function(src.slice(a,b)+';return lerCurso')();
let json;try{json=JSON.parse(fs.readFileSync(arq,'utf8'))}catch(e){console.log('ERRO: o arquivo não é um JSON válido ->',e.message);console.log('Dica: confira vírgulas no fim das linhas e aspas fechadas.');process.exit(1)}
const d=lerCurso(json);
const q=d.GAMES.reduce((n,g)=>n+g.phases.reduce((m,p)=>m+p.filter(x=>x.t!=='learn').length,0),0);
const conceitos=Object.keys(d.CUR);
const solto=[];d.GAMES.forEach(g=>g.phases.forEach(p=>p.forEach(x=>{if(x.t!=='learn'&&x.cid&&!d.CUR[x.cid])solto.push(x.q+' -> conceito "'+x.cid+'" não existe')})));
d.EVQ.forEach(x=>{if(x.cid&&!d.CUR[x.cid])solto.push('bate-bola "'+x.q+'" -> conceito "'+x.cid+'" não existe')});
Object.keys(d.EXTRA).forEach(g=>d.EXTRA[g].forEach(x=>{if(x.cid&&!d.CUR[x.cid])solto.push('extra "'+x.q+'" -> conceito "'+x.cid+'" não existe')}));
console.log(`Curso: ${d.NOME}\nParadas: ${d.GAMES.length} | Perguntas nas lições: ${q} | Conceitos: ${conceitos.length} | Bate-bola: ${d.EVQ.length} | Chamados: ${d.CASE_IDS.length}`);
const erros=d.ERROS.concat(solto);
if(erros.length){console.log('\nProblemas ('+erros.length+'):');erros.forEach(e=>console.log(' - '+e));process.exit(1)}
console.log('\nTudo certo!');
