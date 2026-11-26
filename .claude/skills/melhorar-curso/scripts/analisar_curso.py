#!/usr/bin/env python3
"""Auditoria de um curso do Pingo Quest (content/<curso>.json).

Uso:
  python3 -I .claude/skills/melhorar-curso/scripts/analisar_curso.py content/redes.json
  python3 -I .../analisar_curso.py content/linux.json --parada 3     # só a parada 3 (1 a N)
  python3 -I .../analisar_curso.py content/redes.json --json          # saída para máquina

Só lê o arquivo; não altera nada. Cada achado tem gravidade:
  ERRO  = quebra a experiência no app (corrigir sempre)
  AVISO = piora a aprendizagem (corrigir quando fizer sentido)
  DICA  = oportunidade de deixar mais dinâmico
"""
import argparse, collections, json, re, sys, unicodedata

def norm(t):
    t = unicodedata.normalize('NFD', str(t).lower())
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9 ]+', ' ', t)

def cru(t):
    return re.sub(r'\s+', ' ', str(t).strip().lower())

def palavras(t):
    return {w for w in norm(t).split() if len(w) > 3}

def sobreposicao(a, b):
    """Parte das palavras de `a` que também aparece em `b` (0 a 1)."""
    pa, pb = palavras(a), palavras(b)
    return len(pa & pb) / len(pa) if pa else 0

ROTULO = {'escolha': 'escolha', 'verdadeiro_falso': 'verdadeiro/mito', 'ligar': 'ligar', 'classificar': 'classificar'}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('arquivo')
    ap.add_argument('--parada', type=int, help='analisa só esta parada (1 a N)')
    ap.add_argument('--json', action='store_true')
    a = ap.parse_args()
    j = json.load(open(a.arquivo, encoding='utf-8'))
    achados = []  # (gravidade, onde, texto)
    def add(g, onde, txt): achados.append({'gravidade': g, 'onde': onde, 'texto': txt})

    paradas = j['mundos'][0]['paradas']
    conceitos = {c['id'] for p in paradas for f in p['fases'] for c in f.get('conceitos', [])}
    vistas = collections.defaultdict(list)
    tot = collections.Counter(); vf = collections.Counter(); dif = collections.Counter()
    mais_longa = escolhas = 0
    por_parada = []

    for pi, p in enumerate(paradas, 1):
        if a.parada and pi != a.parada: continue
        ond = f'Parada {pi} ({p.get("lugar") or p["titulo"]})'
        pt = collections.Counter(); fracas = []
        if len(p.get('dicas', [])) < 3: add('DICA', ond, f'só {len(p.get("dicas", []))} dicas (o balão "Dicas" rende mais com 3 a 5).')
        if len(p.get('extras', [])) < 3: add('AVISO', ond, f'só {len(p.get("extras", []))} perguntas extras para o Desafio do Pingo (ideal: 4 ou mais).')
        for fi, f in enumerate(p['fases'], 1):
            fo = f'{ond} · Fase {fi} "{f.get("nome", "")}"'
            aula = ' '.join(i.get('texto', '') + ' ' + ' '.join(t.get('definicao', '') for t in i.get('termos', [])) for i in f['itens'] if i['tipo'] == 'aprender')
            tipos = collections.Counter(i['tipo'] for i in f['itens'] if i['tipo'] != 'aprender')
            for i in f['itens']:
                if i['tipo'] != 'aprender': pt[i['tipo']] += 1
            if len(tipos) < 3: add('DICA', fo, f'só {len(tipos)} formato(s) ({", ".join(ROTULO[t] for t in tipos)}). Misture pelo menos 3 formatos por fase.')
            if sum(tipos.values()) < 4: add('AVISO', fo, f'só {sum(tipos.values())} perguntas; a fase fica curta (ideal: 5 a 6).')
            for i in f['itens']:
                t = i['tipo']
                if t == 'aprender':
                    n = len(i.get('texto', ''))
                    if n > 360: add('AVISO', fo, f'aula "{i.get("titulo")}" tem {n} caracteres: longa para a tela do celular (ideal: até ~300).')
                    if not i.get('termos'): add('DICA', fo, f'aula "{i.get("titulo")}" sem `termos` (os botões "Toque para explorar").')
                    continue
                q = i['pergunta']; w = f'{fo} · "{q[:60]}"'
                tot[t] += 1; dif[i.get('dificuldade', 1)] += 1
                vistas[cru(q)].append(w)
                if i.get('conceito') not in conceitos: add('ERRO', w, f'conceito "{i.get("conceito")}" não existe.')
                ex = i.get('explicacao', '')
                if not ex: add('AVISO', w, 'sem explicação.')
                elif len(ex) < 28 or sobreposicao(ex, q + ' ' + str(i.get('certa', ''))) >= .8:
                    fracas.append(q[:48])
                if t == 'escolha':
                    ops = [i['certa']] + i['erradas']; escolhas += 1
                    if len(ops) < 4: add('AVISO', w, f'só {len(ops)} opções.')
                    if len({cru(o) for o in ops}) < len(ops): add('ERRO', w, 'opções repetidas.')
                    if len(i['certa']) > max(len(e) for e in i['erradas']): mais_longa += 1
                    if any(re.search(r'\b(todas|nenhuma|ambas)\b', norm(o)) for o in ops): add('DICA', w, 'usa "todas/nenhuma/ambas": prefira opções concretas.')
                    if sobreposicao(i['certa'], q) >= .85 and len(palavras(i['certa'])) > 2: add('DICA', w, 'a resposta certa repete quase só as palavras da pergunta.')
                elif t == 'verdadeiro_falso':
                    vf[i['resposta']] += 1
                    if sobreposicao(q, aula) >= .8: add('DICA', w, 'a afirmação é cópia da aula; transforme em situação ou em mito comum.')
                elif t == 'ligar':
                    dr = [cru(x['direita']) for x in i['pares']]; de = [cru(x['esquerda']) for x in i['pares']]
                    if len(set(dr)) < len(dr): add('ERRO', w, 'lado direito com itens repetidos: o app marca erro mesmo escolhendo o texto certo. Torne cada direita única.')
                    if len(set(de)) < len(de): add('ERRO', w, 'lado esquerdo com itens repetidos.')
                    if not 3 <= len(i['pares']) <= 4: add('AVISO', w, f'{len(i["pares"])} pares (o app aceita 3 ou 4).')
                elif t == 'classificar':
                    c = collections.Counter(x['categoria'] for x in i['itens'])
                    if any(c[k] < 2 for k in i['categorias']): add('AVISO', w, f'categoria com menos de 2 itens ({dict(c)}).')
                    if not 4 <= len(i['itens']) <= 7: add('DICA', w, f'{len(i["itens"])} itens (use 4 a 6).')
        if fracas: add('DICA', ond, f'{len(fracas)} explicação(ões) só repetem a pergunta/resposta; explique o PORQUÊ ou dê um exemplo. Ex.: ' + ' | '.join(f'"{x}"' for x in fracas[:3]) + ('…' if len(fracas) > 3 else ''))
        por_parada.append((pi, p.get('lugar') or p['titulo'], dict(pt)))
        for k in ('extras',):
            for i in p.get(k, []):
                if i.get('tipo') != 'aprender': vistas[norm(i.get('pergunta', ''))].append(f'{ond} · extra "{i.get("pergunta", "")[:50]}"')

    for k, v in vistas.items():
        if len(v) > 1 and k: add('AVISO', v[0], f'pergunta repetida {len(v)}x: ' + ' | '.join(x.split("·")[-1].strip() for x in v[1:]))
    nvf = vf[True] + vf[False]
    if nvf and vf[False] / nvf < .35:
        add('AVISO', 'Curso todo', f'verdadeiro/mito desbalanceado: {vf[True]} verdadeiras e {vf[False]} falsas ({vf[False] * 100 // nvf}% falsas). Quem sempre marca "Verdade" acerta quase tudo. Alvo: 40 a 50% mitos.')
    if escolhas and mais_longa / escolhas > .4:
        add('AVISO', 'Curso todo', f'a resposta certa é a MAIS LONGA em {mais_longa} de {escolhas} escolhas ({mais_longa * 100 // escolhas}%; ao acaso seria ~25%). Dá para acertar sem ler a pergunta. Equilibre os tamanhos.')
    if not dif[3]: add('DICA', 'Curso todo', f'nenhuma pergunta de dificuldade 3 (distribuição: {dict(dif)}). Falta degrau no fim das paradas e no Desafio do Pingo.')
    bb = j.get('bate_bola', [])
    if bb:
        cb = collections.Counter(x.get('conceito') for x in bb)
        sem = sorted(conceitos - set(cb))
        if sem: add('DICA', 'Bate-bola (eventos)', f'{len(sem)} conceito(s) sem bate-bola: ' + ', '.join(sem[:8]) + ('…' if len(sem) > 8 else ''))
        if not any(x['tipo'] == 'verdadeiro_falso' for x in bb): add('DICA', 'Bate-bola (eventos)', 'sem verdadeiro/mito: o bate-bola fica só em múltipla escolha.')

    resumo = {'curso': j.get('nome'), 'perguntas_por_formato': dict(tot), 'verdadeiras': vf[True], 'falsas': vf[False],
              'certa_mais_longa': f'{mais_longa}/{escolhas}', 'dificuldade': {str(k): v for k, v in sorted(dif.items())},
              'bate_bola': len(bb), 'achados': len(achados)}
    if a.json:
        print(json.dumps({'resumo': resumo, 'achados': achados}, ensure_ascii=False, indent=1)); return
    print(f'# Auditoria: {resumo["curso"]}' + (f' (parada {a.parada})' if a.parada else ''))
    print(f'Formatos: {resumo["perguntas_por_formato"]} | Verdadeiras/falsas: {vf[True]}/{vf[False]} | Certa mais longa: {resumo["certa_mais_longa"]} | Dificuldade: {resumo["dificuldade"]} | Bate-bola: {len(bb)}\n')
    for g in ('ERRO', 'AVISO', 'DICA'):
        L = [x for x in achados if x['gravidade'] == g]
        if not L: continue
        print(f'## {g} ({len(L)})')
        for x in L: print(f'- {x["onde"]}: {x["texto"]}')
        print()
    if not achados: print('Nada a apontar.')
    sys.exit(1 if any(x['gravidade'] == 'ERRO' for x in achados) else 0)

if __name__ == '__main__':
    main()
