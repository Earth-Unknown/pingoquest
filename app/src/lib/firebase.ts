import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, browserPopupRedirectResolver, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth'

// Config do app web do projeto pingoquest. Valores públicos (identificam o projeto, não dão acesso):
// quem protege os dados são as regras do Firebase e a API, então não vão para variáveis de ambiente.
const app = initializeApp({
  apiKey: 'AIzaSyBttz-XK0cXidu0cVraqAIx_j4WtGdQdms',
  authDomain: 'pingoquest.firebaseapp.com',
  projectId: 'pingoquest',
  appId: '1:218901026072:web:859e8c1485d2f4fb01ba6d',
  messagingSenderId: '218901026072',
  storageBucket: 'pingoquest.firebasestorage.app',
})

// Sessão persistida no navegador (IndexedDB, com localStorage de reserva).
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  popupRedirectResolver: browserPopupRedirectResolver,
})
