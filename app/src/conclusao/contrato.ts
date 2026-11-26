// Contrato da nova conclusão de lição ("Pingo descobriu!"): dados e tipos compartilhados.
// A ARTE (Invencao.tsx) e a CENA (CenaConclusao.tsx) só conversam por aqui.

/** Um módulo da invenção: o que o Pingo encaixa a cada lição concluída */
export type Modulo = { id: string; nome: string }

/** Uma invenção completa de um mundo. Cada parada tem 4 etapas (3 lições + prova/caso), então 4 módulos. */
export type InvencaoDef = { id: string; nome: string; modulos: Modulo[] }

/** Invenção do mundo de Redes. Outros cursos entram aqui no futuro, com a mesma estrutura. */
export const ESTACAO_PINGO: InvencaoDef = {
  id: 'estacao-pingo',
  nome: 'Estação Pingo',
  modulos: [
    { id: 'antena', nome: 'Antena' },
    { id: 'portas', nome: 'Portas de rede' },
    { id: 'luz', nome: 'Luz de status' },
    { id: 'conexao', nome: 'Conexão' },
  ],
}

/** Posição do centro de cada encaixe, em % da largura/altura da área da invenção (para a cena animar a peça até lá) */
export type Encaixe = { x: number; y: number }

/** Dados da conclusão de uma lição normal (tudo já foi gravado antes: a cena só mostra) */
export type ConclusaoProps = {
  S: any                 // save, só para o Pingo usar o avatar equipado
  invencao: InvencaoDef
  indice: number         // qual módulo encaixa agora (0 a 3)
  repeticao: boolean     // lição já feita antes: o Pingo só confere, sem peça nova
  titulo: string         // ex.: "Lição concluída!"
  subtitulo?: string     // ex.: "Mais uma descoberta!"
  xp: number             // energia ganha (já aplicada)
  chips: number          // chips ganhos (já aplicados)
  acertos?: number       // precisão 0 a 100 (opcional, discreta)
  onContinuar: () => void
}
