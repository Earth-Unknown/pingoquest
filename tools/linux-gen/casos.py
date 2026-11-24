H='/home/aluno/'
def C(id,title,skill,intro,passos,**k):
    d={'id':id,'tipo':'terminal','title':title,'skill':skill,'skillText':skill,'intro':intro,'passos':passos}
    d.update(k);return d
def S(t,dica,feito,ok=None):
    d={'texto':t,'dica':dica,'feito':feito}
    if ok:d['ok']=ok
    return d
CASOS=[
C('lx_acesso','Quem está aí?','Reconhecer o sistema','Você acabou de entrar no servidor da Vila. Antes de mexer em qualquer coisa, descubra quem você é e onde está.',[
 S('Descubra o seu nome de usuário','O comando que responde «quem sou eu?» em inglês é who am I, tudo junto.',{'cmd':'^\\s*whoami'},'Esse é você no sistema.'),
 S('Descubra o nome desta máquina','O comando tem o mesmo nome da coisa que você quer saber: host + name.',{'cmd':'^\\s*hostname'},'Nome anotado.'),
 S('Descubra em que pasta você está','pwd = print working directory.',{'cmd':'^\\s*pwd'},'Você está na sua pasta pessoal.')],
 cenario={'usuario':'aluno','maquina':'servidor-pingo'},conclusao='Você se reconheceu no servidor com whoami, hostname e pwd',explicacao='whoami mostra o usuário, hostname mostra o nome da máquina e pwd mostra a pasta atual. São os três primeiros comandos de quem chega a um servidor novo.',final='Reconhecimento feito!'),

C('lx_comandos','O arquivo escondido','Listar e ler','Alguém deixou um recado numa pasta, mas ele não aparece no ls comum. Ache e leia.',[
 S('Liste TODOS os arquivos, inclusive os ocultos','Arquivos que começam com ponto ficam escondidos. A opção -a mostra todos.',{'cmd':'^\\s*ls\\s+(-\\w*a|.*\\s-\\w*a)'},'Apareceu um arquivo com ponto no começo.'),
 S('Veja os detalhes dos arquivos (tamanho, dono, permissões)','Use a opção -l.',{'cmd':'^\\s*ls\\s+(-\\w*l|.*\\s-\\w*l)'}),
 S('Leia o recado escondido','cat mostra o conteúdo. O nome do arquivo começa com ponto.',{'saida':'Reunião às 15h'},'Recado lido.')],
 fs={H+'notas.txt':'Comprar cabos de rede',H+'fotos/':None,H+'.recado':'Reunião às 15h na sala de máquinas.'},
 conclusao='Você achou e leu um arquivo oculto',explicacao='ls -a mostra arquivos ocultos (os que começam com ponto). ls -l mostra detalhes. cat lê o conteúdo.',final='Recado encontrado!'),

C('lx_pastas','Perdido no mapa','Navegar pelas pastas','Você foi parar na raiz do servidor. Navegue até o lugar certo e volte para casa.',[
 S('Vá até a pasta /var/log','Use cd com o caminho absoluto, que começa na raiz.',{'cwd':'/var/log'},'Você chegou na pasta dos logs.'),
 S('Volte para a sua pasta pessoal','cd sozinho, ou cd ~, leva você para casa.',{'cwd':H[:-1]},'Em casa!'),
 S('Entre na pasta docs usando caminho relativo','Estando em casa, basta cd docs.',{'cwd':H+'docs'},'Dentro de docs.')],
 cenario={'usuario':'aluno','maquina':'servidor-pingo','inicio':'/'},fs={'/var/log/':None,H+'docs/':None},
 conclusao='Você navegou com caminhos absolutos e relativos',explicacao='O caminho absoluto começa em / e vale de qualquer lugar. O relativo parte da pasta atual. cd sem argumento volta para a pasta pessoal.',final='De volta ao mapa!'),

C('lx_arquivos','Arrumando a bagunça','Criar, copiar, mover e apagar','Sua pasta está uma bagunça: tem relatorio.txt, rascunho.txt e lixo.txt soltos. Organize!',[
 S('Crie a pasta projetos','mkdir cria pastas.',{'existe':H+'projetos'}),
 S('Dentro de projetos, crie o arquivo ideias.txt','touch projetos/ideias.txt',{'existe':H+'projetos/ideias.txt'}),
 S('Copie o relatorio.txt (já está na sua pasta) para dentro de projetos','cp origem destino. A origem continua existindo.',{'existe':H+'projetos/relatorio.txt'}),
 S('Renomeie o rascunho.txt (também já está aí) para final.txt','mv com um novo nome renomeia.',{'existe':H+'final.txt','naoexiste':H+'rascunho.txt'}),
 S('Apague o lixo.txt','rm apaga. Confira o nome antes!',{'naoexiste':H+'lixo.txt'})],
 fs={H+'relatorio.txt':'Relatório do mês',H+'rascunho.txt':'versão 1',H+'lixo.txt':'apagar'},
 conclusao='Você organizou a pasta com mkdir, touch, cp, mv e rm',explicacao='mkdir cria pasta, touch cria arquivo vazio, cp copia, mv move ou renomeia e rm apaga. No terminal não há lixeira, então confira antes de apagar.',final='Pasta organizada!'),

C('lx_logs','Caça ao erro','Ler e filtrar logs','O sistema anda reclamando. Descubra quantos erros há no log.',[
 S('Veja as últimas linhas do log','tail mostra o fim do arquivo. O log está em /var/log/app.log.',{'cmd':'^\\s*tail\\s'}),
 S('Mostre só as linhas com ERRO','grep ERRO /var/log/app.log',{'cmd':'grep\\s+(-\\w+\\s+)*ERRO'}),
 S('Conte quantas linhas têm ERRO','Una grep e wc -l com um pipe, ou use grep -c.',{'cmd':'(grep\\s+ERRO\\s+\\S+\\s*\\|\\s*wc\\s+-l|grep\\s+-c\\s+ERRO|cat\\s+\\S+\\s*\\|\\s*grep\\s+ERRO\\s*\\|\\s*wc\\s+-l)'},'São 3 erros. Já dá para investigar.')],
 fs={'/var/log/app.log':'INFO inicio\nINFO conectado\nERRO disco cheio\nINFO tentativa 1\nERRO sem rede\nINFO tentativa 2\nERRO timeout\nINFO fim'},
 conclusao='Você filtrou e contou os erros do log',explicacao='tail mostra o fim, grep filtra linhas e wc -l conta. Juntos, com pipe, respondem «quantos erros houve?» em uma linha.',final='3 erros achados!'),

C('lx_esteira','A esteira de vendas','Pipes e redirecionamento','Monte uma esteira que separa as vendas pendentes e guarda num relatório.',[
 S('Do vendas.txt (já está na sua pasta), grave só as linhas «pendente» em pendentes.txt','grep pendente vendas.txt > pendentes.txt',{'conteudo':[H+'pendentes.txt','pendente']}),
 S('Acrescente a linha «fim do relatorio» ao final de pendentes.txt','Use >> para acrescentar sem apagar.',{'conteudo':[H+'pendentes.txt','fim do relatorio']}),
 S('Conte quantas linhas o relatório tem','wc -l pendentes.txt, ou cat pendentes.txt | wc -l',{'cmd':'wc\\s+-l'})],
 fs={H+'vendas.txt':'1 pago cabo\n2 pendente roteador\n3 pago switch\n4 pendente antena\n5 pendente fonte'},
 conclusao='Você filtrou, gravou e acrescentou com pipes e redirecionamento',explicacao='> grava a saída num arquivo (substituindo); >> acrescenta ao fim. O pipe | passa a saída de um comando para o próximo.',final='Relatório pronto!'),

C('lx_portaria','O script bloqueado','Permissões','O script de backup não roda. Descubra por quê e libere só o que for preciso.',[
 S('Veja as permissões dos arquivos da pasta (backup.sh e nota.txt já estão aí)','ls -l mostra as permissões na primeira coluna.',{'cmd':'^\\s*ls\\s+(-\\w*l|.*\\s-\\w*l)'}),
 S('Dê a permissão de executar ao backup.sh','chmod +x backup.sh',{'perm':[H+'backup.sh','x']},'Agora ele tem o x.'),
 S('Execute o script','Use ./backup.sh',{'exec':H+'backup.sh'},'Backup rodou!'),
 S('Proteja nota.txt contra alterações (tire a escrita)','chmod -w nota.txt',{'semperm':[H+'nota.txt','w']})],
 fs={H+'backup.sh':'#!/bin/bash\ncp -r docs backup/',H+'nota.txt':'Não alterar'},
 exec={H+'backup.sh':'Copiando docs... backup concluído.'},
 conclusao='Você liberou a execução e protegeu um arquivo com chmod',explicacao='Sem a permissão x o script não executa («Permissão negada»). chmod +x libera; chmod -w impede alterações.',final='Portaria liberada!'),

C('lx_admin','Chave do administrador','Usuários e sudo','Um arquivo de configuração precisa entrar na pasta de sistema, onde usuário comum não escreve.',[
 S('Confirme quem você é','whoami',{'cmd':'^\\s*whoami'}),
 S('Crie a pasta /etc/pingo.d como administrador','Sem sudo dá «Permissão negada». sudo mkdir /etc/pingo.d',{'existe':'/etc/pingo.d'},'Pasta criada com poderes de administrador.'),
 S('Copie o pingo.conf (já está na sua pasta) para /etc/pingo.d/','sudo cp pingo.conf /etc/pingo.d/',{'existe':'/etc/pingo.d/pingo.conf'},'Configuração instalada.')],
 fs={H+'pingo.conf':'modo=ativo','/etc/':None},
 conclusao='Você usou o sudo só nos comandos que precisavam',explicacao='Arquivos de sistema pertencem ao root. O sudo dá poder de administrador a um comando só, sem virar root o tempo todo.',final='Configuração instalada!'),

C('lx_maquinas','Programa travado','Processos e pacotes','Um programa travou e o servidor está lento. Encerre-o e instale uma ferramenta de monitoramento.',[
 S('Liste os processos','ps',{'cmd':'^\\s*(ps|top)\\b'}),
 S('Encerre o processo travado (travado.sh)','Descubra o PID com ps e use kill PID.',{'matou':2201},'Processo encerrado.'),
 S('Atualize a lista de pacotes','sudo apt update',{'cmd':'sudo\\s+apt\\s+update'}),
 S('Instale o htop','sudo apt install htop',{'instalou':'htop'},'htop instalado.')],
 processos=[{'pid':1180,'nome':'editor','dono':'aluno'},{'pid':2201,'nome':'travado.sh','dono':'aluno','cpu':'98%'},{'pid':2300,'nome':'relogio','dono':'aluno'}],
 pacotes=['htop','nano','curl'],
 conclusao='Você encerrou um processo e instalou um pacote',explicacao='ps mostra os processos e seus PID; kill PID encerra. Instalar com apt exige sudo, e «apt update» vem antes para atualizar a lista.',final='Servidor aliviado!'),

C('lx_loja','Ferramentas novas','Instalar programas','O servidor precisa de ferramentas novas. Procure, instale e limpe o que não serve mais.',[
 S('Atualize a lista de pacotes','sudo apt update',{'cmd':'sudo\\s+apt\\s+update'}),
 S('Procure um programa que mostre pastas em árvore (a palavra é «tree»)','apt search tree',{'cmd':'^\\s*(sudo\\s+)?apt\\s+search\\s+tree'},'Achou o pacote tree.'),
 S('Instale o tree','sudo apt install tree',{'instalou':'tree'},'tree instalado.'),
 S('Remova o cowsay, que ninguém usa mais','sudo apt remove cowsay',{'removeu':'cowsay'},'cowsay removido.')],
 pacotes=['tree','nano','htop','curl','cowsay'],instalados=['cowsay'],
 pacdesc={'tree':'mostra pastas em árvore','nano':'editor de texto simples','htop':'monitor de processos','curl':'busca páginas pelo terminal','cowsay':'vaquinha que fala'},
 conclusao='Você procurou, instalou e removeu programas com apt',explicacao='apt search procura, sudo apt install instala e sudo apt remove desinstala. Mexer em programas altera o sistema, por isso precisa de sudo; só procurar não precisa.',final='Ferramentas prontas!'),

C('lx_torre','Sinal da torre','Rede no terminal','A torre de rede da Vila parece fora do ar. Use o terminal para testar.',[
 S('Veja o seu endereço IP','ip a',{'cmd':'^\\s*ip\\s+a'}),
 S('Teste se gateway.local responde','ping gateway.local',{'cmd':'^\\s*ping\\s+(-\\w+\\s+\\d+\\s+)?gateway\\.local'},'O gateway respondeu.'),
 S('Busque o status do serviço em http://servidor.local/status','curl http://servidor.local/status',{'saida':'ativo'},'O serviço está ativo.')],
 rede={'ip':'192.168.0.15','hosts':{'gateway.local':'1.2','servidor.local':True},'curl':{'http://servidor.local/status':'servico: ativo'}},
 conclusao='Você testou a rede com ip, ping e curl',explicacao='ip a mostra seu IP, ping testa se o destino responde e curl busca o conteúdo do serviço. Rede ok + serviço ativo = problema não estava na torre.',final='Torre no ar!'),
]

RESP={'lx_acesso': ['whoami', 'hostname', 'pwd'], 'lx_comandos': ['ls -a', 'ls -l', 'cat .recado'], 'lx_pastas': ['cd /var/log', 'cd', 'cd docs'], 'lx_arquivos': ['mkdir projetos', 'touch projetos/ideias.txt', 'cp relatorio.txt projetos/', 'mv rascunho.txt final.txt', 'rm lixo.txt'], 'lx_logs': ['tail /var/log/app.log', 'grep ERRO /var/log/app.log', 'grep ERRO /var/log/app.log | wc -l'], 'lx_esteira': ['grep pendente vendas.txt > pendentes.txt', 'echo fim do relatorio >> pendentes.txt', 'wc -l pendentes.txt'], 'lx_portaria': ['ls -l', 'chmod +x backup.sh', './backup.sh', 'chmod -w nota.txt'], 'lx_admin': ['whoami', 'sudo mkdir /etc/pingo.d', 'sudo cp pingo.conf /etc/pingo.d/'], 'lx_maquinas': ['ps', 'kill 2201', 'sudo apt update', 'sudo apt install htop'], 'lx_loja': ['sudo apt update', 'apt search tree', 'sudo apt install tree', 'sudo apt remove cowsay'], 'lx_torre': ['ip a', 'ping gateway.local', 'curl http://servidor.local/status']}
GUIA={'lx_acesso': [['whoami', 'mostra o seu nome de usuário'], ['hostname', 'mostra o nome da máquina'], ['pwd', 'mostra a pasta em que você está']], 'lx_comandos': [['ls', 'lista os arquivos da pasta'], ['ls -a', 'inclui os arquivos ocultos (começam com ponto)'], ['ls -l', 'mostra detalhes: dono, tamanho e permissões'], ['cat arquivo', 'mostra o conteúdo do arquivo']], 'lx_pastas': [['cd pasta', 'entra na pasta'], ['cd', 'volta para a sua pasta pessoal'], ['cd ..', 'sobe uma pasta'], ['pwd', 'mostra onde você está']], 'lx_arquivos': [['mkdir nome', 'cria uma pasta'], ['touch nome', 'cria um arquivo vazio'], ['cp origem destino', 'copia (o original fica)'], ['mv origem destino', 'move ou renomeia'], ['rm nome', 'apaga (não tem lixeira!)']], 'lx_logs': [['tail arquivo', 'mostra as últimas linhas'], ['grep texto arquivo', 'mostra só as linhas com o texto'], ['wc -l', 'conta linhas'], ['comando1 | comando2', 'liga a saída de um na entrada do outro']], 'lx_esteira': [['grep texto arquivo', 'filtra linhas'], ['comando > arquivo', 'grava a saída no arquivo (substitui)'], ['comando >> arquivo', 'acrescenta ao fim do arquivo'], ['echo texto', 'escreve um texto'], ['wc -l arquivo', 'conta as linhas']], 'lx_portaria': [['ls -l', 'mostra as permissões'], ['chmod +x arquivo', 'permite executar'], ['chmod -w arquivo', 'tira a permissão de escrever'], ['./arquivo', 'executa o arquivo da pasta atual']], 'lx_admin': [['whoami', 'mostra quem você é'], ['sudo comando', 'roda UM comando como administrador'], ['mkdir pasta', 'cria pasta'], ['cp origem destino', 'copia arquivos']], 'lx_maquinas': [['ps', 'lista os processos e os PIDs'], ['kill PID', 'encerra o processo'], ['sudo apt update', 'atualiza a lista de pacotes'], ['sudo apt install nome', 'instala um programa']], 'lx_loja': [['sudo apt update', 'atualiza a lista de pacotes'], ['apt search palavra', 'procura pacotes'], ['sudo apt install nome', 'instala um programa'], ['sudo apt remove nome', 'desinstala um programa']], 'lx_torre': [['ip a', 'mostra seu endereço IP'], ['ping destino', 'testa se o destino responde'], ['curl endereço', 'busca o conteúdo de uma página']]}
for c in CASOS:
    for p,r in zip(c['passos'],RESP[c['id']]): p['resposta']=r
    c['guia']=[{'cmd':a,'serve':b} for a,b in GUIA[c['id']]]
