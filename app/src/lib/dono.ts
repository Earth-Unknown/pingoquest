// Modo dono: ferramentas de teste só para quem digita o código neste aparelho (mesmo código e mesma chave do jogo antigo).
const ADM_HASH = '4d11a8a2cee44ffd1ceeefbfe851afb97726d432b2c456efd967804b9d1503d9'
const KEY = 'pingoquest-adm'
export function isDono(): boolean { try { return localStorage.getItem(KEY) === '1' } catch { return false } }
export function sairDono() { try { localStorage.removeItem(KEY) } catch { /* sem armazenamento */ } }
export async function entrarDono(codigo: string): Promise<boolean> {
  if (!globalThis.crypto?.subtle) return false
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codigo.trim()))
  const hex = Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('')
  if (hex !== ADM_HASH) return false
  try { localStorage.setItem(KEY, '1') } catch { /* sem armazenamento */ }
  return true
}
