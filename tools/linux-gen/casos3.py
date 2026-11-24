from casos import C,S,H
CASOS3=[
C('lx_script','Script de boas-vindas','Seu primeiro script','O servidor precisa de um script de boas-vindas. Crie, libere e rode.',[
 S('Crie o arquivo ola.sh com a primeira linha #!/bin/bash','Use echo com aspas e o sinal >: echo "#!/bin/bash" > ola.sh',{'conteudo':[H+'ola.sh','#!/bin/bash']},'Primeira linha gravada.'),
 S('Acrescente a linha: echo Ola Pingo','Use >> para acrescentar sem apagar: echo "echo Ola Pingo" >> ola.sh',{'conteudo':[H+'ola.sh','echo Ola Pingo']}),
 S('Dê permissão de execução ao ola.sh','chmod +x ola.sh',{'perm':[H+'ola.sh','x']}),
 S('Execute o script','./ola.sh',{'exec':H+'ola.sh'},'O script rodou!')],
 exec={H+'ola.sh':'Ola Pingo'},
 conclusao='Você criou, liberou e executou um script',explicacao='echo > cria a primeira linha, echo >> acrescenta outras, chmod +x libera a execução e ./ola.sh roda o script.',final='Script no ar!'),
C('lx_agenda','Backup automático','Agendar com cron','O backup precisa rodar sozinho. Escreva as regras do cron e instale a agenda.',[
 S('Crie agenda.txt com a regra: todo dia às 3h, rodando /home/aluno/backup.sh','echo "0 3 * * * /home/aluno/backup.sh" > agenda.txt',{'conteudo':[H+'agenda.txt','0 3 * * *']},'Primeira regra gravada.'),
 S('Acrescente a regra: toda segunda às 8h, o mesmo script','Use >>: echo "0 8 * * 1 /home/aluno/backup.sh" >> agenda.txt',{'conteudo':[H+'agenda.txt','0 8 * * 1']}),
 S('Instale a agenda com o crontab','crontab agenda.txt',{'cmd':'^\\s*crontab\\s+agenda\\.txt'},'Agenda instalada.'),
 S('Confirme listando a agenda instalada','crontab -l',{'saida':'0 8 \\* \\* 1'},'A agenda está valendo.')],
 fs={H+'backup.sh':'#!/bin/bash\ncp -r docs backup/'},
 conclusao='Você escreveu e instalou regras de agendamento',explicacao='Cada regra tem 5 campos de tempo e o comando. crontab arquivo instala a agenda e crontab -l confirma.',final='Backup agendado!'),
C('lx_busca','Caça ao arquivo','Buscar e medir','Alguém perdeu um arquivo e o servidor está sem espaço. Ache o arquivo e veja o disco.',[
 S('Ache todos os arquivos .log dentro de /var','find /var -name "*.log"',{'cmd':'^\\s*find\\s+/var\\s+-name\\s+\\S*\\.log'}),
 S('Ache o arquivo notas.txt a partir da sua pasta','find . -name notas.txt',{'saida':'notas\\.txt'},'Achou o notas.txt.'),
 S('Conte quantos .log existem em /var (use um pipe)','find /var -name "*.log" | wc -l',{'cmd':'^\\s*find\\s+.*\\|\\s*wc\\s+-l'},'São 3 logs.'),
 S('Veja o espaço livre dos discos','df -h',{'cmd':'^\\s*df\\s+-\\w*h'},'O disco principal está em 62%.')],
 fs={'/var/log/app.log':'INFO ok','/var/log/sistema.log':'INFO boot','/var/log/rede.log':'INFO link',H+'docs/notas.txt':'reunião às 15h',H+'projetos/site/index.html':'<h1>oi</h1>'},
 conclusao='Você achou arquivos com find e conferiu o disco com df',explicacao='find procura por nome a partir de uma pasta, o pipe com wc -l conta os resultados e df -h mostra o espaço dos discos.',final='Arquivo encontrado!'),
C('lx_remoto','Acesso ao servidor','Acesso remoto (SSH)','Você precisa mandar um relatório para o servidor da matriz, sem sair do terminal.',[
 S('Veja se o servidor.local responde','ping servidor.local',{'cmd':'^\\s*ping\\s+(-\\w+\\s+\\d+\\s+)?servidor\\.local'}),
 S('Gere o seu par de chaves','ssh-keygen',{'cmd':'^\\s*ssh-keygen'},'Par de chaves criado.'),
 S('Conecte-se ao servidor.local como admin','ssh admin@servidor.local',{'ssh':'servidor.local'},'Conectado!'),
 S('Envie o relatorio.txt para a pasta /tmp/ do servidor','scp relatorio.txt admin@servidor.local:/tmp/',{'scp':'servidor.local'},'Arquivo enviado.')],
 rede={'ip':'192.168.0.15','hosts':{'servidor.local':'3.1'}},ssh={'servidor.local':['admin']},
 fs={H+'relatorio.txt':'vendas do mês: 128'},
 conclusao='Você testou, conectou e enviou um arquivo pelo ssh',explicacao='ping testa o servidor, ssh-keygen cria as chaves, ssh entra no servidor e scp copia arquivos pela rede.',final='Relatório enviado!'),
]
R3={'lx_script':['echo "#!/bin/bash" > ola.sh','echo "echo Ola Pingo" >> ola.sh','chmod +x ola.sh','./ola.sh'],
'lx_agenda':['echo "0 3 * * * /home/aluno/backup.sh" > agenda.txt','echo "0 8 * * 1 /home/aluno/backup.sh" >> agenda.txt','crontab agenda.txt','crontab -l'],
'lx_busca':['find /var -name "*.log"','find . -name notas.txt','find /var -name "*.log" | wc -l','df -h'],
'lx_remoto':['ping servidor.local','ssh-keygen','ssh admin@servidor.local','scp relatorio.txt admin@servidor.local:/tmp/']}
G3={'lx_script':[['echo "texto" > arq','grava a primeira linha'],['echo "texto" >> arq','acrescenta uma linha'],['chmod +x arq','libera a execução'],['./arq','executa o script']],
'lx_agenda':[['echo "regra" > arq','grava a primeira regra'],['echo "regra" >> arq','acrescenta outra regra'],['crontab arq','instala a agenda'],['crontab -l','mostra a agenda']],
'lx_busca':[['find pasta -name "*.log"','procura por nome'],['find . -name arq','procura a partir daqui'],['comando | wc -l','conta os resultados'],['df -h','mostra o espaço dos discos']],
'lx_remoto':[['ping destino','testa se responde'],['ssh-keygen','cria o par de chaves'],['ssh usuario@servidor','entra no servidor'],['scp arq usuario@servidor:/pasta/','copia o arquivo']]}
for c in CASOS3:
    for p,r in zip(c['passos'],R3[c['id']]): p['resposta']=r
    c['guia']=[{'cmd':a,'serve':b} for a,b in G3[c['id']]]
