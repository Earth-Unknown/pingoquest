def L(t,x,termos): return {'tipo':'aprender','titulo':t,'texto':x,'termos':[{'termo':a,'definicao':b} for a,b in termos]}
def _c(o,e,c,d):
    o['explicacao']=e;o['conceito']=c;o['dificuldade']=d;return o
def E(c,p,certa,err,e,d=1): return _c({'tipo':'escolha','pergunta':p,'certa':certa,'erradas':err},e,c,d)
def V(c,p,r,e,d=1): return _c({'tipo':'verdadeiro_falso','pergunta':p,'resposta':r},e,c,d)
def LG(c,p,pares,e,d=1): return _c({'tipo':'ligar','pergunta':p,'pares':[{'esquerda':a,'direita':b} for a,b in pares]},e,c,d)
def CL(c,p,cats,itens,e,d=1): return _c({'tipo':'classificar','pergunta':p,'categorias':cats,'itens':[{'texto':a,'categoria':b} for a,b in itens]},e,c,d)
def fase(nome,cid,cnome,antes,itens): return {'nome':nome,'conceitos':[{'id':cid,'nome':cnome,'antes':antes}],'itens':itens}
