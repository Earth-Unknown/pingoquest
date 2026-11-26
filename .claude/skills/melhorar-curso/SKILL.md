---
name: melhorar-curso
description: Analisa e melhora o conteúdo dos cursos do Pingo Quest (content/redes.json, content/linux.json). Faz auditoria das perguntas e dos materiais (aulas, dicas, extras, bate-bola), escolhe o melhor formato para cada pergunta (escolha, verdadeiro ou mito, ligar, classificar), equilibra respostas e opções, deixa as fases mais dinâmicas e reescreve o que estiver fraco. Use sempre que o pedido envolver melhorar, revisar, auditar, corrigir, balancear, variar, ampliar ou "deixar mais dinâmico" perguntas, aulas, explicações ou qualquer material de um curso do Pingo Quest, mesmo que a pessoa não cite o arquivo, e também ao criar parada ou curso novo e checar a qualidade.
---

# Melhorar o conteúdo de um curso do Pingo Quest

O curso inteiro mora em `content/<curso>.json` e o app lê esse arquivo sem mexer em código. Seu trabalho é fazer esse conteúdo **ensinar melhor e ser mais divertido de responder**, sem quebrar o app. Quem joga é um iniciante no celular, em sessões curtas: cada pergunta deve ter uma razão de existir, e cada erro deve ensinar algo.

## O que o app faz com cada formato (importa para escolher o formato)

| Formato (`tipo`) | Como aparece | Cuidados |
|---|---|---|
| `escolha` | Botões embaralhados. Você dá `certa` + `erradas` (hoje sempre 3). | Qualquer nº de opções funciona (2 a 5), mas o layout é pensado para 3 ou 4. |
| `verdadeiro_falso` | Tela "Verdade ou mito?" com dois botões **Mito / Verdade**. `resposta: true` = Verdade. | O rótulo é fixo no app: escreva uma **afirmação**, nunca uma pergunta. |
| `ligar` | Duas colunas; a pessoa toca um item de cada lado. | 3 ou 4 pares. **Cada texto do lado direito deve ser único**: o app confere por posição, então dois "Cabo" fazem uma resposta certa contar como erro. |
| `classificar` | Cada item recebe uma categoria num seletor. | 2 ou 3 categorias, 4 a 6 itens, cada categoria com pelo menos 2 itens. Use quando as respostas se repetem (aí `ligar` não serve). |
| `aprender` | Balão do Pingo + botões "Toque para explorar" (`termos`). | Curto (até ~300 caracteres) e com termos. |

Só existem esses quatro formatos de pergunta. Formatos novos (ordenar passos, completar comando) exigem mudança no código do app: sugira no fim, mas só crie se a pessoa pedir.

## Fluxo

1. **Combine o escopo.** Curso (redes, linux), paradas e se é só diagnóstico ou também edição. Se o pedido for vago ("melhora o curso"), rode a auditoria do curso inteiro, mostre o resumo e trabalhe em lotes de 1 a 3 paradas, para a pessoa conseguir revisar.
2. **Audite.** `python3 -I .claude/skills/melhorar-curso/scripts/analisar_curso.py content/redes.json` (use `--parada N` para focar). Ele aponta ERRO (quebra o app), AVISO (piora a aprendizagem) e DICA (oportunidade). Trate os ERROs primeiro, sempre.
3. **Leia o material de verdade**, não só os números: as aulas (`aprender`), os `conceitos` e a ordem entre eles (`antes`), as `dicas`, os `extras`, o `bate_bola` e o `chamado` da parada. Pergunte-se: a aula está correta e clara para um iniciante? Há exemplo do dia a dia? A pergunta cobra o que a aula ensinou? Em `references/rubrica.md` está o critério completo.
4. **Planeje cada fase** antes de escrever (receita em `references/rubrica.md`): 5 a 6 perguntas, 3 formatos ou mais, dificuldade subindo 1 → 2 → 3, ao menos uma pergunta de situação, e um mito.
5. **Reescreva e acrescente.** Mantenha o que já está bom; mude só o que o critério justifica. Exemplos antes/depois em `references/exemplos.md`.
6. **Aplique** com um script Python que carrega o JSON e grava de volta com `json.dump(..., ensure_ascii=False, indent=1)` e **sem quebra de linha final** (é o formato atual dos arquivos; assim o diff mostra só o que mudou). Não renomeie `id` de conceito, não apague conceito usado, e não use um conceito de fase futura (o jogo só pergunta o que a pessoa já viu).
7. **Valide.** `node tools/validar-curso.js content/<curso>.json` (estrutura e conceitos), a auditoria de novo (sem ERRO e com menos AVISOs que antes) e, para manter o jogo antigo em sincronia, `sh build-site.sh`. Se houver Playwright, rode também `node tests/conteudo.test.js`, `node tests/tres-licoes.test.js` e `node tests/conhecimento.test.js`.
8. **Relate** em português simples, com o formato abaixo.

## Princípios que mais valem (o porquê de cada um)

- **Mito ou verdade bem equilibrado.** Hoje ~85% das afirmações são verdadeiras, então marcar sempre "Verdade" já acerta quase tudo. Mire em 40 a 50% de mitos e prefira mitos reais ("reiniciar o roteador apaga a conta do provedor"), não frases erradas óbvias.
- **A resposta certa não pode ser a mais longa.** Hoje ela é a mais longa em mais da metade das escolhas, e dá para acertar sem ler. Equilibre tamanho e estrutura das opções; varie a posição da ideia-chave.
- **Distratores plausíveis.** Cada opção errada deve ser um equívoco que alguém realmente teria ou algo verdadeiro mas que não responde à pergunta. Opções absurdas ("ligar a luz") ensinam nada e tornam a pergunta fácil demais.
- **Variar para ficar dinâmico.** Misture formatos dentro da fase, alterne pergunta de conceito com pergunta de situação ("Seu primo reclama que o jogo trava…"), e use `classificar` e `ligar` onde a ideia é comparar ou associar.
- **A explicação ensina o porquê.** Quem errou precisa sair sabendo algo novo; repetir a resposta não ensina.
- **Nada de pergunta repetida** (o teste do projeto falha), nem afirmação copiada da aula: o V/F deve exigir aplicar, não reconhecer a frase.
- **Português do Brasil, tom amigável, frases curtas**, sem jargão antes de explicar. Mantenha o estilo do Pingo (técnico de campo, resolver casos).

## Formato do relatório final

```
## O que encontrei
(3 a 5 pontos, com números: antes → depois)

## O que mudei
- Parada X, Fase Y: ... (antes → depois em 1 linha cada, no máximo 5 exemplos)

## Conferido
- validar-curso: ok | auditoria: N ERRO → 0 | testes: ...

## Dá para ir além (precisa de código)
(formatos novos, se fizer sentido)
```

Se a pessoa só pediu diagnóstico, não edite nada: entregue o relatório com as mudanças propostas e pergunte se pode aplicar.

## Arquivos desta skill

- `scripts/analisar_curso.py`: auditoria automática (só lê, não altera).
- `references/rubrica.md`: critério de qualidade completo e receita de fase. Leia ao planejar e ao revisar aulas.
- `references/exemplos.md`: antes/depois reais do curso de Redes. Leia antes de reescrever.
