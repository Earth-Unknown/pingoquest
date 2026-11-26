# Critério de qualidade do conteúdo

Índice: 1. Aulas · 2. Perguntas por formato · 3. Receita de uma fase · 4. Extras, bate-bola e dicas · 5. Chamados · 6. Regras do jogo que não podem quebrar

## 1. Aulas (`aprender`)
- **Correta primeiro.** Confira cada afirmação técnica. Se a simplificação for grande, diga "na maioria dos casos" em vez de afirmar o que é falso.
- **Uma ideia por aula**, em até ~300 caracteres: o que é, para que serve, um exemplo do dia a dia. Se não cabe, divida em duas fases ou mova detalhe para `termos`.
- **Comece pelo problema ou pelo exemplo**, não pela definição ("Seu Wi-Fi some no quarto. Por quê?" funciona melhor que "Wi-Fi é...").
- **`termos`**: 2 a 4 palavras novas, com definição de uma frase. É a parte "toque para explorar".
- A aula deve preparar **todas** as perguntas da fase: se uma pergunta cobra algo que a aula não disse, ou ajuste a aula ou troque a pergunta.

## 2. Perguntas por formato

**Escolha**
- 4 opções na maioria (às vezes 3 para variar o ritmo, 5 só quando o assunto pede). Opções com estrutura e tamanho parecidos.
- Equilibre quem é a mais longa; a resposta certa não pode se denunciar pelo tamanho, pelo detalhe ou por repetir palavras da pergunta.
- Erradas = equívocos reais ou verdades que não respondem. Evite "todas", "nenhuma", "ambas" e piadas.
- Alterne **conceito** ("O que é DNS?") e **situação** ("O site abre pelo IP mas não pelo nome. Onde olhar?").

**Verdadeiro ou mito**
- Afirmação, no presente, sem "sempre/nunca" a menos que seja o ponto do mito.
- 40 a 50% de mitos no curso, e pelo menos um mito por parada. Em cada fase, evite 3 verdadeiras seguidas.
- Bons mitos: crenças comuns de iniciante. Má ideia: trocar uma palavra da aula por outra absurda.
- Explicação sempre diz o que é verdade de fato.

**Ligar**
- 3 ou 4 pares, **lado direito sem repetição**. Se naturalmente várias coisas têm a mesma resposta, use `classificar`.
- Pares do mesmo "universo" (equipamento → função, comando → o que faz, sigla → significado).

**Classificar**
- 2 ou 3 categorias, 4 a 6 itens, equilibrados (nenhuma categoria com 1 item). Ótimo para comparar (Cabo × Wi-Fi, Pode × Não pode, Host × Não é host, LAN × WAN).

**Dificuldade (`dificuldade`)**: 1 reconhecer, 2 aplicar em situação simples, 3 combinar duas ideias ou diagnosticar. Hoje só existem 1 e 2: crie perguntas 3, principalmente no fim da parada e nos `extras`.

**Explicação**: uma ou duas frases com o porquê, ou um exemplo. Se dá para responder à pergunta só lendo a explicação, ela não está ensinando.

## 3. Receita de uma fase (5 a 6 perguntas)
1. Escolha de conceito (dif. 1)
2. Verdade ou mito (dif. 1), de preferência um mito
3. Escolha de situação (dif. 2)
4. Ligar **ou** classificar (dif. 1 ou 2)
5. Escolha ou mito de aplicação (dif. 2)
6. (opcional) pergunta de diagnóstico (dif. 2 ou 3)

Varie a receita entre fases para não ficar previsível. A terceira fase de cada parada deve chegar perto do que o chamado vai cobrar.

## 4. Extras, bate-bola e dicas
- **`extras`** (Desafio do Pingo): 4 ou mais por parada, dificuldade 2 e 3, misturando formatos. É a parte "difícil" do jogo.
- **`bate_bola`** (eventos): pelo menos 1 pergunta por conceito, rápidas, incluindo verdadeiro/mito. O quiz do evento só usa conceitos já vistos.
- **`dicas`** da parada: 3 a 5 frases que resumem a parada como "cola" para o balão Dicas.

## 5. Chamados (`casos`)
Só revise o texto (introdução, pistas, explicação). A estrutura (aparelhos, falhas, passos de terminal) tem regras próprias em `docs/editar-conteudo.md`; cuidado ao mexer.

## 6. O que não pode quebrar
- Todo `conceito` de pergunta precisa existir em algum `conceitos` das fases. Não mude `id`.
- Perguntas **únicas** no curso inteiro.
- Não use conceito de fase futura (a pessoa ainda não viu).
- Toda parada precisa de 3 lições jogáveis; paradas com 2 fases ganham uma revisão automática.
- `ligar`: 3 ou 4 pares. `classificar`: `categoria` do item igual a uma da lista.
- `revisao: "rascunho"` esconde a pergunta do jogo sem apagar: use para guardar versões em teste.
