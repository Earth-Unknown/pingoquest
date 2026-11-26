// Modo dono: ferramentas de teste só para quem digita o código neste aparelho (mesmo código e mesma chave do jogo antigo).
const ADM_HASH = '263fc03b796c5d74b9e69622e57a4c1f1f5308d1ccc1f171c8d7a6ce80f8c5e4'
const KEY = 'pingoquest-adm'
export function isDono(): boolean { try { return localStorage.getItem(KEY) === '1' } catch { return false } }
export function sairDono() { try { localStorage.removeItem(KEY) } catch { /* sem armazenamento */ } }
export async function entrarDono(codigo: string): Promise<boolean> {
  if (!globalThis.crypto?.subtle) return false
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codigo))
  const hex = Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('')
  if (hex !== ADM_HASH) return false
  try { localStorage.setItem(KEY, '1') } catch { /* sem armazenamento */ }
  return true
}
