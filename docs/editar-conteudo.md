# Como editar o conteúdo do Pingo Quest (sem mexer no código)

Todo o conteúdo do curso de Redes fica em **`content/redes.json`**: lugares, lições, perguntas, bate-bola, chamados e o evento.
O jogo lê esse arquivo. Para trocar uma pergunta, você só edita o texto, sem tocar no código.

## O que é JSON, em 30 segundos
É um arquivo de texto com "campos" e "valores" entre aspas. Três regras:
1. Texto vai **entre aspas**: `"Qual é o IP?"`.
2. Itens de uma lista ficam entre `[ ]` e separados por **vírgula**; **o último item não leva vírgula**.
3. Cada bloco `{ ... }` é um item (uma pergunta, uma lição...).

## Como editar pelo GitHub (pelo navegador)
1. Abra o repositório → pasta `content` → `redes.json` → ícone do lápis (Edit).
2. Troque o texto que quiser (use Ctrl+F para achar a pergunta).
3. Clique em **Commit changes**. Em 1 a 2 minutos o site atualiza e o jogo baixa o conteúdo novo na próxima abertura (às vezes recarrega sozinho uma vez).
4. Se errar uma vírgula, o jogo **ignora o arquivo quebrado e continua com a versão anterior**. Nada trava.

Para conferir antes de salvar (opcional, no computador): `node tools/validar-curso.js content/redes.json` diz qual pergunta tem problema.

## A estrutura
```
mundos → paradas (os lugares da vila) → fases (as 3 lições de cada parada) → itens (aprender e perguntas)
```
Cada parada também tem `dicas`, `extras` (perguntas do Desafio do Pingo) e, se tiver, um `chamado` (qual caso resolve no fim).
O `bate_bola` (perguntas rápidas do evento), os `casos` (chamados) e os `eventos` ficam no fim do arquivo.

## Tipos de item
**Aprender** (a tela de explicação antes das perguntas)
```json
{ "tipo": "aprender", "titulo": "Aparelhos conversando",
  "texto": "Uma rede é um grupo de aparelhos ligados...",
  "termos": [ { "termo": "Rede", "definicao": "Aparelhos ligados para trocar informações." } ] }
```
**Escolha** (4 opções; o jogo embaralha, você só informa a certa e as erradas)
```json
{ "tipo": "escolha", "pergunta": "O que é uma rede?",
  "certa": "Aparelhos ligados para trocar informações",
  "erradas": ["Um programa", "Um cabo", "Uma senha"],
  "explicacao": "Rede é aparelhos conversando.",
  "conceito": "rede.def", "dificuldade": 1 }
```
**Verdadeiro ou falso**: `"tipo": "verdadeiro_falso"`, `"resposta": true` (ou `false`).
**Ligar**: `"tipo": "ligar"`, `"pares": [ {"esquerda": "Rede", "direita": "Aparelhos ligados"}, ... ]` (3 ou 4 pares).
**Classificar**: `"tipo": "classificar"`, `"categorias": ["Dá", "Não dá"]`, `"itens": [ {"texto": "Impressora", "categoria": "Dá"} ]` (a categoria tem de ser igual a uma da lista).

Campos comuns: `explicacao` (aparece após responder), `conceito` (o assunto, veja abaixo), `dificuldade` (1 fácil, 2 médio, 3 difícil) e `revisao` (`"rascunho"` esconde a pergunta do jogo sem apagar).

## Conceitos (o "assunto" de cada pergunta)
Cada fase tem uma lista `conceitos`: `{ "id": "rede.def", "nome": "O que é uma rede", "antes": [] }`.
`antes` lista os conceitos que precisam ter sido vistos antes. O jogo só usa uma pergunta no evento ou no desafio depois que a pessoa viu o conceito dela. Toda pergunta deve apontar para um `id` que exista.

## Receitas rápidas
- **Trocar o texto de uma pergunta:** ache pelo Ctrl+F e edite.
- **Adicionar pergunta:** copie um bloco `{ ... }` de pergunta parecida, cole depois dele (com vírgula) e mude os textos.
- **Tirar pergunta:** apague o bloco inteiro (com a vírgula) ou troque a `revisao` para `"rascunho"`.
- **Mais perguntas para o desafio:** adicione blocos em `extras` da parada.
- **Mais perguntas de bate-bola do evento:** adicione em `bate_bola`.

## O que ainda fica no código
Visual, sons, avatar, amigos, duelo e as regras do jogo. Chamados (`casos`) usam uma estrutura própria, então copie e adapte um existente.

## Próximos cursos
Cada curso novo (por exemplo Linux) terá o seu `content/linux.json` com o mesmo formato, e a tela de escolher o curso vai listá-los.

## Curso de Linux e chamados de terminal

O curso Terminal Linux mora em `content/linux.json`, com o mesmo formato do Redes (mundos, paradas, fases, bate_bola). Os **chamados** do Linux são de outro tipo: `"tipo": "terminal"`. A pessoa digita comandos de verdade num terminal de mentira, dentro do jogo.

Um chamado de terminal tem:
- `cenario`: `usuario`, `maquina` e `inicio` (pasta onde começa; `~` é a pasta pessoal).
- `fs`: arquivos e pastas que existem. Caminho terminado em `/` é pasta; senão é arquivo, e o valor é o texto dele.
- `perm` (opcional): permissões de um arquivo, por exemplo `"/home/aluno/a.sh": "rw-r--r--"`.
- `processos`, `rede`, `pacotes`, `exec` (opcionais): usados por ps/kill, ip/ping/curl, apt e ./script.
- `passos`: a lista de tarefas. Cada passo tem `texto`, `dica`, `ok` e `feito`, que é a condição para o passo ficar verde. Condições: `cmd` (comando digitado, aceita expressão regular), `existe`, `naoexiste`, `conteudo` [arquivo, texto], `perm` e `semperm` [arquivo, letra], `cwd`, `saida`, `matou`, `instalou`, `exec`.
- `conclusao`, `explicacao`, `final`: textos da tela de resultado.

Comandos disponíveis: pwd ls cd mkdir touch cp mv rm cat head tail grep wc sort uniq echo chmod whoami id hostname ps top kill ip ping curl apt sudo clear history help, com pipe (|) e redirecionamento (> e >>).

Depois de editar, rode `node tools/validar-curso.js content/linux.json` e `sh build-site.sh`.
