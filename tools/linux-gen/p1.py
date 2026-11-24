from h import *
P=[]
# ---------- 1. Recepção: o que é Linux
P.append({'lugar':'Recepção','titulo':'O que é Linux','dicas':[
 'Linux é um sistema operacional livre.','Kernel é o núcleo; distribuição é o sistema pronto, com programas.','Ubuntu, Debian e Fedora são distribuições.'],
 'fases':[
 fase('O sistema do servidor','linux.def','O que é o Linux',[],[
  L('O sistema do servidor','O Linux é um sistema operacional: o programa que faz o computador funcionar e liga os aplicativos às peças físicas. Ele roda em servidores, celulares Android, roteadores e até em carros.',[('Sistema operacional','Programa que controla o computador'),('Kernel','O núcleo, que conversa com as peças'),('Hardware','As peças físicas do computador')]),
  E('linux.def','O que é o Linux?','Um sistema operacional livre',['Um tipo de cabo de rede','Um aplicativo de mensagens','Um modelo de computador'],'Linux é um sistema operacional, como Windows e macOS, mas livre.'),
  V('linux.def','O Linux é um sistema operacional.',True,'Ele controla o computador e liga os programas às peças.'),
  E('linux.def','Qual é o papel de um sistema operacional?','Fazer a ponte entre os programas e o hardware',['Só guardar fotos','Dar internet sozinho','Esfriar o processador'],'Sem ele, os programas não conseguem usar as peças.',2),
  LG('linux.def','Ligue cada termo ao seu significado',[('Sistema operacional','Controla o computador e os programas'),('Kernel','Núcleo que conversa com o hardware'),('Hardware','As peças físicas do computador')],'Hardware é o físico, o kernel é o núcleo e o sistema operacional organiza tudo.'),
  E('linux.def','Qual destes é o núcleo do Linux?','O kernel',['O teclado','O monitor','O roteador'],'Kernel quer dizer núcleo.',2)]),
 fase('Livre e aberto','linux.livre','Software livre e código aberto',['linux.def'],[
  L('Livre e aberto','O Linux é software livre: o código-fonte é aberto. Qualquer pessoa pode usar, estudar, copiar e melhorar. Livre não quer dizer de graça para sempre: empresas ganham dinheiro com suporte e serviços.',[('Código-fonte','As instruções escritas por quem programa'),('Código aberto','Qualquer pessoa pode ler o código'),('Comunidade','Gente do mundo todo ajudando a melhorar')]),
  E('linux.livre','O que significa o código do Linux ser aberto?','Qualquer pessoa pode ler e estudar o código',['Só a empresa dona pode ver','O código fica escondido','Ele só funciona sem internet'],'Aberto quer dizer que o código pode ser visto por todos.'),
  V('linux.livre','Software livre nunca pode gerar dinheiro para ninguém.',False,'Empresas cobram por suporte, treinamento e serviços.'),
  E('linux.livre','Quem ajuda a melhorar o Linux?','Uma comunidade de pessoas e empresas do mundo todo',['Só uma única empresa','Apenas robôs','Ninguém, ele nunca muda'],'É um trabalho em comunidade.',2),
  CL('linux.livre','Código aberto ou fechado?',['Código aberto','Código fechado'],[('Você pode ler o código','Código aberto'),('Qualquer pessoa pode propor melhorias','Código aberto'),('Só a empresa dona vê o código','Código fechado'),('A comunidade revisa o código','Código aberto')],'No aberto todos veem; no fechado só a dona.'),
  E('linux.livre','O que é o código-fonte?','As instruções escritas por quem programa',['A senha do administrador','O cabo do servidor','A tela de login'],'É a receita que vira o programa.',2)]),
 fase('Distribuições','linux.distro','Distribuições (distros)',['linux.livre'],[
  L('Distribuições','O Linux, sozinho, é só o núcleo. Uma distribuição (distro) junta o núcleo com programas, visual e instalador, formando um sistema pronto. Ubuntu, Debian e Fedora são exemplos.',[('Distribuição','Linux + programas, pronta para usar'),('Ubuntu','Distro popular e amigável para começar'),('Debian','Distro estável, muito usada em servidores')]),
  E('linux.distro','O que é uma distribuição Linux?','O Linux junto com programas, formando um sistema pronto',['Um cabo de rede','Um tipo de processador','Uma senha'],'Distro é o pacote completo.'),
  V('linux.distro','Ubuntu e Debian são distribuições Linux.',True,'Os dois são distros muito usadas.'),
  E('linux.distro','Por que existem várias distribuições?','Cada uma é montada para um uso ou gosto diferente',['Porque o Linux quebra e precisa ser trocado','Porque só uma pode usar internet','Porque são todas iguais'],'Há distros para servidores, para iniciantes, para jogos...',2),
  LG('linux.distro','Ligue cada nome ao que ele é',[('Ubuntu','Distro popular para quem está começando'),('Debian','Distro estável, comum em servidores'),('Kernel','O núcleo que todas compartilham')],'As distros mudam, o núcleo é o Linux.'),
  E('linux.distro','Você instalou o Ubuntu no computador. O que você instalou?','Uma distribuição Linux',['Um roteador','Um navegador','Um antivírus'],'Ubuntu é uma distro.',2)])],
 'extras':[
  E('linux.def','Seu amigo diz: «Linux é um programa que eu abro, como o navegador». Está certo?','Não: é o sistema que faz o computador funcionar',['Sim: é um navegador','Sim: é um jogo','Não: é um cabo'],'O sistema operacional roda por baixo de todos os programas.',3),
  V('linux.livre','Dá para estudar o código do Linux sem pedir licença a ninguém.',True,'Por ser aberto, qualquer um pode ler.',3),
  E('linux.distro','O que as distros Ubuntu e Debian têm em comum?','Usam o mesmo núcleo, o Linux',['Usam o mesmo teclado','Só funcionam em celular','São a mesma empresa'],'O kernel Linux é a base de todas.',3)],
 'chamado':'lx_acesso'})

# ---------- 2. Painel de Comandos: terminal, shell, comando
P.append({'lugar':'Painel de Comandos','titulo':'Terminal e comandos','dicas':[
 'Terminal é a janela; shell é o programa que entende os comandos.','Um comando tem nome, opções e argumentos: ls -l /home.','O prompt mostra usuário, máquina e pasta; $ é usuário comum e # é administrador.'],
 'fases':[
 fase('Terminal e shell','linux.terminal','Terminal e shell',['linux.def'],[
  L('Terminal e shell','No Linux, dá para mandar o computador fazer coisas escrevendo comandos. A janela onde você escreve é o terminal. O programa que entende o que você escreveu é o shell (o mais comum se chama bash).',[('Terminal','A janela onde você digita'),('Shell','Programa que entende e executa os comandos'),('Comando','Uma ordem escrita para o computador')]),
  E('linux.terminal','Para que serve o terminal?','Para digitar comandos e o computador executar',['Para esfriar o computador','Para desenhar imagens','Para trocar o papel de parede só'],'Ele é a porta para falar com o sistema por texto.'),
  V('linux.terminal','O shell é o programa que entende os comandos digitados.',True,'O bash é um shell muito usado.'),
  E('linux.terminal','Qual é a diferença entre terminal e shell?','Terminal é a janela; shell entende os comandos',['São a mesma peça de hardware','O terminal é um cabo; o shell é a tela','Não existe diferença nenhuma e nenhum dos dois roda comandos'],'A janela mostra e o shell interpreta.',2),
  LG('linux.terminal','Ligue cada termo ao seu papel',[('Terminal','A janela onde você digita'),('Shell','Entende e executa o que foi digitado'),('Comando','Uma ordem para o computador')],'Digita-se um comando; o shell executa.'),
  E('linux.terminal','O que o bash é?','Um shell',['Um teclado','Uma distro','Um cabo'],'Bash é o shell mais comum no Linux.',2)]),
 fase('Anatomia de um comando','linux.comando','Nome, opções e argumentos',['linux.terminal'],[
  L('Anatomia de um comando','Um comando tem partes: o nome (o que fazer), as opções (como fazer, geralmente com um traço) e os argumentos (em quem fazer). Em «ls -l /home»: ls é o nome, -l é a opção e /home é o argumento.',[('Nome','O que você quer fazer (ls, cd, cat)'),('Opção','Muda como o comando age (-l, -a)'),('Argumento','O alvo do comando (um arquivo ou pasta)')]),
  E('linux.comando','Em «ls -l /home», quem é a opção?','-l',['ls','/home','Nenhuma'],'Opções começam com traço.'),
  V('linux.comando','Em «ls -l /home», o argumento é /home.',True,'É o alvo do comando.'),
  E('linux.comando','Qual comando mostra o conteúdo de uma pasta?','ls',['cd','pwd','rm'],'ls vem de list, listar.',2),
  CL('linux.comando','Nome, opção ou argumento? (em «ls -a /tmp»)',['Nome do comando','Opção','Argumento'],[('ls','Nome do comando'),('-a','Opção'),('/tmp','Argumento')],'Nome, depois opções, depois o alvo.',2),
  E('linux.comando','No comando «cat nota.txt», o que é nota.txt?','O argumento',['A opção','O nome do comando','O shell'],'É o arquivo sobre o qual o comando age.',2)]),
 fase('Ler o prompt','linux.prompt','O prompt e o $',['linux.comando'],[
  L('Ler o prompt','O prompt é o texto que aparece antes do cursor, avisando que o shell espera um comando. Ele costuma mostrar usuário, máquina e pasta: aluno@servidor:~$. O $ indica usuário comum; o # indica administrador (root).',[('Prompt','Texto que espera seu comando'),('$','Você é um usuário comum'),('#','Você é o administrador (root)')]),
  E('linux.prompt','Em «aluno@servidor:~$», quem é o usuário?','aluno',['servidor','~','$'],'O que vem antes do @ é o usuário.'),
  V('linux.prompt','O símbolo # no fim do prompt indica o administrador.',True,'Cuidado: o root pode mudar qualquer coisa.'),
  E('linux.prompt','Em «aluno@servidor:~$», qual é o nome da máquina?','servidor',['aluno','$','~'],'Depois do @ vem o nome da máquina.',2),
  LG('linux.prompt','Ligue cada pedaço do prompt ao que ele mostra',[('aluno','O usuário'),('servidor','O nome da máquina'),('$','Usuário comum')],'Cada parte do prompt é uma informação.'),
  E('linux.prompt','Por que é bom prestar atenção ao # no prompt?','Porque o administrador pode alterar tudo no sistema',['Porque o # liga a internet','Porque o # apaga a tela','Porque indica que o computador está lento'],'Quem é root tem poder total.',2)])],
 'extras':[
  E('linux.terminal','Seu colega abriu uma janela preta e digitou «ls». Que janela é essa?','O terminal',['O navegador','O gerenciador de energia','A lixeira'],'É onde se digitam comandos.',3),
  E('linux.comando','Qual das opções é o comando completo com opção e argumento?','ls -l /tmp',['ls','/tmp','-l'],'Nome, opção e argumento juntos.',3),
  V('linux.prompt','O prompt «root@servidor:/#» indica que você está como administrador.',True,'root + # = administrador.',3)],
 'chamado':'lx_comandos'})

# ---------- 3. Mapa de Pastas
P.append({'lugar':'Mapa de Pastas','titulo':'Pastas e caminhos','dicas':[
 'Tudo começa na raiz: /.','Caminho absoluto começa na raiz; relativo parte de onde você está.','~ é a sua pasta pessoal; . é aqui; .. é a pasta de cima.'],
 'fases':[
 fase('A árvore de pastas','linux.arvore','A árvore de diretórios',['linux.prompt'],[
  L('A árvore de pastas','No Linux, tudo fica numa árvore que começa na raiz, escrita como «/». Pasta também se chama diretório. Dentro da raiz há pastas como /home (pessoas), /etc (configurações), /var (dados que mudam, como logs) e /tmp (temporários).',[('Raiz (/)','Início de toda a árvore'),('/home','Onde ficam as pastas das pessoas'),('/etc','Arquivos de configuração do sistema')]),
  E('linux.arvore','Como se escreve a raiz do sistema?','/',['~','..','C:'],'A raiz é só uma barra.'),
  V('linux.arvore','No Linux existe uma única árvore de pastas, que começa na raiz.',True,'Não há C: nem D: como no Windows.'),
  E('linux.arvore','Onde ficam as pastas pessoais das pessoas usuárias?','/home',['/etc','/tmp','/var'],'Cada pessoa tem uma pasta dentro de /home.',2),
  LG('linux.arvore','Ligue cada pasta ao seu uso',[('/home','Pastas das pessoas'),('/etc','Configurações do sistema'),('/tmp','Arquivos temporários')],'Cada pasta tem uma função.'),
  E('linux.arvore','Onde costumam ficar os arquivos de log, que registram o que aconteceu?','/var/log',['/home/aluno','/tmp','/'],'/var guarda dados que mudam, como logs.',2)]),
 fase('Caminho absoluto e relativo','linux.caminho','Caminhos absoluto e relativo',['linux.arvore'],[
  L('Caminho absoluto e relativo','Caminho é o endereço de um arquivo ou pasta. O absoluto começa na raiz (/home/aluno/nota.txt) e vale de qualquer lugar. O relativo parte de onde você está (docs/nota.txt) e não começa com barra.',[('Absoluto','Começa em / e vale de qualquer lugar'),('Relativo','Parte da pasta onde você está'),('Pasta atual','Onde você está agora')]),
  E('linux.caminho','Qual destes é um caminho absoluto?','/home/aluno/nota.txt',['docs/nota.txt','nota.txt','../nota.txt'],'Começa com / = absoluto.'),
  V('linux.caminho','Um caminho relativo começa sempre com uma barra.',False,'Relativo não começa com barra; parte de onde você está.'),
  E('linux.caminho','Você está em /home/aluno. O que «docs/nota.txt» significa?','/home/aluno/docs/nota.txt',['/docs/nota.txt','/home/docs/nota.txt','/nota.txt'],'O relativo se junta à pasta atual.',2),
  CL('linux.caminho','Absoluto ou relativo?',['Absoluto','Relativo'],[('/etc/hosts','Absoluto'),('docs/nota.txt','Relativo'),('/var/log/syslog','Absoluto'),('projetos/app','Relativo')],'Com barra no começo é absoluto.'),
  E('linux.caminho','Por que o caminho absoluto é seguro de usar?','Porque vale de qualquer pasta onde você esteja',['Porque é mais curto','Porque funciona só em servidores','Porque apaga o erro'],'Ele não depende de onde você está.',2)]),
 fase('Atalhos: ~, . e ..','linux.atalhos','Atalhos de pasta (~ . ..)',['linux.caminho'],[
  L('Atalhos: ~, . e ..','O til (~) é atalho para a sua pasta pessoal. O ponto (.) é a pasta onde você está. Dois pontos (..) são a pasta de cima. Com o comando cd você muda de pasta, e pwd mostra onde você está.',[('~','Sua pasta pessoal (home)'),('.','A pasta atual'),('..','A pasta de cima')]),
  E('linux.atalhos','O que o comando pwd mostra?','A pasta em que você está',['A lista de arquivos','O nome do usuário','A hora'],'pwd = print working directory.'),
  V('linux.atalhos','O comando «cd ..» sobe uma pasta.',True,'.. é a pasta de cima.'),
  E('linux.atalhos','Qual comando leva você direto à sua pasta pessoal?','cd ~',['cd /','cd ..','cd .'],'~ é a sua casa.',2),
  LG('linux.atalhos','Ligue cada atalho ao seu significado',[('~','Sua pasta pessoal'),('.','A pasta atual'),('..','A pasta de cima')],'Três atalhos, três lugares.'),
  E('linux.atalhos','Você está em /home/aluno/docs. Depois de «cd ..», onde fica?','/home/aluno',['/home','/','/home/aluno/docs/..'],'Subiu uma pasta.',2)])],
 'extras':[
  E('linux.arvore','Qual pasta é o topo de toda a árvore?','/',['/home','/etc','~'],'Tudo nasce na raiz.',3),
  E('linux.caminho','Você está em /var e quer ir a /var/log. Qual caminho relativo serve?','log',['/log','../log','/var/var/log'],'Relativo parte de onde você está.',3),
  V('linux.atalhos','Estando em /home/aluno, «cd ../..» leva até a raiz.',True,'Dois níveis acima de /home/aluno é /.',3)],
 'chamado':'lx_pastas'})

# ---------- 4. Oficina de Arquivos
P.append({'lugar':'Oficina de Arquivos','titulo':'Criar, copiar e mover','dicas':[
 'mkdir cria pasta; touch cria arquivo vazio.','cp copia; mv move ou renomeia; rm apaga.','Não existe lixeira no terminal: rm apaga de vez. Maiúscula e minúscula são diferentes.'],
 'fases':[
 fase('Criar pastas e arquivos','linux.criar','Criar pastas e arquivos',['linux.atalhos'],[
  L('Criar pastas e arquivos','Para criar uma pasta usamos mkdir (make directory). Para criar um arquivo vazio, touch. Para ver o resultado, ls. No Linux, maiúsculas e minúsculas contam: Nota.txt e nota.txt são arquivos diferentes.',[('mkdir','Cria uma pasta'),('touch','Cria um arquivo vazio'),('ls','Lista o que há na pasta')]),
  E('linux.criar','Qual comando cria uma pasta?','mkdir',['touch','cd','cat'],'mkdir = make directory.'),
  V('linux.criar','Nota.txt e nota.txt são o mesmo arquivo no Linux.',False,'O Linux diferencia maiúsculas de minúsculas.'),
  E('linux.criar','Qual comando cria um arquivo vazio chamado ideias.txt?','touch ideias.txt',['mkdir ideias.txt','cd ideias.txt','ls ideias.txt'],'touch cria o arquivo.',2),
  LG('linux.criar','Ligue cada comando ao que ele faz',[('mkdir','Cria uma pasta'),('touch','Cria um arquivo vazio'),('ls','Mostra o conteúdo da pasta')],'Criar e conferir.'),
  E('linux.criar','Você criou uma pasta e quer conferir. Qual comando usa?','ls',['rm','mv','pwd'],'ls mostra o que há na pasta atual.',2)]),
 fase('Copiar e mover','linux.copiar','Copiar, mover e renomear',['linux.criar'],[
  L('Copiar e mover','cp copia: «cp origem destino». mv move: «mv origem destino». E mv também renomeia, porque mover para o mesmo lugar com outro nome é trocar o nome. A cópia deixa o original; o mv, não.',[('cp','Copia (o original continua lá)'),('mv','Move ou renomeia'),('origem e destino','De onde sai e para onde vai')]),
  E('linux.copiar','Qual comando copia um arquivo?','cp',['mv','rm','cat'],'cp = copy.'),
  V('linux.copiar','O comando mv pode renomear um arquivo.',True,'mv velho.txt novo.txt troca o nome.'),
  E('linux.copiar','Depois de «cp nota.txt copia.txt», quantos arquivos existem?','Dois: nota.txt e copia.txt',['Só copia.txt','Só nota.txt','Nenhum'],'A cópia mantém o original.',2),
  CL('linux.copiar','O original continua depois do comando?',['Continua','Some do lugar antigo'],[('cp nota.txt copia.txt','Continua'),('mv nota.txt pasta/','Some do lugar antigo'),('cp a.txt b.txt','Continua'),('mv a.txt c.txt','Some do lugar antigo')],'mv muda de lugar; cp duplica.',2),
  E('linux.copiar','Qual comando renomeia relatorio.txt para final.txt?','mv relatorio.txt final.txt',['cp final.txt relatorio.txt','rm relatorio.txt','touch final.txt'],'mv com um novo nome renomeia.',2)]),
 fase('Apagar com cuidado','linux.apagar','Apagar com rm',['linux.copiar'],[
  L('Apagar com cuidado','rm apaga arquivos. Para apagar uma pasta com tudo dentro, usa-se rm -r. No terminal não há lixeira: o que o rm apaga não volta. Por isso, confira o nome antes de apertar Enter e, se tiver dúvida, use ls primeiro.',[('rm','Apaga arquivos'),('rm -r','Apaga pasta e conteúdo'),('Sem lixeira','Apagou, não volta')]),
  E('linux.apagar','Qual comando apaga um arquivo?','rm',['mv','cp','mkdir'],'rm = remove.'),
  V('linux.apagar','O que o rm apaga vai para a lixeira e pode ser restaurado.',False,'No terminal não há lixeira.'),
  E('linux.apagar','Qual cuidado vale antes de usar rm?','Conferir o nome com ls e ler o comando antes do Enter',['Digitar bem rápido','Usar sempre como administrador','Apagar a pasta de cima'],'Prevenir é melhor que perder dados.',2),
  LG('linux.apagar','Ligue cada comando ao que ele faz',[('rm arquivo','Apaga um arquivo'),('rm -r pasta','Apaga uma pasta e o que há dentro'),('ls','Confere o que existe antes de apagar')],'Confira antes de apagar.'),
  E('linux.apagar','Qual comando apaga a pasta «velhos» e tudo que há nela?','rm -r velhos',['rm velhos','mkdir velhos','cp velhos'],'A opção -r é recursiva.',2)])],
 'extras':[
  E('linux.criar','Você digitou «mkdir fotos». O que aconteceu?','Foi criada a pasta fotos',['Foi apagada a pasta fotos','Foi criado um arquivo vazio','Nada, é erro'],'mkdir cria pastas.',3),
  V('linux.copiar','Com «mv a.txt b.txt», o arquivo a.txt deixa de existir com esse nome.',True,'Foi renomeado para b.txt.',3),
  E('linux.apagar','Por que apagar com rm exige cuidado?','Porque não existe lixeira no terminal',['Porque o rm é lento','Porque só funciona no domingo','Porque pede senha sempre'],'Apagou, acabou.',3)],
 'chamado':'lx_arquivos'})
