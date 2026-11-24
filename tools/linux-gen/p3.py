from h import *
P=[]
P.append({'lugar':'Oficina de Scripts','titulo':'Seu primeiro script','dicas':['Script é um arquivo com comandos.','A 1ª linha é #!/bin/bash.','chmod +x e depois ./nome.sh.'],
'fases':[
 fase('Criar e executar','linux.script','Criar e executar scripts',['linux.ping'],[
  L('Seu primeiro script','Um script é um arquivo de texto com comandos que o Linux executa em sequência. A primeira linha, #!/bin/bash, diz qual programa vai interpretá-lo. Para criar sem editor: echo "texto" > arquivo grava a primeira linha, e >> acrescenta outra. Depois dê permissão com chmod +x e rode com ./nome.sh.',[('Script','Arquivo com comandos em sequência'),('#!/bin/bash','Diz quem interpreta o script'),('./','Executa um arquivo da pasta atual')]),
  E('linux.script','O que é um script?','Um arquivo de texto com comandos para executar em sequência',['Um tipo de cabo','Uma senha do sistema','Uma pasta oculta'],'Comandos guardados num arquivo.'),
  V('linux.script','A linha #!/bin/bash no começo indica qual programa interpreta o script.',True,'É o «shebang».'),
  E('linux.script','Qual comando executa o script ola.sh da pasta atual?','./ola.sh',['ola.sh run','cat ola.sh','cd ola.sh'],'O ./ diz «nesta pasta».'),
  E('linux.script','Rodei ./ola.sh e deu «Permissão negada». O que falta?','chmod +x ola.sh',['rm ola.sh','sudo apt install ola','cd /'],'Falta a permissão de execução.',2),
  LG('linux.script','Ligue cada item ao que faz',[('#!/bin/bash','Diz quem interpreta o script'),('>','Grava a primeira linha (substitui)'),('>>','Acrescenta uma linha'),('chmod +x','Libera a execução')],'Cada peça do script.')]),
 fase('Variáveis','linux.var','Variáveis e argumentos',['linux.script'],[
  L('Variáveis','Uma variável guarda um valor: nome="Pingo" (sem espaços em volta do =). Para usar, ponha $ na frente: echo $nome. O sistema já tem algumas, como $USER (seu usuário) e $HOME (sua pasta). Em scripts, $1 é o primeiro argumento da chamada: ./saudar.sh Ana faz $1 valer Ana.',[('Variável','Nome que guarda um valor'),('$USER','Seu nome de usuário'),('$1','Primeiro argumento do script')]),
  E('linux.var','Como mostrar o valor da variável nome?','echo $nome',['echo nome','echo $ nome','print nome'],'O $ lê o valor.'),
  V('linux.var','Em nome="Pingo", não pode haver espaços em volta do sinal de =.',True,'Com espaço, o Linux acha que nome é um comando.'),
  E('linux.var','O que a variável $HOME guarda?','O caminho da sua pasta pessoal',['A hora atual','O nome da máquina','A sua senha'],'É o seu «lar».'),
  E('linux.var','Em ./saudar.sh Ana, quanto vale $1 dentro do script?','Ana',['saudar.sh','$1','Nada'],'$1 é o primeiro argumento.',2),
  CL('linux.var','Variável ou comando?',['Variável','Comando'],[('$USER','Variável'),('$HOME','Variável'),('echo','Comando'),('chmod','Comando')],'Variáveis começam com $.')])],
'extras':[
 E('linux.script','Qual linha vai no começo de um script de bash?','#!/bin/bash',['#bash!','//bin/bash','$bash'],'O shebang.',3),
 V('linux.var','$USER guarda o nome do usuário atual.',True,'Útil em scripts.',3),
 E('linux.script','Qual operador acrescenta uma linha sem apagar o arquivo?','>>',['>','|','&'],'>> acrescenta.',3)],
'chamado':'lx_script'})
P.append({'lugar':'Relógio de Tarefas','titulo':'Agendar com cron','dicas':['cron roda tarefas sozinho.','5 campos: minuto hora dia mês semana.','crontab arquivo instala a agenda.'],
'fases':[
 fase('Regra do cron','linux.cron','Ler e escrever regras do cron',['linux.var'],[
  L('Regras do cron','O cron roda tarefas sozinho, no horário marcado. Cada regra tem 5 campos de tempo e depois o comando: minuto, hora, dia do mês, mês e dia da semana. O * quer dizer «qualquer». Então 0 3 * * * roda todo dia às 3h; 0 8 * * 1 roda toda segunda às 8h.',[('cron','Agendador de tarefas do Linux'),('*','Qualquer valor naquele campo'),('0 3 * * *','Todo dia às 3h')]),
  E('linux.cron','O que significa 0 3 * * * seguido de um comando?','Rodar todo dia às 3h da manhã',['Rodar a cada 3 minutos','Rodar só em março','Rodar 3 vezes por dia'],'Minuto 0, hora 3, todo dia.'),
  V('linux.cron','No cron, o * em um campo significa «qualquer valor».',True,'Vale para todos os valores.'),
  E('linux.cron','Qual regra roda um script toda segunda-feira às 8h?','0 8 * * 1',['8 0 * * 1','0 8 1 * *','1 8 * * 0'],'Minuto 0, hora 8, dia da semana 1.',2),
  LG('linux.cron','Ligue cada regra ao horário',[('0 3 * * *','Todo dia às 3h'),('0 8 * * 1','Toda segunda às 8h'),('30 22 * * *','Todo dia às 22h30'),('0 0 1 * *','Todo dia 1º, à meia-noite')],'Leia campo por campo.'),
  E('linux.cron','Qual é a ordem dos campos do cron?','minuto, hora, dia do mês, mês, dia da semana',['hora, minuto, ano, mês, dia','dia, mês, ano, hora, minuto','segundo, minuto, hora, dia, ano'],'Do menor para o maior.',2)]),
 fase('Instalar a agenda','linux.crontab','Instalar a agenda com crontab',['linux.cron'],[
  L('crontab','As regras ficam num arquivo de texto. O comando crontab arquivo instala essas regras como a sua agenda, e crontab -l mostra a agenda instalada. crontab -e abre o editor para mudar na hora. Use caminhos completos nos comandos, porque o cron não sabe em que pasta você está.',[('crontab','Instala e gerencia a sua agenda'),('crontab -l','Mostra a agenda instalada'),('Caminho completo','Começa em / e vale de qualquer lugar')]),
  E('linux.crontab','Qual comando mostra a sua agenda do cron?','crontab -l',['crontab -e','cron show','ls cron'],'-l de list.'),
  V('linux.crontab','Escrever a regra num arquivo não basta: é preciso instalá-lo com crontab arquivo.',True,'Instalar ativa a agenda.'),
  E('linux.crontab','Por que usar o caminho completo (/home/aluno/backup.sh) na regra?','O cron não sabe em que pasta você está',['Fica mais bonito','Gasta menos memória','O Linux exige letras maiúsculas'],'Sem pasta atual, só o caminho completo funciona.',2),
  E('linux.crontab','Qual comando instala as regras do arquivo agenda.txt?','crontab agenda.txt',['cat agenda.txt','cp agenda.txt cron','chmod +x agenda.txt'],'crontab + arquivo.'),
  CL('linux.crontab','O que cada comando faz?',['Instala a agenda','Mostra a agenda'],[('crontab agenda.txt','Instala a agenda'),('crontab -l','Mostra a agenda'),('crontab regras.txt','Instala a agenda')],'Arquivo instala; -l mostra.',2)])],
'extras':[
 E('linux.cron','Qual regra roda todo dia às 22h30?','30 22 * * *',['22 30 * * *','0 22 30 * *','* * 22 30 *'],'Minuto 30, hora 22.',3),
 V('linux.crontab','O comando crontab -l mostra a agenda instalada.',True,'List.',3),
 E('linux.cron','Quantos campos de tempo tem uma regra do cron?','5',['3','7','2'],'Minuto, hora, dia, mês, semana.',3)],
'chamado':'lx_agenda'})
P.append({'lugar':'Caçador de Arquivos','titulo':'Buscar e medir','dicas':['find procura por nome.','O * vale por «qualquer coisa».','df -h mostra o espaço dos discos.'],
'fases':[
 fase('Procurar com find','linux.find','Procurar arquivos com find',['linux.crontab'],[
  L('find','find procura arquivos por nome, a partir de uma pasta: find /var -name "*.log" acha todos os .log dentro de /var. O * vale por «qualquer coisa», então *.log é «qualquer nome que termine em .log». Use find . para procurar a partir da pasta atual. Dá para ligar com pipe: find ... | wc -l conta os resultados.',[('find','Procura arquivos'),('-name','Filtra pelo nome'),('*','Qualquer coisa')]),
  E('linux.find','Qual comando acha todos os arquivos .log dentro de /var?','find /var -name "*.log"',['ls /var *.log','grep /var .log','cat /var/*.log'],'find + pasta + -name.'),
  V('linux.find','find . procura a partir da pasta onde você está.',True,'O ponto é a pasta atual.'),
  E('linux.find','O que o * significa em "*.log"?','Qualquer coisa antes do .log',['Só números','Nada: é um erro','Só uma letra'],'Curinga.'),
  E('linux.find','Como contar quantos .log existem em /var?','find /var -name "*.log" | wc -l',['wc -l /var','find /var | cat','ls /var > wc'],'Pipe liga o find ao wc.',2),
  LG('linux.find','Ligue cada item ao que faz',[('find . -name notas.txt','Procura notas.txt a partir daqui'),('find / -name "*.conf"','Procura todos os .conf do sistema'),('-name','Filtra pelo nome'),('| wc -l','Conta os resultados')],'Combine as peças.')]),
 fase('Espaço em disco','linux.disco','Espaço em disco com df e du',['linux.find'],[
  L('Espaço em disco','df -h mostra o espaço de cada disco: tamanho, usado, disponível e a porcentagem de uso. O -h quer dizer «human», legível, com G e M. Já du -sh pasta mostra quanto uma pasta ocupa. Disco acima de 90% é alerta: o sistema pode parar de gravar logs.',[('df','Espaço dos discos'),('du','Espaço de uma pasta'),('-h','Valores legíveis (G, M)')]),
  E('linux.disco','Qual comando mostra o espaço livre dos discos?','df -h',['ps -h','kill -h','whoami -h'],'df = disk free.'),
  V('linux.disco','O -h do df -h mostra valores em formato legível, como G e M.',True,'h de human.'),
  E('linux.disco','Qual comando mostra quanto uma pasta ocupa?','du -sh pasta',['df -h pasta','cat pasta','cd pasta'],'du = disk usage.'),
  E('linux.disco','O disco está com 95% de uso. O que isso indica?','Está quase cheio: hora de limpar',['Está ótimo','Falta instalar o Linux','A internet caiu'],'Perto do limite.',2),
  CL('linux.disco','Qual comando responde cada pergunta?',['df -h','du -sh pasta'],[('Quanto espaço livre tem o disco?','df -h'),('Quanto essa pasta ocupa?','du -sh pasta'),('Qual disco está mais cheio?','df -h')],'Disco inteiro: df. Pasta: du.',2)])],
'extras':[
 E('linux.find','Qual comando procura notas.txt a partir da pasta atual?','find . -name notas.txt',['ls notas.txt','cat find','find notas.txt .'],'find + . + -name.',3),
 V('linux.disco','O du mostra o tamanho de pastas.',True,'Disk usage.',3),
 E('linux.disco','O que quer dizer o -h em df -h?','Formato legível para humanos',['Esconder arquivos','Ajuda do sistema','Histórico'],'Human.',3)],
'chamado':'lx_busca'})
P.append({'lugar':'Portal Remoto','titulo':'Acesso remoto (SSH)','dicas':['ssh usuario@servidor entra em outro PC.','Porta padrão: 22.','scp copia arquivos pela rede.'],
'fases':[
 fase('Conectar com ssh','linux.ssh','Conectar com ssh',['linux.disco'],[
  L('ssh','O ssh acessa outro computador pela rede de forma segura, direto do terminal: ssh usuario@servidor. A conexão é criptografada e usa a porta 22. Se o nome não existir, dá erro de nome; se o usuário não tiver acesso, dá «Permissão negada». Antes de conectar, vale um ping para ver se o servidor responde.',[('ssh','Acesso remoto seguro'),('Porta 22','Porta padrão do ssh'),('Criptografia','Dados embaralhados no caminho')]),
  E('linux.ssh','Qual comando conecta ao servidor.local como admin?','ssh admin@servidor.local',['ping admin@servidor.local','cd servidor.local','curl admin servidor.local'],'ssh usuario@servidor.'),
  V('linux.ssh','O ssh usa uma conexão criptografada, por isso é seguro para administrar servidores.',True,'Os dados vão embaralhados.'),
  E('linux.ssh','Qual é a porta padrão do ssh?','22',['80','443','8080'],'22.'),
  E('linux.ssh','O ssh respondeu «Permissão negada». Qual é a pista?','O usuário não tem acesso a esse servidor',['O cabo quebrou','O servidor foi desligado','O terminal travou'],'O servidor respondeu, mas recusou.',2),
  LG('linux.ssh','Ligue cada item ao que faz',[('ssh','Entra em outro computador'),('ping','Testa se o servidor responde'),('Porta 22','Porta padrão do ssh'),('usuario@servidor','Formato do destino')],'Cada peça da conexão.')]),
 fase('Chaves e scp','linux.chaves','Chaves e cópia com scp',['linux.ssh'],[
  L('Chaves e cópia','Em vez de senha, o ssh usa um par de chaves: a privada fica só com você e a pública vai para o servidor. ssh-keygen cria o par. Para copiar um arquivo para o servidor use scp arquivo usuario@servidor:/pasta/. Nunca envie a chave privada para ninguém.',[('Chave privada','Fica só com você'),('Chave pública','Pode ir para o servidor'),('scp','Copia arquivos pela rede')]),
  E('linux.chaves','Qual comando cria um par de chaves?','ssh-keygen',['ssh-key','ssh new','keygen ssh'],'keygen = gerador de chaves.'),
  V('linux.chaves','A chave privada deve ficar só com você.',True,'Quem tem a privada entra como você.'),
  E('linux.chaves','Qual comando copia relatorio.txt para admin@servidor.local?','scp relatorio.txt admin@servidor.local:/tmp/',['cp relatorio.txt admin@servidor.local','ssh relatorio.txt','mv admin@servidor.local relatorio.txt'],'scp arquivo destino.',2),
  E('linux.chaves','Qual chave você envia ao servidor?','A chave pública',['A chave privada','As duas','Nenhuma: só a senha'],'A pública.'),
  LG('linux.chaves','Ligue cada item ao que faz',[('ssh-keygen','Cria o par de chaves'),('scp','Copia arquivo pela rede'),('Chave pública','Vai para o servidor'),('Chave privada','Fica só com você')],'Quem vai para onde.')])],
'extras':[
 E('linux.ssh','O que o ssh faz?','Entra em outro computador com segurança',['Apaga arquivos','Mede o disco','Cria usuários'],'Acesso remoto.',3),
 V('linux.chaves','O scp copia arquivos entre computadores pela rede.',True,'Secure copy.',3),
 E('linux.ssh','Antes de conectar, o que ajuda a ver se o servidor responde?','ping',['chmod','mkdir','crontab'],'Teste de rede.',3)],
'chamado':'lx_remoto'})
