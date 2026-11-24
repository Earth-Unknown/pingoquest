from h import *
P=[]
# 5 Leitura
P.append({'lugar':'Sala de Leitura','titulo':'Ler arquivos','dicas':['cat mostra o arquivo inteiro.','head mostra o começo; tail mostra o fim.','grep procura um texto dentro de arquivos.'],
'fases':[
 fase('Ver o conteúdo','linux.ler','Ler arquivos (cat, head, tail)',['linux.apagar'],[
  L('Ver o conteúdo','cat mostra o arquivo inteiro na tela. head mostra só as primeiras linhas e tail mostra as últimas. Em arquivos longos, como os logs, tail é muito usado para ver o que aconteceu por último.',[('cat','Mostra o arquivo inteiro'),('head','Mostra as primeiras linhas'),('tail','Mostra as últimas linhas')]),
  E('linux.ler','Qual comando mostra o conteúdo de um arquivo?','cat',['mkdir','cd','touch'],'cat exibe o arquivo.'),
  V('linux.ler','O comando tail mostra as últimas linhas de um arquivo.',True,'Muito útil para logs.'),
  E('linux.ler','Você quer só o começo de um arquivo enorme. O que usa?','head',['tail','rm','pwd'],'head mostra as primeiras linhas.',2),
  LG('linux.ler','Ligue cada comando ao que ele mostra',[('cat','O arquivo inteiro'),('head','As primeiras linhas'),('tail','As últimas linhas')],'Três jeitos de olhar um arquivo.'),
  E('linux.ler','Qual comando mostra as últimas linhas de um log?','tail log.txt',['head log.txt','mkdir log.txt','cd log.txt'],'tail mostra o fim do arquivo.',2)]),
 fase('Procurar texto','linux.grep','Procurar com grep',['linux.ler'],[
  L('Procurar texto','grep procura um texto dentro de arquivos e mostra só as linhas que o contêm: «grep erro log.txt». Com -i ele ignora maiúsculas e minúsculas. Já o comando wc -l conta quantas linhas há.',[('grep','Mostra as linhas que têm o texto'),('grep -i','Ignora maiúsculas e minúsculas'),('wc -l','Conta as linhas')]),
  E('linux.grep','Para que serve o grep?','Procurar um texto dentro de arquivos',['Apagar arquivos','Mudar de pasta','Criar pastas'],'grep filtra linhas.'),
  V('linux.grep','«grep erro log.txt» mostra as linhas de log.txt que contêm a palavra erro.',True,'É exatamente isso.'),
  E('linux.grep','Qual opção do grep ignora maiúsculas e minúsculas?','-i',['-r','-l','-x'],'-i = ignore case.',2),
  CL('linux.grep','Qual comando usar?',['grep','wc -l','tail'],[('Achar linhas com a palavra falha','grep'),('Contar quantas linhas tem o arquivo','wc -l'),('Ver o fim do arquivo','tail')],'Cada um com sua função.',2),
  E('linux.grep','Qual comando conta as linhas de log.txt?','wc -l log.txt',['grep log.txt','cat -l log.txt','ls log.txt'],'wc -l conta linhas.',2)])],
'extras':[
 E('linux.ler','Você abriu um log gigante com cat e a tela encheu. O que ajuda?','Usar tail ou head para ver só um pedaço',['Apagar o arquivo','Reiniciar o servidor','Usar mkdir'],'Ver só o trecho necessário.',3),
 V('linux.grep','O grep apaga as linhas que não contêm o texto procurado.',False,'Ele só mostra; não altera o arquivo.',3),
 E('linux.grep','«grep -i ERRO log.txt» acha também «erro»?','Sim, o -i ignora maiúsculas',['Não, nunca','Só se for root','Só em pasta'],'-i ignora a caixa.',3)],
'chamado':'lx_logs'})

# 6 Pipes
P.append({'lugar':'Esteira de Dados','titulo':'Pipes e redirecionamento','dicas':['> grava a saída num arquivo (e apaga o que havia).','>> acrescenta no fim do arquivo.','| (pipe) passa a saída de um comando para o próximo.'],
'fases':[
 fase('Saída e redirecionamento','linux.redir','Redirecionar a saída',['linux.grep'],[
  L('Saída e redirecionamento','Todo comando produz uma saída, normalmente na tela. Com > você manda essa saída para um arquivo; com >> você acrescenta ao fim dele. Atenção: > substitui tudo o que já havia no arquivo.',[('Saída','O resultado que o comando mostra'),('>','Grava num arquivo, substituindo'),('>>','Acrescenta ao fim do arquivo')]),
  E('linux.redir','O que faz «ls > lista.txt»?','Grava a lista de arquivos no arquivo lista.txt',['Apaga lista.txt','Copia lista.txt','Cria uma pasta'],'> redireciona a saída.'),
  V('linux.redir','O símbolo >> acrescenta ao fim do arquivo sem apagar o que havia.',True,'Boa para ir juntando anotações.'),
  E('linux.redir','O que acontece com o conteúdo anterior de nota.txt em «echo oi > nota.txt»?','É substituído',['Fica guardado','Vira uma pasta','É duplicado'],'> sobrescreve.',2),
  LG('linux.redir','Ligue cada símbolo ao seu efeito',[('>','Substitui o arquivo com a saída'),('>>','Acrescenta ao fim do arquivo'),('echo','Mostra um texto')],'Cuidado com o > .'),
  E('linux.redir','Qual comando acrescenta a palavra «fim» ao final de nota.txt?','echo fim >> nota.txt',['echo fim > nota.txt','cat fim nota.txt','rm nota.txt'],'>> acrescenta.',2)]),
 fase('O pipe','linux.pipe','O pipe |',['linux.redir'],[
  L('O pipe','O pipe (a barrinha |) liga comandos: a saída do primeiro vira a entrada do segundo. Exemplo: «cat log.txt | grep erro | wc -l» lê o log, filtra as linhas com erro e conta quantas são. É como uma esteira.',[('Pipe (|)','Passa a saída para o próximo comando'),('Filtro','Comando que seleciona parte da saída'),('Encadear','Juntar vários comandos numa linha')]),
  E('linux.pipe','Para que serve o pipe |?','Ligar a saída de um comando à entrada do próximo',['Apagar arquivos','Mudar de pasta','Desligar o computador'],'Encadeia comandos.'),
  V('linux.pipe','«ls | wc -l» conta quantos itens há na pasta.',True,'ls lista; wc -l conta.'),
  E('linux.pipe','O que faz «cat log.txt | grep erro»?','Mostra só as linhas de log.txt com a palavra erro',['Apaga os erros','Cria a pasta erro','Copia o log'],'O grep filtra a saída do cat.',2),
  CL('linux.pipe','Pipe ou redirecionamento?',['Pipe (|)','Redirecionamento (> ou >>)'],[('ls | wc -l','Pipe (|)'),('ls > lista.txt','Redirecionamento (> ou >>)'),('cat a.txt | grep oi','Pipe (|)'),('echo ok >> a.txt','Redirecionamento (> ou >>)')],'Pipe vai para outro comando; > vai para arquivo.',2),
  E('linux.pipe','Qual linha conta quantas linhas de log.txt têm «erro»?','grep erro log.txt | wc -l',['grep erro | log.txt wc','wc -l > grep erro','rm erro log.txt'],'Filtrar e depois contar.',2)])],
'extras':[
 E('linux.redir','Você quer guardar a lista de arquivos num relatório. Qual escolhe?','ls > relatorio.txt',['ls | relatorio.txt','rm relatorio.txt','cd relatorio.txt'],'Redirecionar a saída para arquivo.',3),
 V('linux.redir','Usar > em um arquivo importante pode apagar o conteúdo antigo dele.',True,'Use >> se quiser só acrescentar.',3),
 E('linux.pipe','Qual é a ideia do pipe?','Uma esteira: a saída de um comando alimenta o próximo',['Um cabo de rede','Um atalho de pasta','Uma senha'],'Encadeia ferramentas pequenas.',3)],
'chamado':'lx_esteira'})

# 7 Permissões
P.append({'lugar':'Portaria','titulo':'Permissões','dicas':['r = ler, w = escrever, x = executar.','Há três grupos: dono (u), grupo (g) e outros (o).','chmod muda permissões; ls -l mostra.'],
'fases':[
 fase('Ler as permissões','linux.perm','Permissões r, w, x',['linux.pipe'],[
  L('Ler as permissões','Cada arquivo tem permissões: r (ler), w (escrever) e x (executar). Elas valem para três grupos: o dono, o grupo e os outros. Com «ls -l» você vê algo como -rwxr-xr-- : o primeiro traço indica arquivo, depois vêm três letras para o dono, três para o grupo e três para os outros.',[('r','Permissão de ler'),('w','Permissão de escrever'),('x','Permissão de executar')]),
  E('linux.perm','O que significa a letra w numa permissão?','Escrever (alterar)',['Ler','Executar','Apagar a rede'],'w = write.'),
  V('linux.perm','O comando ls -l mostra as permissões dos arquivos.',True,'A primeira coluna traz as permissões.'),
  E('linux.perm','Em «-rw-r--r--», o que o dono pode fazer?','Ler e escrever',['Só executar','Nada','Só ler'],'Os três primeiros: rw-.',2),
  LG('linux.perm','Ligue cada letra ao seu significado',[('r','Ler'),('w','Escrever'),('x','Executar')],'Três permissões básicas.'),
  E('linux.perm','Em «-rw-r--r--», o que os outros usuários podem fazer?','Só ler',['Ler e escrever','Executar','Apagar'],'Os últimos três: r--.',2)]),
 fase('Mudar com chmod','linux.chmod','chmod e executar scripts',['linux.perm'],[
  L('Mudar com chmod','chmod muda as permissões. Forma simples: «chmod +x script.sh» dá permissão de executar; «chmod -w nota.txt» tira a de escrever. Um script só roda com ./script.sh se tiver o x.',[('chmod','Muda permissões'),('+x','Adiciona a permissão de executar'),('./','Executa um arquivo da pasta atual')]),
  E('linux.chmod','Qual comando dá permissão de executar a script.sh?','chmod +x script.sh',['chmod -x script.sh','cp +x script.sh','mkdir script.sh'],'+x adiciona executar.'),
  V('linux.chmod','Um script sem a permissão x não consegue ser executado com ./script.sh.',True,'Aparece «Permissão negada».'),
  E('linux.chmod','Você tentou ./script.sh e recebeu «Permissão negada». Qual é a causa provável?','Faltava a permissão de executar',['Faltava internet','O arquivo é uma pasta','O teclado quebrou'],'Falta o x.',2),
  CL('linux.chmod','Qual comando faz o quê?',['Dá permissão','Tira permissão'],[('chmod +x a.sh','Dá permissão'),('chmod -w nota.txt','Tira permissão'),('chmod +r nota.txt','Dá permissão'),('chmod -x a.sh','Tira permissão')],'+ dá e - tira.',2),
  E('linux.chmod','Para proteger nota.txt contra alterações, o que faz?','chmod -w nota.txt',['chmod +w nota.txt','rm nota.txt','touch nota.txt'],'-w tira a escrita.',2)])],
'extras':[
 E('linux.perm','Qual é a primeira coluna de «ls -l»?','As permissões do arquivo',['O tamanho','A data','O nome'],'Ela vem antes do dono.',3),
 V('linux.chmod','O chmod pode deixar um arquivo somente para leitura.',True,'Basta tirar o w.',3),
 E('linux.chmod','O que faz «./backup.sh»?','Executa o script da pasta atual',['Apaga o script','Copia o script','Mostra o script'],'./ aponta para a pasta atual.',3)],
'chamado':'lx_portaria'})

# 8 Usuários e sudo
P.append({'lugar':'Sala do Administrador','titulo':'Usuários e sudo','dicas':['root é o administrador, com poder total.','sudo executa um comando com poderes de administrador.','whoami mostra quem você é; id mostra grupos.'],
'fases':[
 fase('Quem é você','linux.user','Usuários e grupos',['linux.chmod'],[
  L('Quem é você','O Linux é multiusuário: várias pessoas podem usar a mesma máquina, cada uma com seu espaço. Usuário comum só mexe no que é dele. O administrador se chama root. whoami diz quem você é; id mostra também seus grupos.',[('Usuário','Uma conta de acesso'),('root','O administrador, poder total'),('Grupo','Conjunto de usuários com permissões em comum')]),
  E('linux.user','Qual comando mostra seu nome de usuário?','whoami',['pwd','ls','cd'],'whoami = who am I.'),
  V('linux.user','O usuário root é o administrador do sistema.',True,'Pode alterar tudo.'),
  E('linux.user','Por que não é bom usar o root o tempo todo?','Um erro pode danificar o sistema inteiro',['Porque é mais lento','Porque desliga a tela','Porque não existe'],'Poder demais, risco maior.',2),
  LG('linux.user','Ligue cada termo ao significado',[('root','Administrador do sistema'),('Grupo','Conjunto de usuários'),('whoami','Mostra seu usuário')],'Quem manda e quem é quem.'),
  E('linux.user','O que é um grupo de usuários?','Um conjunto de usuários com permissões em comum',['Um cabo','Uma pasta temporária','Um programa de e-mail'],'Facilita dar permissões a várias pessoas.',2)]),
 fase('O sudo','linux.sudo','sudo e privilégios',['linux.user'],[
  L('O sudo','sudo («superuser do») executa UM comando com poderes de administrador, normalmente pedindo a sua senha. É mais seguro que virar root o tempo todo. Só quem está autorizado pode usar. Ex.: «sudo apt update».',[('sudo','Roda um comando como administrador'),('Senha','Pedida para confirmar que é você'),('Privilégio','Poder extra no sistema')]),
  E('linux.sudo','Para que serve o sudo?','Executar um comando com poderes de administrador',['Desligar a internet','Criar um arquivo vazio','Listar pastas'],'Eleva só aquele comando.'),
  V('linux.sudo','Qualquer pessoa pode usar o sudo, mesmo sem autorização.',False,'Só quem foi autorizado.'),
  E('linux.sudo','Você tentou editar /etc e recebeu «Permissão negada». O que pode ser feito?','Usar sudo, se você for autorizado',['Reiniciar o teclado','Apagar o /etc','Trocar de pasta'],'Arquivos de sistema exigem admin.',2),
  CL('linux.sudo','Precisa de sudo?',['Costuma precisar','Normalmente não'],[('Instalar programas','Costuma precisar'),('Listar sua pasta pessoal','Normalmente não'),('Editar arquivos em /etc','Costuma precisar'),('Criar arquivo na sua pasta','Normalmente não')],'Sistema pede admin; sua pasta, não.',2),
  E('linux.sudo','Qual é a vantagem do sudo sobre ficar como root?','Dá poder só no comando necessário',['É mais lento','Esconde o prompt','Desliga o terminal'],'Menos risco.',2)])],
'extras':[
 E('linux.user','No prompt, o # no lugar do $ indica o quê?','Que você é o root',['Que a internet caiu','Que há erro','Que é um arquivo'],'# = administrador.',3),
 V('linux.sudo','O sudo costuma pedir sua senha para confirmar.',True,'Confirma que é você.',3),
 E('linux.user','Qual comando mostra seus grupos?','id',['pwd','rm','mkdir'],'id lista usuário e grupos.',3)],
'chamado':'lx_admin'})

# 9 Processos e pacotes
P.append({'lugar':'Sala de Máquinas','titulo':'Processos e pacotes','dicas':['Processo é um programa em execução.','ps lista processos; kill encerra um.','apt instala programas (no Ubuntu/Debian).'],
'fases':[
 fase('Processos','linux.proc','Processos',['linux.sudo'],[
  L('Processos','Um processo é um programa em execução. Cada um tem um número, o PID. ps mostra os processos; top mostra em tempo real quais gastam mais; kill PID encerra um processo que travou.',[('Processo','Programa em execução'),('PID','Número que identifica o processo'),('kill','Encerra um processo')]),
  E('linux.proc','O que é um processo?','Um programa em execução',['Um arquivo de texto','Uma pasta','Um cabo'],'Rodando agora.'),
  V('linux.proc','Cada processo tem um número chamado PID.',True,'Serve para identificá-lo.'),
  E('linux.proc','Qual comando encerra o processo de PID 4321?','kill 4321',['rm 4321','cd 4321','cat 4321'],'kill + PID.',2),
  LG('linux.proc','Ligue cada comando ao que faz',[('ps','Lista processos'),('top','Mostra o uso em tempo real'),('kill','Encerra um processo')],'Ver, acompanhar, encerrar.'),
  E('linux.proc','Um programa travou. O que você faz no terminal?','Acha o PID com ps e usa kill',['Usa mkdir','Apaga o /home','Troca o cabo'],'Localize e encerre.',2)]),
 fase('Pacotes','linux.pacote','Instalar programas com apt',['linux.proc'],[
  L('Pacotes','No Ubuntu e no Debian, programas vêm em pacotes que o apt instala a partir de repositórios (lojas oficiais). Primeiro «sudo apt update» atualiza a lista; depois «sudo apt install nome» instala. Instalar exige administrador.',[('Pacote','Programa empacotado para instalar'),('Repositório','Loja online de pacotes'),('apt','Gerenciador de pacotes do Debian/Ubuntu')]),
  E('linux.pacote','Qual comando instala o programa htop?','sudo apt install htop',['apt remove htop','ls htop','cat htop'],'apt install instala.'),
  V('linux.pacote','«sudo apt update» atualiza a lista de pacotes disponíveis.',True,'Ele não instala nada ainda.'),
  E('linux.pacote','Por que instalar programas costuma exigir sudo?','Porque altera o sistema',['Porque é grátis','Porque apaga a tela','Porque usa o teclado'],'Mexe em pastas de sistema.',2),
  CL('linux.pacote','Qual comando faz o quê?',['Atualiza a lista','Instala um pacote'],[('sudo apt update','Atualiza a lista'),('sudo apt install nano','Instala um pacote'),('sudo apt install curl','Instala um pacote')],'update atualiza; install instala.',2),
  E('linux.pacote','Onde o apt busca os programas?','Em repositórios oficiais',['Na lixeira','No teclado','No /tmp apenas'],'Repositórios são as lojas.',2)])],
'extras':[
 E('linux.proc','Qual comando lista os processos?','ps',['pwd','cd','mv'],'ps = process status.',3),
 V('linux.pacote','No Ubuntu, o apt é um gerenciador de pacotes.',True,'Instala, atualiza e remove.',3),
 E('linux.proc','Para que o top é útil?','Ver em tempo real quem usa mais o computador',['Criar pastas','Copiar arquivos','Mudar de usuário'],'Acompanha processos.',3)],
'chamado':'lx_maquinas'})

# 9b Loja de programas
P.append({'lugar':'Loja de Programas','titulo':'Instalar programas','dicas':['apt search procura pacotes.','sudo apt install nome instala.','sudo apt remove nome tira um programa.'],
'fases':[
 fase('Buscar e instalar','linux.buscar','Buscar e instalar pacotes',['linux.pacote'],[
  L('Procurar e instalar','Antes de instalar, você pode procurar: «apt search palavra» lista os pacotes que combinam, sem mudar nada no sistema. Achou? «sudo apt install nome» instala. O apt baixa o programa e tudo de que ele depende, sozinho. Dá para instalar vários de uma vez: «sudo apt install nano tree».',[('apt search','Procura pacotes por palavra'),('Dependência','Outro programa de que o pacote precisa'),('apt install','Baixa e instala o pacote')]),
  E('linux.buscar','Qual comando procura pacotes sobre «tree»?','apt search tree',['apt look tree','ls tree','find apt tree'],'search procura nos repositórios.'),
  V('linux.buscar','O apt também baixa as dependências do programa.',True,'Ele cuida disso sozinho.'),
  E('linux.buscar','Qual comando instala o nano e o tree de uma vez?','sudo apt install nano tree',['sudo apt update nano tree','apt search nano tree','sudo ls nano tree'],'Vários nomes depois do install.',2),
  CL('linux.buscar','Qual comando faz o quê?',['Procura','Instala'],[('apt search editor','Procura'),('apt search rede','Procura'),('sudo apt install htop','Instala')],'search procura; install instala.',2),
  E('linux.buscar','O apt search precisa de sudo?','Não, só procurar não muda o sistema',['Sim, sempre','Só para pacotes grandes','Só às terças'],'Sudo é para mudar o sistema.',2)]),
 fase('Remover e outras formas','linux.remover','Remover e outras formas de instalar',['linux.buscar'],[
  L('Remover e outras formas','«sudo apt remove nome» tira um programa que você não usa mais. «sudo apt upgrade» atualiza todos os programas instalados (rode depois do update). Existem outras formas de instalar: baixar um arquivo .deb e instalar com «sudo dpkg -i arquivo.deb», ou usar o snap. Mas o apt é o jeito mais comum e seguro, porque vem dos repositórios oficiais.',[('apt remove','Desinstala um pacote'),('upgrade','Atualiza os programas instalados'),('.deb','Arquivo de instalação do Debian/Ubuntu')]),
  E('linux.remover','Qual comando remove o programa cowsay?','sudo apt remove cowsay',['sudo apt install cowsay','rm cowsay','apt update cowsay'],'remove desinstala.'),
  V('linux.remover','«sudo apt upgrade» atualiza os programas já instalados.',True,'Rode depois do update.'),
  E('linux.remover','Você baixou um arquivo .deb. Qual comando instala?','sudo dpkg -i arquivo.deb',['cat arquivo.deb','cd arquivo.deb','sudo apt remove arquivo.deb'],'dpkg -i instala um .deb.',2),
  LG('linux.remover','Ligue cada comando ao que faz',[('apt update','Atualiza a lista'),('apt upgrade','Atualiza os programas'),('apt remove','Desinstala'),('apt search','Procura pacotes')],'Cada um com sua tarefa.'),
  E('linux.remover','Por que preferir o apt a instaladores de sites aleatórios?','Vem de repositórios oficiais, mais seguro',['É mais colorido','Usa menos teclas','Não precisa de internet'],'Fonte confiável.',2)])],
'extras':[
 E('linux.buscar','Qual comando instala um programa no Ubuntu?','sudo apt install',['sudo apt search','ls install','cat apt'],'install instala.',3),
 V('linux.remover','O apt remove desinstala um programa.',True,'Tira o pacote do sistema.',3),
 E('linux.remover','Qual vem primeiro: update ou upgrade?','update, para atualizar a lista',['upgrade','remove','Tanto faz'],'Lista primeiro, programas depois.',3)],
'chamado':'lx_loja'})

# 10 Redes
P.append({'lugar':'Torre de Rede','titulo':'Rede no terminal','dicas':['ip a mostra seu endereço IP.','ping testa se alguém responde.','curl busca uma página ou serviço.'],
'fases':[
 fase('Meu endereço','linux.ip','Ver IP e interfaces',['linux.remover'],[
  L('Meu endereço','O terminal também cuida da rede. «ip a» mostra as interfaces de rede e os endereços IP. «hostname» mostra o nome da máquina. A interface lo (loopback, 127.0.0.1) é a própria máquina falando consigo.',[('Interface','Ponto de conexão de rede da máquina'),('IP','Endereço da máquina na rede'),('127.0.0.1','O endereço da própria máquina')]),
  E('linux.ip','Qual comando mostra seus endereços IP?','ip a',['ls -l','pwd','whoami'],'ip a lista as interfaces.'),
  V('linux.ip','O endereço 127.0.0.1 é o da própria máquina.',True,'É o loopback.'),
  E('linux.ip','O que o comando hostname mostra?','O nome da máquina',['O IP da internet','A senha','A hora'],'Nome do computador.',2),
  LG('linux.ip','Ligue cada coisa ao significado',[('ip a','Mostra IPs e interfaces'),('hostname','Nome da máquina'),('127.0.0.1','A própria máquina')],'Quem sou eu na rede.'),
  E('linux.ip','Para que serve a interface lo?','A máquina conversar consigo mesma',['Dar Wi-Fi','Guardar fotos','Trocar de usuário'],'Loopback.',2)]),
 fase('Testar a conexão','linux.ping','ping e curl',['linux.ip'],[
  L('Testar a conexão','«ping destino» envia pacotes e espera resposta: mostra se o destino está vivo e quanto tempo levou (ms). «curl endereço» busca uma página ou serviço e mostra a resposta. Se ping funciona mas curl não, o problema pode estar no serviço, não na rede.',[('ping','Testa se o destino responde'),('curl','Busca uma página ou serviço'),('ms','Milissegundos, o tempo da resposta')]),
  E('linux.ping','Para que serve o ping?','Testar se um destino responde',['Apagar arquivos','Criar usuários','Mudar permissões'],'Pacotes de teste.'),
  V('linux.ping','O curl pode buscar uma página da web pelo terminal.',True,'Ele pede e mostra a resposta.'),
  E('linux.ping','O ping funciona, mas o curl não traz a página. Qual é a pista?','A rede está ok; o serviço pode estar com problema',['O cabo quebrou','O Linux acabou','O teclado falhou'],'A rede respondeu.',2),
  CL('linux.ping','Qual comando usar?',['ping','curl','ip a'],[('Ver se o servidor responde','ping'),('Buscar o conteúdo de uma página','curl'),('Descobrir o meu IP','ip a')],'Cada um com sua tarefa.',2),
  E('linux.ping','O que significa o tempo em ms no ping?','O tempo que a resposta levou',['O tamanho do arquivo','A senha','O número de usuários'],'Menos é melhor.',2)])],
'extras':[
 E('linux.ip','Qual comando mostra seu IP no Linux?','ip a',['mkdir','touch','cp'],'Lista interfaces.',3),
 V('linux.ping','Um ping sem resposta pode indicar problema de rede, firewall ou o destino desligado.',True,'Há várias causas possíveis.',3),
 E('linux.ping','Qual comando traz o conteúdo de uma página?','curl',['ping','ls','chmod'],'curl busca.',3)],
'chamado':'lx_torre'})
