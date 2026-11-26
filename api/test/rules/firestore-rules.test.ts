import { readFileSync } from 'node:fs'
import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  collectionGroup,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-pingoquest',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await setDoc(doc(db, 'users/owner'), { nick: 'dona', isAnonymous: false, lastSeenAt: 1 })
    await setDoc(doc(db, 'users/owner/data/progress'), { rev: 1, miss: { q1: 2 } })
    await setDoc(doc(db, 'users/owner/data/game'), { gems: 50 })
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

  describe.each(contexts)('B1: dados do aluno, %s', (_label, getContext) => {
    test('não lê progress nem game do dono', async () => {
      const db = getContext().firestore()

      await assertFails(getDoc(doc(db, 'users/owner/data/progress')))
      await assertFails(getDoc(doc(db, 'users/owner/data/game')))
    })

    test('não escreve, altera nem apaga progress e game', async () => {
      const db = getContext().firestore()

      await assertFails(setDoc(doc(db, 'users/owner/data/progress'), { rev: 99 }))
      await assertFails(updateDoc(doc(db, 'users/owner/data/progress'), { rev: 99 }))
      await assertFails(setDoc(doc(db, 'users/owner/data/game'), { gems: 999999 }))
      await assertFails(deleteDoc(doc(db, 'users/owner/data/progress')))
    })

    test('não lista a subcoleção data nem consulta pelo collection group', async () => {
      const db = getContext().firestore()

      await assertFails(getDocs(collection(db, 'users/owner/data')))
      await assertFails(getDocs(collectionGroup(db, 'data')))
      await assertFails(getDocs(query(collection(db, 'users'), where('isAnonymous', '==', true))))
    })

    test('não acessa ledger, events nem mergeIntents', async () => {
      const db = getContext().firestore()

      await assertFails(getDoc(doc(db, 'users/owner/ledger/starter')))
      await assertFails(setDoc(doc(db, 'users/owner/ledger/starter'), { delta: { chips: 999 } }))
      await assertFails(setDoc(doc(db, 'users/owner/events/rede-conectada'), { pieces: 9 }))
      await assertFails(setDoc(doc(db, 'mergeIntents/x'), { fromUid: 'owner' }))
    })
  })

  test('os documentos semeados continuam intactos', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore()
      expect((await getDoc(doc(db, 'users/owner'))).data()).toEqual({ nick: 'dona', isAnonymous: false, lastSeenAt: 1 })
      expect((await getDoc(doc(db, 'users/owner/data/progress'))).data()).toEqual({ rev: 1, miss: { q1: 2 } })
      expect((await getDoc(doc(db, 'users/owner/data/game'))).data()).toEqual({ gems: 50 })
    })
  })
})
