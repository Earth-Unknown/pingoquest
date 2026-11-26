# Pingo Quest

> **Endereço oficial: https://pingoquest.web.app** (Firebase Hosting). É este o link para divulgar: tem o login com Google ou convidado e a API do app.
>
> O GitHub Pages (`earth-unknown.github.io/pingoquest`) continua no ar como **reserva**, com o mesmo jogo. O progresso de cada pessoa fica guardado no navegador, separado em cada endereço, então quem alterna entre os dois não vê o mesmo progresso. Ver `docs/hospedagem.md`.

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

## Fase 3 concluída: base de eventos
- Eventos são dados em `EVENTS` (nome, datas, etapas, peças, cristais, prêmio, nota mínima). Sem evento ligado, nada aparece.
- Para ligar um: `enabled:true` e `start`/`end` (AAAA-MM-DD). O evento Operação Rede Conectada está ligado (22/11 a 01/12/2026), com botão flutuante na Trilha. Para testar vários dias: Perfil > Ferramentas de teste > "Avançar 1 dia" e "Reiniciar o evento" (remover antes de lançar).
- Cartão do evento na tela da trilha abre uma página própria: peça-quebra-cabeça 3x3 (roteador), etapas, calendário, regras e estados (em breve, aberta, concluída hoje, tarde demais, concluído).
- Regras: 1 etapa nova por dia (dias não consecutivos), 6 perguntas só de conceitos já vistos, nota mínima 4/6 (`passMin`, ajustável), refazer no mesmo dia com outras perguntas, sem vida perdida, sem desafio dos 5 acertos, quem chega tarde demais não entra.
- Recompensas pelo `S.ledger` (não pagam duas vezes). Prêmio vai para `S.inv`. Relógio para trás não reabre dias (`S.maxDay`). Data ainda é a do aparelho; servidor é um passo futuro.
- Teste: `tests/eventos.test.js`.

## Próximas fases (ver `docs/`)
4. Revisão adaptada refinada, coleção de equipamentos (switch, servidor, fibra, firewall), avatar robótico com inventário, auditoria e servidor.

## Decisões aprovadas (22/11/2026)
- Etapa de evento: mostra as 6 perguntas, explica os erros e permite refazer no mesmo dia.
- Quem chega tarde e já não consegue concluir fica de fora e espera o próximo evento.
- Peças incompletas quando o evento acaba se perdem (sem retomar).
- Fase de teste: datas pelo relógio do aparelho (servidor só depois).
- Eventos nunca ativam o desafio de 5 acertos nem liberam conteúdo novo.

## Publicação
- Fonte do jogo: `src/jogo.html` (fragmento no formato do Artifact do claude.ai, publicado como está).
- `index.html` da raiz é GERADO por `sh build-site.sh` (página completa com doctype e regra `[hidden]`). Sirva o GitHub Pages pela branch `main` (raiz) ou por Actions: os dois funcionam. Depois de mexer em `src/jogo.html`, rode o script e faça commit dos dois arquivos (`tests/site.test.js` confere).

## Fase 5 — Avatar robótico + inventário

- Perfil ganhou "Meu robô": um robô base com acessórios trocáveis (cor, olhos, antena, cabeça, visor, mochila).
- Itens são **apenas visuais** (sem vantagem nas respostas). Alguns são grátis; outros desbloqueiam por estudo (fases, XP, chefes, acertos, sequência) ou evento (Antena Wi-Fi especial).
- Itens desbloqueados ficam permanentes em `S.inv.items` (sem duplicar); equipar/desequipar não gasta cristais. Equipado fica em `S.av`.
- Teste: `node tests/avatar.test.js`.

### Conquistas e "Prova final"
- A 4ª fase de cada etapa agora se chama **Prova final** (antes "Chefe"); contador `S.bosses` mantido internamente.
- Aba **Conquistas** (conquistas, habilidades, progresso por etapa); o Perfil ficou com estatísticas, robô e ajustes. Galeria de **Conquistas**: só reconhecimento, sem prêmio. Salvas em `S.conq`, uma vez cada.
- Itens do robô vêm só de fases concluídas, provas finais e evento (nada de XP/acertos).

### Modo dono
As ferramentas de teste (avançar dia, reiniciar evento) só aparecem para quem ativar o "Modo dono" neste aparelho: tocar 7 vezes no título "Meu perfil" e digitar o código. O código não está no repositório, só o hash dele. É uma trava de interface (o navegador é de quem joga); a proteção de verdade das datas de evento exige servidor.
Teste: `CODIGO=<arquivo com o código> node tests/dono.test.js`.

### Tema e trilha iniciante (v2)
- Tema padrão **claro (branco)** com cores vivas; **escuro (roxo neon)** opcional em Perfil › Ajustes (`pingoquest-theme`).
- Trilha iniciante refeita em **10 unidades** (Seção 1 · Unidade 1 a 10), só conceitos básicos, siglas entre parênteses. Só formatos de selecionar (múltipla escolha, V/F, ligar, classificar). Sem digitar nem completar frase.
- Cada fase tem 5 perguntas (o Desafio do Pingo conta 5 acertos seguidos). Extras do desafio refeitos por unidade (`NEWX`).
- Fim de lição: pouco texto, cartões de XP/precisão/cristais (ou sequência) aparecem um a um com som.
- O intermediário/avançado (jogos 10 a 13) ainda é o conteúdo antigo e será refeito.


## Conteúdo do curso
Perguntas, lições, chamados e evento vivem em `content/redes.json` (o build embute no `index.html`). Veja `docs/editar-conteudo.md` e valide com `node tools/validar-curso.js content/redes.json`.
