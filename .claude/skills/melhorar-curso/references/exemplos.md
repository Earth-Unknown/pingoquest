# Antes e depois (exemplos reais do curso de Redes)

Índice: 1. Pergunta repetida · 2. Verdadeiro parado na aula → mito · 3. Distratores bobos · 4. Ligar com resposta repetida · 5. Explicação que só repete · 6. Pergunta de situação

## 1. Duas perguntas quase iguais na mesma fase
Antes (Parada 3, Fase 1): "Qual opção costuma ser mais estável para jogar ou trabalhar?" e, três itens depois, "Qual opção costuma ser mais estável: cabo ou Wi-Fi?".
Depois: manter a primeira e trocar a segunda por situação (dif. 2):
```json
{ "tipo": "escolha", "pergunta": "Seu primo joga online no PC de mesa e reclama que trava. O que você sugere?",
  "certa": "Ligar o PC ao roteador com um cabo",
  "erradas": ["Trocar o nome do Wi-Fi", "Mudar a senha do Wi-Fi", "Comprar um mouse sem fio"],
  "explicacao": "O cabo não sofre com paredes nem com interferência, então a conexão fica mais estável.",
  "conceito": "meio.transmissao", "dificuldade": 2 }
```

## 2. Verdadeiro que só repete a aula → mito de iniciante
Antes: "Quanto mais longe do roteador, mais fraco costuma ficar o Wi-Fi." (verdadeiro, igual à aula)
Depois (mito):
```json
{ "tipo": "verdadeiro_falso", "pergunta": "Esconder o roteador dentro de um armário fechado deixa o sinal mais forte.",
  "resposta": false,
  "explicacao": "Armário e paredes enfraquecem o sinal. O ideal é deixar o roteador alto e no meio da casa.",
  "conceito": "meio.wifi", "dificuldade": 2 }
```

## 3. Distratores bobos
Antes: certa "Distância e paredes grossas"; erradas "Escolher uma cor diferente", "Abrir mais abas", "Ligar a luz". Quem lê a pergunta acerta sem saber nada.
Depois: erradas que um iniciante realmente cogita, e a certa sem ser a mais longa:
`certa: "Paredes e distância"`, `erradas: ["Ter o plano mais barato", "O tamanho da tela do celular", "Usar o celular com pouca bateria"]`
(Todas parecem possíveis para quem ainda não leu a aula; só uma tem relação física com o sinal.)

## 4. Ligar com resposta repetida (quebra o app)
Antes: "Computador de mesa fixo" → "Cabo", "Celular na sala" → "Wi-Fi", "Videogame que não sai do lugar" → "Cabo". Dois "Cabo" no lado direito: escolher o "Cabo" certo pode contar como erro.
Depois, trocando o formato (as respostas se repetem de propósito):
```json
{ "tipo": "classificar", "pergunta": "Para cada situação, qual meio faz mais sentido?",
  "categorias": ["Cabo", "Wi-Fi"],
  "itens": [ {"texto": "Computador de mesa fixo", "categoria": "Cabo"},
             {"texto": "Celular andando pela casa", "categoria": "Wi-Fi"},
             {"texto": "Videogame que não sai do lugar", "categoria": "Cabo"},
             {"texto": "Notebook no sofá", "categoria": "Wi-Fi"} ],
  "explicacao": "Cabo para o que fica parado (mais estável), Wi-Fi para o que se move (mais prático).",
  "conceito": "meio.transmissao", "dificuldade": 1 }
```
Alternativa: manter `ligar` com direitas únicas ("Cabo UTP", "Wi-Fi", "Bluetooth").

## 5. Explicação que só repete
Antes: "UTP é o cabo de rede mais usado."
Depois: "UTP quer dizer par trançado sem blindagem: os fios são trançados para reduzir a interferência. É o cabo que você vê ligado em roteadores e PCs."

## 6. Subir de "o que é" para "o que fazer"
Conceito: "O que é DNS?" (dif. 1) →
Situação (dif. 3): "O site abre pelo número (IP), mas não pelo nome. Qual peça provavelmente falhou?" certa "O DNS, que traduz nome em número"; erradas "O cabo da rede", "A tela do celular", "O endereço MAC do roteador".
