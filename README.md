# Pingo Quest

Jogo gamificado de estudo de Redes de Computadores, com o mascote Pingo (um robô roteador).
Arquivo único (`index.html`, HTML/CSS/JS), pensado para celular. O progresso fica no `localStorage` (`pingoquest-v3`).

## Estado atual (v12)
- 6 etapas iniciais técnicas (termo técnico entre parênteses), mais intermediário e avançado (conteúdo antigo, ainda a refazer).
- Tipos de pergunta: múltipla escolha, V/F, ligar pares, ordenar, completar frase (banco de palavras), digitar a resposta e classificar.
- Casos imersivos, caso diário, operação semanal, missões, sequência com folgas, baú diário interativo, Pingo interativo com sons.
- Cada pergunta precisa ter o texto (`q`) único em todo o jogo (usado no controle de erros).

## Fase 1 concluída: estrutura de conhecimento
- `CUR`: 32 conceitos, cada um com pré-requisitos e a fase onde é apresentado.
- Cada pergunta tem `cid` (conceito), `dif` (1 a 3), `rs` (status de revisão: `aprovado` nas 6 etapas iniciais, `legado` no resto) e `lk` (fase de origem).
- `S.know[conceito]` guarda se o aluno viu o conceito (cartão apresentado) e acertos/erros. Quem já tinha fases concluídas é migrado sem perder nada.
- `eligibleQs()` só devolve perguntas de conceitos vistos e com pré-requisitos vistos. `masteryOf()` classifica em novo, aprendendo, frágil ou dominado.
- Testes em `tests/` (rodar com Playwright): `conteudo.test.js` (perguntas únicas, formatos) e `conhecimento.test.js` (nada de conteúdo futuro, pré-requisitos, migração).

## Fase 2 concluída: Desafio do Pingo (só na trilha)
- 5 acertos seguidos no mesmo assunto (mundo) durante fases da trilha liberam o convite no fim da fase. Erro zera a sequência. Revisão, chefe, prática, casos e eventos não contam.
- 30 perguntas extras (3 por mundo, dificuldade 3, em formato de situação/diagnóstico) em `EXTRA`, filtradas pelo que o aluno já viu (`eligible`).
- Opcional: errar não tira vida nem progresso, e os erros vão para a Revisão. Com 2 de 3 acertos, vence. Cristais (+10, +5 se perfeito) só na primeira vitória por assunto; repetir dá só XP.
- Teste: `tests/desafio5.test.js`.

## Próximas fases (ver `docs/`)
3. Eventos temporários, revisão adaptada, coleção de peças, avatar robótico, auditoria.

## Decisões aprovadas (22/11/2026)
- Etapa de evento: mostra as 6 perguntas, explica os erros e permite refazer no mesmo dia.
- Quem chega tarde e já não consegue concluir fica de fora e espera o próximo evento.
- Peças incompletas quando o evento acaba se perdem (sem retomar).
- Fase de teste: datas pelo relógio do aparelho (servidor só depois).
- Eventos nunca ativam o desafio de 5 acertos nem liberam conteúdo novo.
