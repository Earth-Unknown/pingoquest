import json,sys
sys.path.insert(0,'/tmp/lx')
from h import *
import p1,p2,p3
from casos import CASOS
from casos3 import CASOS3
CASOS=CASOS+CASOS3
P=p1.P+p2.P+p3.P
BB=[
('linux.def','O que é o Linux?','Um sistema operacional livre',['Um navegador','Um cabo de rede']),
('linux.def','O que é o kernel?','O núcleo do sistema',['O teclado','A tela']),
('linux.livre','O que quer dizer código aberto?','Qualquer pessoa pode ler o código',['Só a empresa vê','Ninguém vê']),
('linux.distro','O que é uma distribuição?','Linux + programas, pronto para usar',['Um cabo','Uma senha']),
('linux.distro','Cite uma distribuição Linux.','Ubuntu',['Excel','Chrome']),
('linux.terminal','O que é o terminal?','A janela onde se digitam comandos',['Um cabo','Um roteador']),
('linux.terminal','O que é o shell?','O programa que entende os comandos',['Uma pasta','Um monitor']),
('linux.comando','Em «ls -l», o que é -l?','Uma opção',['O nome','O argumento']),
('linux.prompt','O que o $ no prompt indica?','Usuário comum',['Administrador','Erro']),
('linux.prompt','O que o # no prompt indica?','Administrador (root)',['Usuário comum','Rede caiu']),
('linux.arvore','Qual é a raiz do sistema?','/',['~','..']),
('linux.arvore','Qual pasta guarda as configurações?','/etc',['/home','/tmp']),
('linux.arvore','Qual pasta guarda as pastas das pessoas?','/home',['/etc','/var']),
('linux.caminho','O que é caminho absoluto?','O que começa na raiz',['O que é curto','O que não existe']),
('linux.atalhos','O que é ~?','Sua pasta pessoal',['A raiz','A pasta de cima']),
('linux.atalhos','O que é ..?','A pasta de cima',['A pasta atual','Sua pasta pessoal']),
('linux.atalhos','O que o pwd mostra?','A pasta atual',['Os arquivos','O usuário']),
('linux.atalhos','Qual comando muda de pasta?','cd',['ls','cp']),
('linux.criar','Qual comando cria uma pasta?','mkdir',['touch','rm']),
('linux.criar','Qual comando cria um arquivo vazio?','touch',['mkdir','ls']),
('linux.criar','Qual comando lista o conteúdo?','ls',['cd','mv']),
('linux.copiar','Qual comando copia?','cp',['mv','rm']),
('linux.copiar','Qual comando move ou renomeia?','mv',['cp','cat']),
('linux.apagar','Qual comando apaga arquivos?','rm',['mv','cp']),
('linux.apagar','O que o rm -r faz?','Apaga pasta e conteúdo',['Cria pasta','Renomeia']),
('linux.ler','Qual comando mostra o arquivo inteiro?','cat',['head','touch']),
('linux.ler','Qual mostra o fim do arquivo?','tail',['head','cat']),
('linux.grep','Qual comando procura texto?','grep',['cat','cp']),
('linux.grep','Qual comando conta linhas?','wc -l',['grep','ls']),
('linux.redir','O que faz o >?','Grava a saída num arquivo',['Liga dois comandos','Apaga a tela']),
('linux.redir','O que faz o >>?','Acrescenta ao fim do arquivo',['Substitui o arquivo','Apaga o arquivo']),
('linux.pipe','O que faz o | (pipe)?','Liga a saída de um comando ao próximo',['Grava num arquivo','Apaga arquivos']),
('linux.perm','O que é a permissão x?','Executar',['Ler','Escrever']),
('linux.perm','O que é a permissão r?','Ler',['Executar','Escrever']),
('linux.chmod','Qual comando muda permissões?','chmod',['mv','grep']),
('linux.user','Quem é o root?','O administrador',['Uma pasta','Um cabo']),
('linux.user','Qual comando diz quem você é?','whoami',['pwd','ls']),
('linux.sudo','Para que serve o sudo?','Rodar um comando como administrador',['Criar pastas','Contar linhas']),
('linux.proc','O que é um processo?','Um programa em execução',['Uma pasta','Um cabo']),
('linux.proc','Qual comando encerra um processo?','kill',['ls','cat']),
('linux.pacote','Qual comando instala programas no Ubuntu?','apt install',['ls install','cp install']),
('linux.buscar','Qual comando procura pacotes?','apt search',['apt look','ls pacote']),
('linux.buscar','Qual comando instala um programa?','sudo apt install',['sudo apt search','cat apt']),
('linux.remover','Qual comando desinstala um programa?','sudo apt remove',['sudo apt install','rm apt']),
('linux.script','Qual comando executa o script ola.sh?','./ola.sh',['ola.sh run','cd ola.sh']),
('linux.var','Como mostrar a variável nome?','echo $nome',['echo nome','print nome']),
('linux.cron','O que significa 0 3 * * *?','Todo dia às 3h',['A cada 3 minutos','Só em março']),
('linux.crontab','Qual comando mostra a agenda do cron?','crontab -l',['crontab -e','cron show']),
('linux.find','Qual comando procura arquivos por nome?','find',['cat','cd']),
('linux.disco','Qual comando mostra o espaço dos discos?','df -h',['ps -h','kill -h']),
('linux.ssh','Qual comando acessa outro computador?','ssh',['scp','ping']),
('linux.chaves','Qual comando copia um arquivo pela rede?','scp',['ssh','cp']),
('linux.ip','Qual comando mostra seus IPs?','ip a',['pwd','mv']),
('linux.ip','O que é 127.0.0.1?','A própria máquina',['O roteador','A internet']),
('linux.ping','Para que serve o ping?','Testar se o destino responde',['Apagar arquivos','Criar usuários']),
('linux.ping','Para que serve o curl?','Buscar uma página ou serviço',['Copiar pastas','Criar grupos']),
]
bb=[{'tipo':'escolha','pergunta':p,'certa':c,'erradas':e,'explicacao':'Resposta: '+c+'.','conceito':k,'dificuldade':1} for k,p,c,e in BB]
d={'formato':1,'id':'linux','nome':'Terminal Linux','mundos':[{'numero':1,'nome':'Servidor Pingo','subtitulo':'Aprenda a conversar com o terminal','paradas':P}],'bate_bola':bb,'casos':CASOS,'eventos':[],'artes':{},'nivelamento':[{'pergunta':a,'certa':c,'erradas':e,'explicacao':x} for a,c,e,x in [('Para que serve o terminal?','Para digitar comandos e o computador executar',['Para desenhar imagens','Para esfriar o computador'],'No terminal você escreve comandos e o sistema obedece.'),('Qual comando mostra em que pasta você está?','pwd',['mkdir','rm'],'pwd mostra a pasta atual.'),('O que o comando rm faz?','Apaga arquivos',['Renomeia arquivos','Copia arquivos'],'rm remove, e no terminal não existe lixeira.')]]}
json.dump(d,open('/home/claude/pingoquest/content/linux.json','w'),ensure_ascii=False,indent=1)
