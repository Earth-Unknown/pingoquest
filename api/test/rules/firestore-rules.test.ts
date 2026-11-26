import { readFileSync } from 'node:fs'
import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-pingoquest',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users/owner'), { nick: 'dona' })
  })
})

afterAll(async () => {
  await env.cleanup()
})

describe('firestore.rules: tudo negado ao cliente', () => {
  const contexts = [
    ['anônimo (sem login)', () => env.unauthenticatedContext()],
    ['convidado autenticado', () => env.authenticatedContext('guest', { firebase: { sign_in_provider: 'anonymous' } })],
    ['conta Google dona do documento', () => env.authenticatedContext('owner')],
    ['admin com claim', () => env.authenticatedContext('admin', { admin: true })],
  ] as const

  describe.each(contexts)('%s', (_label, getContext) => {
    test('não lê o próprio documento nem de outro usuário', async () => {
      const db = getContext().firestore()

      await assertFails(getDoc(doc(db, 'users/owner')))
      await assertFails(getDoc(doc(db, 'users/outro')))
    })

    test('não lista coleções', async () => {
      const db = getContext().firestore()

      await assertFails(getDocs(collection(db, 'users')))
      await assertFails(getDocs(collection(db, 'gifts')))
    })

    test('não cria nem altera nem apaga', async () => {
      const db = getContext().firestore()

      await assertFails(setDoc(doc(db, 'users/owner'), { nick: 'hack' }))
      await assertFails(setDoc(doc(db, 'users/novo/data/wallet'), { chips: 999999 }))
      await assertFails(deleteDoc(doc(db, 'users/owner')))
    })
  })

  test('o documento semeado continua intacto', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      const snap = await getDoc(doc(context.firestore(), 'users/owner'))
      expect(snap.data()).toEqual({ nick: 'dona' })
    })
  })
})
